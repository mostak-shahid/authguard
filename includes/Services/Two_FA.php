<?php
namespace MosPress\Authpress\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Two_FA
{
    private $options;
	// config
	private $transient_prefix = 'authguard_2fa_';
	private $attempt_meta_key = 'authguard_2fa_attempts';
	private $cookie_name = 'authguard_2fa_pending';
	private $code_ttl = 300; // seconds (5 minutes)
	private $max_attempts = 5;
	private $bypass_admins = false; // set false to require 2FA for admins
	private $pending_user_id = 0;
	private $login_notice_message = '';
	private $login_notice_is_error = false;

	public function __construct() {
		$this->options = authguard_get_option();
		$two_fa_authentication_settings_enabled = (
				isset($this->options['two_fa_authentication']['settings']['enabled']) &&
				!empty($this->options['two_fa_authentication']['settings']['enabled'])
			) ? sanitize_text_field(wp_unslash($this->options['two_fa_authentication']['settings']['enabled'])) : false;
		
		if ($two_fa_authentication_settings_enabled) {		
			add_action( 'wp_login', [ $this, 'on_wp_login' ], 10, 2 );
			add_action( 'template_redirect', [ $this, 'maybe_show_2fa_form' ] );
			add_action( 'login_init', [ $this, 'prepare_login_screen' ] );
			add_action( 'login_enqueue_scripts', [ $this, 'enqueue_login_styles' ] );
			add_filter( 'login_message', [ $this, 'filter_login_message' ] );
			add_action( 'admin_post_nopriv_verify_email_2fa', [ $this, 'handle_verify' ] );
			add_action( 'admin_post_nopriv_resend_email_2fa', [ $this, 'handle_resend' ] );
			add_action( 'admin_post_verify_email_2fa', [ $this, 'handle_verify' ] );
			add_action( 'admin_post_resend_email_2fa', [ $this, 'handle_resend' ] );
			// Clean up cookie on logout
			add_action( 'wp_logout', [ $this, 'clear_pending_cookie' ] );
		}
	}

	/**
	 * After WP authenticates a user, generate and email a code, log the user out and redirect to the OTP form.
	 *
	 * @param string  $user_login
	 * @param WP_User $user
	 */
	public function on_wp_login( $user_login, $user ) {
		$user_id = $user->ID;

		// Optionally bypass admins
		if ( $this->bypass_admins && user_can( $user, 'manage_options' ) ) {
			return;
		}

		// generate code
		$code = $this->generate_code();
		// hash code for storage
		$hashed = wp_hash_password( $code );

		// store hashed code in transient
		$transient_key = $this->transient_prefix . $user_id;
		set_transient( $transient_key, $hashed, $this->code_ttl );

		// reset attempts meta
		delete_user_meta( $user_id, $this->attempt_meta_key );

		// send email
		$this->send_code_email( $user, $code );

		// log 2fa code sent
		$this->log_2fa_event( $user_id, 'email', 'sent', $hashed, time() + $this->code_ttl );

		// set cookie to indicate pending 2FA; cookie value is user id XORed with site salt to be slightly obfuscated
		$cookie_val = $this->cookie_value_for_user( $user_id );
		setcookie( $this->cookie_name, $cookie_val, time() + $this->code_ttl, COOKIEPATH ?: '/', COOKIE_DOMAIN, is_ssl(), true );

		// log out the current session
		wp_logout();

		// redirect to wp-login.php with query param
		$redirect = add_query_arg( 'email_2fa', '1', wp_login_url() );
		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * Show the OTP entry form when ?email_2fa=1 is present and a pending cookie exists.
	 */
	public function maybe_show_2fa_form() {
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

		if ( strpos( $request_uri, '/authguard-2fa-verification' ) === false ) {
			return;
		}

		$args = [ 'email_2fa' => '1' ];
		if ( isset( $_GET['authguard_2fa_notice_key'] ) ) {
			$args['authguard_2fa_notice_key'] = sanitize_text_field( wp_unslash( $_GET['authguard_2fa_notice_key'] ) );
		}

		wp_safe_redirect( add_query_arg( $args, wp_login_url() ) );
		exit;
	}

	public function prepare_login_screen() {
		if ( empty( $_GET['email_2fa'] ) ) {
			return;
		}

		if ( ! empty( $_GET['authguard_2fa_notice_key'] ) ) {
			$key     = sanitize_text_field( wp_unslash( $_GET['authguard_2fa_notice_key'] ) );
			$payload = get_transient( 'authguard_2fa_notice_' . $key );
			if ( is_array( $payload ) ) {
				$this->login_notice_message   = isset( $payload['message'] ) ? $payload['message'] : '';
				$this->login_notice_is_error  = ! empty( $payload['is_error'] );
				delete_transient( 'authguard_2fa_notice_' . $key );
			}
		}

		if ( empty( $_COOKIE[ $this->cookie_name ] ) ) {
			if ( empty( $this->login_notice_message ) ) {
				$this->login_notice_message  = __( 'No pending 2FA session found. Please log in again.', 'authguard' );
				$this->login_notice_is_error = true;
			}
			return;
		}

		$user_id = isset($_COOKIE[ $this->cookie_name ])?$this->user_id_from_cookie( sanitize_text_field(wp_unslash($_COOKIE[ $this->cookie_name ])) ):0;
		if ( ! $user_id || ! get_user_by( 'ID', $user_id ) ) {
			$this->login_notice_message  = __( 'Invalid 2FA session. Please log in again.', 'authguard' );
			$this->login_notice_is_error = true;
			$this->clear_pending_cookie();
			return;
		}

		$this->pending_user_id = $user_id;
	}

	public function enqueue_login_styles() {
		if ( $this->pending_user_id <= 0 ) {
			return;
		}
		?>
		<style id="authguard-2fa-login-styles">
			#loginform { display: none !important; }			
		</style>
		<?php
	}

	public function filter_login_message( $message ) {
		if ( empty( $_GET['email_2fa'] ) ) {
			return $message;
		}

		if ( $this->pending_user_id <= 0 ) {
			if ( empty( $this->login_notice_message ) ) {
				return $message;
			}
			$notice_class = $this->login_notice_is_error ? 'message error' : 'message';
			$notice_html  = sprintf( '<p class="%s">%s</p>', esc_attr( $notice_class ), esc_html( $this->login_notice_message ) );
			return $notice_html . $message;
		}

		$notice_html = '';
		if ( ! empty( $this->login_notice_message ) ) {
			$notice_class = $this->login_notice_is_error ? 'message error' : 'message';
			$notice_html   = sprintf( '<p class="%s">%s</p>', esc_attr( $notice_class ), esc_html( $this->login_notice_message ) );
		}

		$instruction_html = sprintf( '<p class="message">%s</p>', esc_html__( 'Enter the 6-digit verification code we sent to your email address.', 'authguard' ) );

		return $notice_html . $instruction_html . $this->get_2fa_form_markup();
	}

	private function get_2fa_form_markup() {
		if ( $this->pending_user_id <= 0 ) {
			return '';
		}

		ob_start();
		?>
		<div class="authguard-2fa-wrapper" role="main">
			<form class="authguard-2fa-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="verify_email_2fa" />
				<?php wp_nonce_field( 'verify_email_2fa' ); ?>
				<p>
					<label for="authguard-2fa-code"><?php echo esc_html__( 'Two-factor verification', 'authguard' ); ?></label>
					<input id="authguard-2fa-code" name="email_2fa_code" type="text" inputmode="numeric" pattern="\d{6}" maxlength="6" autocomplete="one-time-code" placeholder="123456" required />
				</p>	
				<div class="authguard-2fa-submit">
					<button class="button button-primary button-large" type="submit"><?php echo esc_html__( 'Verify code', 'authguard' ); ?></button>
				</div>
				<p><?php echo esc_html__( 'We sent a verification code to the email address associated with your account. Enter the code below to finish signing in. This code will expire in 5 minutes.', 'authguard' ); ?></p>
			</form>
			<form class="authguard-2fa-secondary" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="resend_email_2fa" />
				<?php wp_nonce_field( 'resend_email_2fa' ); ?>
				<button class="button" type="submit"><?php echo esc_html__( 'Resend code', 'authguard' ); ?></button>
				<p class="authguard-2fa-help"><?php echo esc_html__( 'Need to try again?', 'authguard' ); ?></p>
			</form>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Handle verification POST (admin_post endpoint).
	 */
	public function handle_verify() {
		if (isset( $_POST['_wpnonce'] ) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'verify_email_2fa' ) ) {

			$email_2fa_code = isset( $_POST['email_2fa_code'] ) ? sanitize_text_field( wp_unslash( $_POST['email_2fa_code'] ) ) : '';

			if ( ! isset( $email_2fa_code ) || ! isset( $_COOKIE[ $this->cookie_name ] ) ) {
				wp_safe_redirect( add_query_arg( 'email_2fa', '1', wp_login_url() ) );
				exit;
			}
			$cookie_val = isset($_COOKIE[ $this->cookie_name ])?sanitize_text_field(wp_unslash($_COOKIE[ $this->cookie_name ])):'';
			$user_id    = $this->user_id_from_cookie( $cookie_val );
			if ( ! $user_id ) {
				$this->render_message_page( 'Invalid 2FA session. Please log in again.' );
				exit;
			}

			$input_code = preg_replace( '/\D/', '', $email_2fa_code );
			if ( empty( $input_code ) ) {
				$this->render_message_page( 'Please enter the code you received by email.' );
				exit;
			}

			$transient_key = $this->transient_prefix . $user_id;
			$stored_hash   = get_transient( $transient_key );

			if ( ! $stored_hash ) {
				$this->log_2fa_event( $user_id, 'email', 'expired', null, time(), null, 1 );
				$this->render_message_page( 'Your code has expired. Please request a new code.' );
				exit;
			}

			// Protect against brute force: count attempts
			$attempts = (int) get_user_meta( $user_id, $this->attempt_meta_key, true );
			if ( $attempts >= $this->max_attempts ) {
				// remove transient to force resend
				delete_transient( $transient_key );
				$this->log_2fa_event( $user_id, 'email', 'failed', $stored_hash, time(), null, $attempts + 1 );
				$this->render_message_page( 'Too many failed attempts. A new code is required. Please click "Resend".' );
				exit;
			}

			// verify - wp_check_password works: first arg plaintext, second stored hash
			$ok = wp_check_password( $input_code, $stored_hash );

			if ( $ok ) {
				// log successful verification
				$this->log_2fa_event( $user_id, 'email', 'verified', $stored_hash, time(), current_time( 'mysql' ), $attempts );

				// success: delete transient and attempts, clear cookie, log in user programmatically
				delete_transient( $transient_key );
				delete_user_meta( $user_id, $this->attempt_meta_key );
				// clear cookie
				$this->clear_pending_cookie();

				wp_set_current_user( $user_id );
				// honor "remember me"? we can't detect original remember easily; set session cookie (false for remember)
				wp_set_auth_cookie( $user_id, true ); // choose true to keep user logged in; change as wanted

				// redirect to originally requested page or dashboard
				$redirect_to = admin_url();
				wp_safe_redirect( $redirect_to );
				exit;
			} else {
				$attempts++;
				update_user_meta( $user_id, $this->attempt_meta_key, $attempts );
				$this->log_2fa_event( $user_id, 'email', 'failed', $stored_hash, time(), null, $attempts );
				if ( $attempts >= $this->max_attempts ) {
					delete_transient( $transient_key );
					$this->render_message_page( 'Too many failed attempts. A new code is required. Please click "Resend".' );
					exit;
				}
				$this->render_message_page( 'Incorrect code. Attempts: '. $attempts . ' / ' . $this->max_attempts .'.', true );
				exit;
			}

		}
		// nonce check
		else {
			$this->render_message_page( 'Security check failed. Please try again.' );
			exit;
		}
	}

	/**
	 * Handle resend request.
	 */
	public function handle_resend() {
		// nonce check
		if (isset( $_POST['_wpnonce'] ) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'resend_email_2fa' ) ) {

			$cookie_name = isset($_COOKIE[ $this->cookie_name ])?sanitize_text_field(wp_unslash($_COOKIE[ $this->cookie_name ])):'';

			if ( empty( $cookie_name ) ) {
				$this->render_message_page( 'No pending 2FA session found. Please log in again.' );
				exit;
			}

			$user_id = $this->user_id_from_cookie( $cookie_name );
			if ( ! $user_id ) {
				$this->render_message_page( 'Invalid 2FA session. Please log in again.' );
				exit;
			}

			$user = get_user_by( 'ID', $user_id );
			if ( ! $user ) {
				$this->render_message_page( 'Invalid user. Please log in again.' );
				exit;
			}

			// generate a fresh code
			$code = $this->generate_code();
			$hashed = wp_hash_password( $code );
			set_transient( $this->transient_prefix . $user_id, $hashed, $this->code_ttl );

			// reset attempts
			delete_user_meta( $user_id, $this->attempt_meta_key );

			// send email
			$this->send_code_email( $user, $code );

			// log 2fa code resent
			$this->log_2fa_event( $user_id, 'email', 'sent', $hashed, time() + $this->code_ttl );

			$this->render_message_page( 'A new code was sent to your email address.' );
		} else {
			$this->render_message_page( 'Security check failed. Please try again.' );
		}
		exit;
	}

	/**
	 * Generate a 6-digit code.
	 *
	 * @return string
	 */
	private function generate_code() {
		$min = 100000;
		$max = 999999;
		// random_int is cryptographically secure
		return (string) random_int( $min, $max );
	}

	/**
	 * Send OTP email.
	 *
	 * @param WP_User $user
	 * @param string  $code
	 */
	private function send_code_email( $user, $code ) {
		$to      = $user->user_email;
		$subject = sprintf( '[%s] Your login verification code', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) );
		$body    = sprintf( "Hello %s,\n\nA login to your account requires a verification code.\n\nYour code: %s\n\nThis code will expire in %d minutes.\n\nIf you did not request this code, please contact the site administrator.", $user->display_name ?: $user->user_login, $code, intval( $this->code_ttl / 60 ) );

		$headers = [ 'Content-Type: text/plain; charset=UTF-8' ];

		// Use wp_mail; for reliability you should configure SMTP on the site.
		wp_mail( $to, $subject, $body, $headers );
	}


	/**
	 * Helper to render a small message page.
	 *
	 * @param string $message
	 * @param bool   $is_error
	 */
	private function render_message_page( $message, $is_error = false ) {
		$this->redirect_to_login_notice( $message, $is_error );
	}

	private function redirect_to_login_notice( $message, $is_error = false ) {
		$payload = [
			'message'  => sanitize_textarea_field( $message ),
			'is_error' => $is_error ? 1 : 0,
		];
		$key = wp_generate_uuid4();
		set_transient( 'authguard_2fa_notice_' . $key, $payload, MINUTE_IN_SECONDS );
		$args = [
			'email_2fa'             => '1',
			'authguard_2fa_notice_key' => $key,
		];
		wp_safe_redirect( add_query_arg( $args, wp_login_url() ) );
		exit;
	}

	/**
	 * Create cookie value for a user id (obfuscation).
	 */
	private function cookie_value_for_user( $user_id ) {
		$salt = wp_salt( 'auth' );
		$val  = $user_id ^ crc32( $salt );
		return base64_encode( $val );
	}

	/**
	 * Extract user id from cookie value.
	 */
	private function user_id_from_cookie( $cookie_val ) {
		$decoded = base64_decode( $cookie_val, true );
		if ( $decoded === false ) {
			return false;
		}
		$salt = wp_salt( 'auth' );
		$val  = intval( $decoded );
		$user_id = $val ^ crc32( $salt );
		if ( $user_id <= 0 ) {
			return false;
		}
		return $user_id;
	}

	/**
	 * Clear the pending cookie.
	 */
	public function clear_pending_cookie() {
		if ( isset( $_COOKIE[ $this->cookie_name ] ) ) {
			unset( $_COOKIE[ $this->cookie_name ] );
			// clear cookie on client
			setcookie( $this->cookie_name, '', time() - 3600, COOKIEPATH ?: '/', COOKIE_DOMAIN, is_ssl(), true );
		}
	}

	/**
	 * Log 2FA event to the database.
	 *
	 * @param int    $user_id    User ID
	 * @param string $method     2FA method (email, sms, whatsapp, totp, hotp, backup_code)
	 * @param string $status     Status (sent, verified, failed, expired)
	 * @param string $code_hash  Hashed code
	 * @param int    $expires_at Expiration timestamp
	 * @param string $verified_at Verification datetime
	 * @param int    $attempts   Number of attempts
	 * @return int|false The ID of the inserted log, or false on failure
	 */
	private function log_2fa_event( $user_id, $method, $status, $code_hash = null, $expires_at = null, $verified_at = null, $attempts = 0 ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'authguard_2fa_logs';

		$ip_address = $this->get_client_ip();
		$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';

		$expires_at_dt = $expires_at ? gmdate( 'Y-m-d H:i:s', $expires_at ) : null;

		$data = array(
			'user_id'     => $user_id,
			'method'      => in_array( $method, array( 'email', 'sms', 'whatsapp', 'totp', 'hotp', 'backup_code' ) ) ? $method : 'email',
			'status'      => in_array( $status, array( 'sent', 'verified', 'failed', 'expired' ) ) ? $status : 'sent',
			'code_hash'   => $code_hash,
			'expires_at'  => $expires_at_dt,
			'verified_at' => $verified_at,
			'ip_address'  => $ip_address,
			'user_agent'  => $user_agent,
			'attempts'    => absint( $attempts ),
		);

		$format = array(
			'%d',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%d',
		);

		$result = $wpdb->insert( $table_name, $data, $format );

		return $result ? $wpdb->insert_id : false;
	}

	/**
	 * Get client IP address.
	 *
	 * @return string
	 */
	private function get_client_ip() {
		$ip_keys = array( 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR' );

		foreach ( $ip_keys as $key ) {
			if ( array_key_exists( $key, $_SERVER ) === true ) {
				foreach ( explode( ',', sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) ) ) as $ip ) {
					$ip = trim( $ip );
					if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) !== false ) {
						return $ip;
					}
				}
			}
		}

		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '0.0.0.0';
	}
}