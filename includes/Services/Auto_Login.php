<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Auto_Login
{
    private $options;
    private $transient_prefix = 'authguard_auto_login_';
    private $code_ttl = 900; // 15 minutes

    public function __construct() {
        $this->options = authguard_get_option();
        $auto_login_enabled = (
            isset($this->options['auto_login']['settings']['enabled']) &&
            !empty($this->options['auto_login']['settings']['enabled'])
        ) ? sanitize_text_field(wp_unslash($this->options['auto_login']['settings']['enabled'])) : false;

        if ($auto_login_enabled) {
		    add_filter( 'login_body_class', [$this, 'authguard_add_login_body_class'] );
            add_action('login_form', [$this, 'render_auto_login_button'], 999);
            add_action('login_enqueue_scripts', [$this, 'enqueue_auto_login_assets'], 21);
            add_action('login_init', [$this, 'handle_auto_login_request']);
            add_action('admin_post_nopriv_authguard_send_login_link', [$this, 'handle_send_login_link']);
            add_action('admin_post_authguard_send_login_link', [$this, 'handle_send_login_link']);
            add_filter('login_message', [$this, 'add_auto_login_messages']);
        }
    }

	public function authguard_add_login_body_class( $classes ) {
		$classes[] = 'authguard-auto-login-enabled';
		return $classes;
	}

    public function enqueue_auto_login_assets() {
        $selected_methods = (isset($this->options['auto_login']['settings']['selected_auto_login']) &&
            is_array($this->options['auto_login']['settings']['selected_auto_login'])) ?
            $this->options['auto_login']['settings']['selected_auto_login'] : [];

        if (!in_array('link_login', $selected_methods)) {
            return;
        }

        $css = '
            body.authguard-auto-login-mode #loginform > *:not(#authguard-auto-login-wrapper) {
                display: none !important;
            }
            body.authguard-auto-login-mode #authguard-auto-login-or,
            body.authguard-auto-login-mode #authguard-show-auto-login-form {
                display: none !important;
            }
            .login form {
                position: relative;
            }
            body.authguard-auto-login-enabled.login form {
                padding-bottom: 100px;
            }
            body.authguard-auto-login-enabled.login form #authguard-auto-login-wrapper{
                position: absolute;
                bottom: 24px;
                width: calc(100% - 48px);
            }
            body.authguard-auto-login-enabled.authguard-auto-login-mode.login form #authguard-auto-login-wrapper{
                position: relative;
                width: 100%;
            }
        ';
        wp_add_inline_style('authguard-login', $css);

        wp_localize_script('authguard-login', 'authguardAutoLogin', [
            'nonce'       => wp_create_nonce('authguard_auto_login_nonce'),
            'ajax_url'    => admin_url('admin-post.php'),
            'i18n'        => [
                'enter_email'  => __('Please enter your email address.', 'authguard'),
                'valid_email'  => __('Please enter a valid email address.', 'authguard'),
                'sending'      => __('Sending...', 'authguard'),
                'send_link'    => __('Send Login Link', 'authguard'),
                'error'        => __('An error occurred. Please try again.', 'authguard'),
            ],
        ]);

        $js = "
        document.addEventListener('DOMContentLoaded', function() {
            var showButton = document.getElementById('authguard-show-auto-login-form');
            var cancelButton = document.getElementById('authguard-cancel-auto-login');
            var autoLoginForm = document.getElementById('authguard-auto-login-form');
            var sendButton = document.getElementById('authguard-send-login-link');
            var emailInput = document.getElementById('authguard-email');
            var i18n = authguardAutoLogin.i18n;

            if (showButton) {
                showButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.body.classList.add('authguard-auto-login-mode');
                    autoLoginForm.style.display = 'block';
                    emailInput.setAttribute('required', 'required');
                    emailInput.focus();
                });
            }

            if (cancelButton) {
                cancelButton.addEventListener('click', function() {
                    autoLoginForm.style.display = 'none';
                    document.body.classList.remove('authguard-auto-login-mode');
                    emailInput.value = '';
                    emailInput.removeAttribute('required');
                });
            }

            if (sendButton) {
                sendButton.addEventListener('click', function(e) {
                    e.preventDefault();

                    var email = emailInput.value.trim();
                    if (!email) {
                        alert(i18n.enter_email);
                        return;
                    }

                    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        alert(i18n.valid_email);
                        return;
                    }

                    sendButton.disabled = true;
                    sendButton.textContent = i18n.sending;

                    var formData = new FormData();
                    formData.append('action', 'authguard_send_login_link');
                    formData.append('authguard_email', email);
                    formData.append('authguard_auto_login_nonce', authguardAutoLogin.nonce);

                    fetch(authguardAutoLogin.ajax_url, {
                        method: 'POST',
                        body: formData
                    })
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        sendButton.disabled = false;
                        sendButton.textContent = i18n.send_link;

                        if (data.success) {
                            alert(data.data.message);
                            autoLoginForm.style.display = 'none';
                            document.body.classList.remove('authguard-auto-login-mode');
                            emailInput.value = '';
                        } else {
                            alert(data.data.message || i18n.error);
                        }
                    })
                    .catch(function(error) {
                        sendButton.disabled = false;
                        sendButton.textContent = i18n.send_link;
                        alert(i18n.error);
                    });
                });
            }
        });
        ";
        wp_add_inline_script('authguard-login', $js);
    }

    public function render_auto_login_button() {
        $selected_methods = (isset($this->options['auto_login']['settings']['selected_auto_login']) &&
            is_array($this->options['auto_login']['settings']['selected_auto_login'])) ?
            $this->options['auto_login']['settings']['selected_auto_login'] : [];

        if (!in_array('link_login', $selected_methods)) {
            return;
        }
        ?>
        <div id="authguard-auto-login-wrapper">
            <p id="authguard-auto-login-or" style="margin: 20px 0 10px 0; text-align: center;">&mdash; <?php echo esc_html__('OR', 'authguard'); ?> &mdash;</p>

            <a href="javascript:void(0)" id="authguard-show-auto-login-form" class="button button-secondary" style="width: 100%; display: block; text-align: center; box-sizing: border-box;">
                <?php echo esc_html__('Auto Login', 'authguard'); ?>
            </a>

            <div id="authguard-auto-login-form" style="display: none; margin-top: 15px;">
                <p>
                    <label for="authguard-email"><?php echo esc_html__('Enter your email address', 'authguard'); ?></label>
                    <input type="email"
                           id="authguard-email"
                           name="authguard_email"
                           class="input"
                           placeholder="<?php echo esc_attr__('Enter your email address', 'authguard'); ?>"
                           />
                </p>
                <button type="button" id="authguard-send-login-link" class="button button-primary button-large" style="width: 100%;">
                    <?php echo esc_html__('Send Login Link', 'authguard'); ?>
                </button>
                <button type="button" id="authguard-cancel-auto-login" class="button" style="width: 100%; margin-top: 10px;">
                    <?php echo esc_html__('Cancel', 'authguard'); ?>
                </button>
            </div>
        </div>
        <?php
    }

    public function handle_auto_login_request() {
        if (!isset($_GET['authguard_auto_login_token'])) {
            return;
        }

        $token = sanitize_text_field(wp_unslash($_GET['authguard_auto_login_token']));
        $transient_key = $this->transient_prefix . $token;
        $data = get_transient($transient_key);

        if (!$data || !is_array($data)) {
            wp_die(
                esc_html__('Invalid or expired login link. Please request a new one.', 'authguard'),
                esc_html__('Auto Login Error', 'authguard'),
                array('back_link' => true)
            );
        }

        $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
        $user = get_user_by('ID', $user_id);

        if (!$user) {
            wp_die(
                esc_html__('User not found.', 'authguard'),
                esc_html__('Auto Login Error', 'authguard'),
                array('back_link' => true)
            );
        }

        delete_transient($transient_key);

        wp_set_current_user($user_id);
        wp_set_auth_cookie($user_id, true);

        $redirect_to = isset($data['redirect_to']) ? esc_url($data['redirect_to']) : admin_url();
        wp_safe_redirect($redirect_to);
        exit;
    }

    public function handle_send_login_link() {
        $nonce = isset($_POST['authguard_auto_login_nonce']) ?
            sanitize_text_field(wp_unslash($_POST['authguard_auto_login_nonce'])) : '';

        if (!wp_verify_nonce($nonce, 'authguard_auto_login_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'authguard')));
        }

        $email = isset($_POST['authguard_email']) ?
            sanitize_email(wp_unslash($_POST['authguard_email'])) : '';

        if (empty($email) || !is_email($email)) {
            wp_send_json_error(array('message' => __('Please enter a valid email address.', 'authguard')));
        }

        $user = get_user_by('email', $email);

        if (!$user) {
            wp_send_json_success(array(
                'message' => __('If an account with this email exists, a login link has been sent.', 'authguard')
            ));
        }

        $token = wp_generate_uuid4();
        $transient_key = $this->transient_prefix . $token;

        $login_data = array(
            'user_id' => $user->ID,
            'email' => $user->user_email,
            'created_at' => current_time('mysql'),
            'redirect_to' => admin_url()
        );

        set_transient($transient_key, $login_data, $this->code_ttl);

        $login_link = add_query_arg(
            array('authguard_auto_login_token' => $token),
            wp_login_url()
        );

        $subject = sprintf(
            '[%s] %s',
            wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
            __('Auto Login Link', 'authguard')
        );

        $message = sprintf(
            "Hello %s,\n\n" .
            "You requested an auto login link for your account.\n\n" .
            "Click the link below to log in:\n\n" .
            "%s\n\n" .
            "This link will expire in %d minutes.\n\n" .
            "If you did not request this link, please ignore this email.\n\n" .
            "Thanks,\n" .
            "%s Team",
            $user->display_name ?: $user->user_login,
            $login_link,
            intval($this->code_ttl / 60),
            get_bloginfo('name')
        );

        $headers = array('Content-Type: text/plain; charset=UTF-8');
        $sent = wp_mail($user->user_email, $subject, $message, $headers);

        if ($sent) {
            wp_send_json_success(array(
                'message' => __('Login link has been sent to your email address.', 'authguard')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to send email. Please try again.', 'authguard')
            ));
        }
    }

    public function add_auto_login_messages($message) {
        if (isset($_GET['authguard_login_link_sent'])) {
            $message .= '<p class="message">' .
                esc_html__('Login link has been sent to your email address.', 'authguard') .
                '</p>';
        }
        return $message;
    }
}
