<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
use WP_Error;
class Misc
{
    private $options;

    public function __construct() {
        $this->options = authguard_get_option();
        $misc = isset($this->options['misc']) ? $this->options['misc'] : [];

        $disable_remember_me = isset($misc['disable_remember_me']) ? sanitize_text_field(wp_unslash($misc['disable_remember_me'])) : false;
        if ($disable_remember_me) {
            add_action('login_enqueue_scripts', [$this, 'hide_remember_me_css'], 30);
            add_filter('login_form_defaults', [$this, 'force_remember_me_checked'], 10, 1);
        }

        $disable_register_link = isset($misc['disable_register_link']) ? sanitize_text_field(wp_unslash($misc['disable_register_link'])) : false;
        if ($disable_register_link) {
            add_action('login_head', [$this, 'hide_register_link_css']);
            add_action('init', [$this, 'block_register_page']);
            add_filter('option_users_can_register', '__return_false');
        }

        $disable_lost_password = isset($misc['disable_lost_password']) ? sanitize_text_field(wp_unslash($misc['disable_lost_password'])) : false;
        if ($disable_lost_password) {
            add_action('login_head', [$this, 'hide_lost_password_link_css']);
            add_action('login_head', [$this, 'hide_lost_password_nav_css']);
            add_action('init', [$this, 'block_lostpassword_page']);
        }

        $disable_privacy_policy = isset($misc['disable_privacy_policy']) ? sanitize_text_field(wp_unslash($misc['disable_privacy_policy'])) : false;
        if ($disable_privacy_policy) {
            add_filter('privacy_policy_url', '__return_empty_string');
            add_action('login_head', [$this, 'hide_privacy_policy_css']);
        }

        $disable_back_to_website = isset($misc['disable_back_to_website']) ? sanitize_text_field(wp_unslash($misc['disable_back_to_website'])) : false;
        if ($disable_back_to_website) {
            add_filter('login_display_language_dropdown', '__return_false');
            add_action('login_head', [$this, 'hide_back_to_website_css']);
        }

        $login_by = isset($misc['login_by']) ? sanitize_text_field(wp_unslash($misc['login_by'])) : 'both';
        if ($login_by !== 'both') {
            add_filter('authenticate', [$this, 'restrict_login_by'], 30, 3);
            add_filter('gettext', [$this, 'change_login_label'], 20, 3);
        }

        $restrict_domains = isset($misc['restrict_domains']) ? sanitize_text_field(wp_unslash($misc['restrict_domains'])) : '';
        if (!empty($restrict_domains)) {
            add_filter('registration_errors', [$this, 'validate_restricted_domains'], 10, 3);
        }

        $registered_with_password = isset($misc['registered_with_password']) ? sanitize_text_field(wp_unslash($misc['registered_with_password'])) : false;
        if ($registered_with_password) {
            add_action('register_form', [$this, 'add_password_fields']);
            add_filter('registration_errors', [$this, 'validate_registration_passwords'], 10, 3);
            add_action('user_register', [$this, 'save_registration_password'], 10, 1);
            add_filter('wp_new_user_notification_email', [$this, 'customize_registration_email'], 10, 3);
        }
    }

    public function hide_remember_me_css() {
        echo '<style>.login #loginform .forgetmenot { display: none !important; }</style>';
    }

    public function force_remember_me_checked($defaults) {
        $defaults['remember'] = true;
        return $defaults;
    }

    public function hide_register_link_css() {
        echo '<style>.login #nav a[href*="register"] { display: none !important; }</style>';
    }

    public function block_register_page() {
        global $pagenow;
        if ($pagenow === 'wp-login.php' && isset($_GET['action']) && $_GET['action'] === 'register') {
            wp_safe_redirect(home_url('/wp-login.php'));
            exit;
        }
    }

    public function hide_lost_password_link_css() {
        echo '<style>.login #nav a[href*="lostpassword"] { display: none !important; }</style>';
    }

    public function hide_lost_password_nav_css() {
        echo '<style>.login #nav a.wp-login-lost-password { display: none !important; }</style>';
    }

    public function block_lostpassword_page() {
        global $pagenow;
        if ($pagenow === 'wp-login.php' && isset($_GET['action']) && $_GET['action'] === 'lostpassword') {
            wp_safe_redirect(home_url());
            exit;
        }
    }

    public function hide_privacy_policy_css() {
        echo '<style>.privacy-policy-page-link { display: none !important; }</style>';
    }

    public function hide_back_to_website_css() {
        echo '<style>#backtoblog { display: none !important; }</style>';
    }

    public function restrict_login_by($user, $username, $password) {
        $login_by = isset($this->options['misc']['login_by']) ? sanitize_text_field(wp_unslash($this->options['misc']['login_by'])) : 'both';

        if ($login_by === 'email') {
            if (!is_email($username)) {
                return new WP_Error('invalid_email', __('You must use your email address to log in.', 'authguard'));
            }
            $user_obj = get_user_by('email', $username);
            if ($user_obj) {
                return wp_authenticate_username_password(null, $user_obj->user_login, $password);
            }
        } elseif ($login_by === 'username') {
            if (is_email($username)) {
                return new WP_Error('invalid_username', __('You must use your username to log in.', 'authguard'));
            }
            $user_obj = get_user_by('login', $username);
            if ($user_obj) {
                return wp_authenticate_username_password(null, $username, $password);
            }
        } elseif ($login_by === 'phone') {
            $user_obj = $this->get_user_by_phone($username);
            if (!$user_obj) {
                return new WP_Error('invalid_phone', __('No user found with this phone number.', 'authguard'));
            }
            return wp_authenticate_username_password(null, $user_obj->user_login, $password);
        }

        return $user;
    }

    private function get_user_by_phone($phone) {
        $phone = sanitize_text_field($phone);
        $users = get_users([
            'meta_key' => 'phone',
            'meta_value' => $phone,
            'number' => 1,
        ]);
        if (!empty($users)) {
            return $users[0];
        }
        $users = get_users([
            'meta_key' => 'billing_phone',
            'meta_value' => $phone,
            'number' => 1,
        ]);
        if (!empty($users)) {
            return $users[0];
        }
        return false;
    }

    public function change_login_label($translated_text, $text, $domain) {
        $login_by = isset($this->options['misc']['login_by']) ? sanitize_text_field(wp_unslash($this->options['misc']['login_by'])) : 'both';

        if ($text === 'Username or Email Address') {
            if ($login_by === 'username') {
                return __('Username', 'authguard');
            } elseif ($login_by === 'email') {
                return __('Email', 'authguard');
            } elseif ($login_by === 'phone') {
                return __('Phone Number', 'authguard');
            }
        }

        return $translated_text;
    }

    public function validate_restricted_domains($errors, $sanitized_user_login, $user_email) {
        $restrict_domains = isset($this->options['misc']['restrict_domains']) ? sanitize_text_field(wp_unslash($this->options['misc']['restrict_domains'])) : '';

        if (empty($restrict_domains)) {
            return $errors;
        }

        $email_domain = strtolower(substr(strrchr($user_email, '@'), 1));
        $allowed_domains = array_map('trim', explode(',', $restrict_domains));
        $allowed_domains = array_map(function ($d) {
            return strtolower(ltrim($d, '@'));
        }, $allowed_domains);
        $allowed_domains = array_filter($allowed_domains);

        if (!empty($allowed_domains) && !in_array($email_domain, $allowed_domains)) {
            $errors->add('domain_not_allowed', sprintf(
                __('Registration is only allowed for the following domains: %s', 'authguard'),
                '@' . implode(', @', $allowed_domains)
            ));
        }

        return $errors;
    }

    public function add_password_fields() {
        ?>
        <p>
            <label for="password"><?php echo esc_html__('Password', 'authguard'); ?><br />
                <input type="password" name="password" id="password" class="input" value="" size="25" required />
            </label>
        </p>
        <p>
            <label for="password2"><?php echo esc_html__('Confirm Password', 'authguard'); ?><br />
                <input type="password" name="password2" id="password2" class="input" value="" size="25" required />
            </label>
        </p>
        <?php
        wp_nonce_field('authguard_register_password_action', 'authguard_register_password_field');
    }

    public function validate_registration_passwords($errors, $sanitized_user_login, $user_email) {
        if (isset($_POST['authguard_register_password_field']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['authguard_register_password_field'])), 'authguard_register_password_action')) {
            $password = isset($_POST['password']) ? sanitize_text_field(wp_unslash($_POST['password'])) : '';
            $password2 = isset($_POST['password2']) ? sanitize_text_field(wp_unslash($_POST['password2'])) : '';

            if (empty($password) || empty($password2)) {
                $errors->add('password_error', __('<strong>Error</strong>: Please enter a password in both fields.', 'authguard'));
            } elseif ($password !== $password2) {
                $errors->add('password_mismatch', __('<strong>Error</strong>: Passwords do not match.', 'authguard'));
            } elseif (strlen($password) < 6) {
                $errors->add('password_short', __('<strong>Error</strong>: Password must be at least 6 characters long.', 'authguard'));
            }
        }
        return $errors;
    }

    public function save_registration_password($user_id) {
        if (isset($_POST['authguard_register_password_field']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['authguard_register_password_field'])), 'authguard_register_password_action')) {
            $password = isset($_POST['password']) ? sanitize_text_field(wp_unslash($_POST['password'])) : '';
            $password2 = isset($_POST['password2']) ? sanitize_text_field(wp_unslash($_POST['password2'])) : '';
            if (!empty($password) && $password === $password2) {
                wp_set_password($password, $user_id);
            }
        }
    }

    public function customize_registration_email($wp_new_user_notification_email, $user, $blogname) {
        $reset_key = get_password_reset_key($user);
        $reset_link = network_site_url("wp-login.php?action=rp&key=$reset_key&login=" . rawurlencode($user->user_login), 'login');

        $wp_new_user_notification_email['subject'] = sprintf(__('Welcome to %s!', 'authguard'), $blogname);

        $message  = "Hi " . $user->user_login . ",\n\n";
        $message .= "Welcome to $blogname! Your account has been created successfully.\n\n";
        $message .= "You can log in anytime here:\n";
        $message .= wp_login_url() . "\n\n";
        $message .= "If you'd like to reset your password, visit this link:\n";
        $message .= $reset_link . "\n\n";
        $message .= "If you didn't request this account, you can safely ignore this email.\n\n";
        $message .= "Thanks,\n$blogname Team";

        $wp_new_user_notification_email['message'] = $message;
        $wp_new_user_notification_email['headers'] = ['Content-Type: text/plain; charset=UTF-8'];

        return $wp_new_user_notification_email;
    }
}
