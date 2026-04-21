<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Password_Policies
{
    private $options;
    private $settings;

    public function __construct() {
        $this->options = authguard_get_option();
        $this->settings = isset($this->options['password_policy']['settings']) ? $this->options['password_policy']['settings'] : [];

        $rules_enabled = !empty($this->settings['password_rules_enabled']);
        $force_reset = !empty($this->settings['force_password_reset']);

        if ($rules_enabled) {
            add_action('admin_enqueue_scripts', [$this, 'enqueue_password_policy_script']);
            add_action('login_enqueue_scripts', [$this, 'enqueue_login_password_policy_script']);
            add_action('user_profile_update_errors', [$this, 'validate_password_on_profile_update'], 10, 3);
            add_action('validate_password_reset', [$this, 'validate_password_on_reset'], 10, 2);
            add_action('show_user_profile', [$this, 'show_password_hints']);
            add_action('edit_user_profile', [$this, 'show_password_hints']);
            add_action('admin_head', [$this, 'password_policy_inline_css']);
        }

        if ($force_reset) {
            add_action('wp_login', [$this, 'check_force_password_reset'], 10, 2);
            add_action('login_message', [$this, 'force_reset_login_message']);
            add_action('password_reset', [$this, 'track_password_reset'], 10, 2);
        }

        add_action('profile_update', [$this, 'track_password_change'], 10, 2);
        add_action('user_register', [$this, 'track_new_user_password']);
    }

    public function enqueue_password_policy_script($hook) {
        $allowed_pages = ['profile', 'user-edit', 'user-new'];
        $screen = get_current_screen();

        if ($screen && in_array($screen->base, $allowed_pages, true)) {
            wp_enqueue_script(
                'authguard-password-policies',
                AUTHGUARD_URL . 'assets/js/password-policies.js',
                ['jquery'],
                '1.0.0',
                true
            );

            wp_localize_script('authguard-password-policies', 'authguardPasswordPolicies', [
                'enabled' => true,
                'rules'   => [
                    'min_length'        => isset($this->settings['min_length']) ? intval($this->settings['min_length']) : 8,
                    'require_uppercase' => !empty($this->settings['require_uppercase']),
                    'require_number'    => !empty($this->settings['require_number']),
                    'require_special'   => !empty($this->settings['require_special']),
                ],
                'i18n' => [
                    'heading'     => __('Password Requirements:', 'authguard'),
                    'min_length'  => __('Minimum %d characters', 'authguard'),
                    'uppercase'   => __('At least one uppercase letter', 'authguard'),
                    'number'      => __('At least one number', 'authguard'),
                    'special'     => __('At least one special character (!@#$%...)', 'authguard'),
                    'password_ok' => __('Password meets all requirements.', 'authguard'),
                ],
            ]);
        }
    }

    public function enqueue_login_password_policy_script() {
        $action = isset($_GET['action']) ? sanitize_text_field(wp_unslash($_GET['action'])) : '';
        if ($action !== 'rp' && $action !== 'resetpass') {
            return;
        }

        wp_enqueue_script(
            'authguard-password-policies',
            AUTHGUARD_URL . 'assets/js/password-policies.js',
            ['jquery'],
            '1.0.0',
            true
        );

        wp_localize_script('authguard-password-policies', 'authguardPasswordPolicies', [
            'enabled' => true,
            'rules'   => [
                'min_length'        => isset($this->settings['min_length']) ? intval($this->settings['min_length']) : 8,
                'require_uppercase' => !empty($this->settings['require_uppercase']),
                'require_number'    => !empty($this->settings['require_number']),
                'require_special'   => !empty($this->settings['require_special']),
            ],
            'i18n' => [
                'heading'     => __('Password Requirements:', 'authguard'),
                'min_length'  => __('Minimum %d characters', 'authguard'),
                'uppercase'   => __('At least one uppercase letter', 'authguard'),
                'number'      => __('At least one number', 'authguard'),
                'special'     => __('At least one special character (!@#$%...)', 'authguard'),
                'password_ok' => __('Password meets all requirements.', 'authguard'),
            ],
        ]);

        add_action('login_footer', [$this, 'login_password_policy_css']);
    }

    public function login_password_policy_css() {
        ?>
        <style>
            .authguard-pw-notice {
                margin: 8px 0 16px;
                padding: 10px 12px;
                border-radius: 4px;
                font-size: 13px;
                line-height: 1.6;
            }
            .authguard-pw-notice.authguard-pw-invalid {
                background: #fff3f3;
                border: 1px solid #fcc;
                color: #a00;
            }
            .authguard-pw-notice.authguard-pw-valid {
                background: #f0f8eb;
                border: 1px solid #c3e6a8;
                color: #3a7d2c;
            }
            .authguard-pw-notice p {
                margin: 0 0 6px;
            }
            .authguard-pw-notice ul {
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .authguard-pw-notice ul li {
                padding: 2px 0;
            }
            .authguard-pw-notice ul li::before {
                margin-right: 6px;
                font-weight: bold;
            }
            .authguard-pw-invalid ul li::before {
                content: '\2717';
                color: #a00;
            }
            .authguard-pw-valid::before {
                content: '\2713';
                color: #3a7d2c;
                margin-right: 6px;
                font-weight: bold;
            }
        </style>
        <?php
    }

    public function password_policy_inline_css() {
        $screen = get_current_screen();
        $allowed_pages = ['profile', 'user-edit', 'user-new'];
        if (!$screen || !in_array($screen->base, $allowed_pages, true)) {
            return;
        }
        ?>
        <style>
            .authguard-pw-notice {
                margin: 8px 0 0;
                padding: 10px 12px;
                border-radius: 4px;
                font-size: 13px;
                line-height: 1.5;
                max-width: 400px;
            }
            .authguard-pw-notice.authguard-pw-invalid {
                background: #fff3f3;
                border: 1px solid #fcc;
                color: #a00;
            }
            .authguard-pw-notice.authguard-pw-valid {
                background: #f0f8eb;
                border: 1px solid #c3e6a8;
                color: #3a7d2c;
            }
            .authguard-pw-notice p {
                margin: 0 0 6px;
            }
            .authguard-pw-notice ul {
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .authguard-pw-notice ul li {
                padding: 2px 0;
            }
            .authguard-pw-notice ul li .dashicons {
                font-size: 16px;
                width: 16px;
                height: 16px;
                vertical-align: middle;
                margin-right: 4px;
            }
            .authguard-pw-invalid .dashicons-dismiss {
                color: #a00;
            }
            .authguard-pw-valid .dashicons-yes-alt {
                color: #3a7d2c;
            }
        </style>
        <?php
    }

    private function get_password_errors($password) {
        $errors = [];
        $min_length = isset($this->settings['min_length']) ? intval($this->settings['min_length']) : 8;

        if (strlen($password) < $min_length) {
            $errors[] = sprintf(__('Password must be at least %d characters long.', 'authguard'), $min_length);
        }
        if (!empty($this->settings['require_uppercase']) && !preg_match('/[A-Z]/', $password)) {
            $errors[] = __('Password must contain at least one uppercase letter.', 'authguard');
        }
        if (!empty($this->settings['require_number']) && !preg_match('/[0-9]/', $password)) {
            $errors[] = __('Password must contain at least one number.', 'authguard');
        }
        if (!empty($this->settings['require_special']) && !preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) {
            $errors[] = __('Password must contain at least one special character.', 'authguard');
        }

        return $errors;
    }

    public function validate_password_on_profile_update($errors, $update, $user) {
        $password = '';
        if (isset($_POST['pass1']) && !empty($_POST['pass1'])) {
            $password = sanitize_text_field(wp_unslash($_POST['pass1']));
        } elseif (isset($_POST['user_password']) && !empty($_POST['user_password'])) {
            $password = sanitize_text_field(wp_unslash($_POST['user_password']));
        }

        if (empty($password)) {
            return;
        }

        $password_errors = $this->get_password_errors($password);
        foreach ($password_errors as $error) {
            $errors->add('authguard_password_policy', '<strong>' . esc_html__('Error:', 'authguard') . '</strong> ' . $error);
        }
    }

    public function validate_password_on_reset($errors, $user) {
        if (isset($_POST['pass1']) && !empty($_POST['pass1'])) {
            $password = sanitize_text_field(wp_unslash($_POST['pass1']));
            $password_errors = $this->get_password_errors($password);
            foreach ($password_errors as $error) {
                $errors->add('authguard_password_policy', '<strong>' . esc_html__('Error:', 'authguard') . '</strong> ' . $error);
            }
        }
    }

    public function show_password_hints($user) {
        $min_length = isset($this->settings['min_length']) ? intval($this->settings['min_length']) : 8;
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            var $pass1 = $('#pass1');
            if ($pass1.length === 0) return;
            var $hint = $('<div class="authguard-pw-notice" id="authguard-pw-hint"></div>');
            $pass1.closest('.wp-pwd, #password').after($hint);
            if ($pass1.closest('.wp-pwd').length === 0 && $pass1.closest('#password').length === 0) {
                $pass1.after($hint);
            }

            function updateHint(password) {
                if (!password) { $hint.html(''); return; }
                var errors = [];
                <?php if (!empty($this->settings['min_length'])) : ?>
                if (password.length < <?php echo intval($this->settings['min_length']); ?>) {
                    errors.push('<?php echo esc_js(sprintf(__('Minimum %d characters', 'authguard'), $min_length)); ?>');
                }
                <?php endif; ?>
                <?php if (!empty($this->settings['require_uppercase'])) : ?>
                if (!/[A-Z]/.test(password)) {
                    errors.push('<?php echo esc_js(__('One uppercase letter required', 'authguard')); ?>');
                }
                <?php endif; ?>
                <?php if (!empty($this->settings['require_number'])) : ?>
                if (!/[0-9]/.test(password)) {
                    errors.push('<?php echo esc_js(__('One number required', 'authguard')); ?>');
                }
                <?php endif; ?>
                <?php if (!empty($this->settings['require_special'])) : ?>
                if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                    errors.push('<?php echo esc_js(__('One special character required', 'authguard')); ?>');
                }
                <?php endif; ?>

                if (errors.length === 0) {
                    $hint.removeClass('authguard-pw-invalid').addClass('authguard-pw-valid').html(
                        '<span class="dashicons dashicons-yes-alt"></span> <?php echo esc_js(__('Password meets requirements.', 'authguard')); ?>'
                    );
                } else {
                    var html = '<p class="authguard-pw-heading"><strong><?php echo esc_js(__('Password Requirements:', 'authguard')); ?></strong></p><ul class="authguard-pw-rules">';
                    for (var i = 0; i < errors.length; i++) {
                        html += '<li><span class="dashicons dashicons-dismiss"></span> ' + errors[i] + '</li>';
                    }
                    html += '</ul>';
                    $hint.removeClass('authguard-pw-valid').addClass('authguard-pw-invalid').html(html);
                }
            }

            $pass1.on('input propertychange', function() {
                updateHint($(this).val());
            });
        });
        </script>
        <?php
    }

    public function track_password_change($user_id, $old_user_data) {
        if (!isset($_POST['pass1']) || empty($_POST['pass1'])) {
            return;
        }

        $user = get_userdata($user_id);
        if (!$user) return;

        if ($old_user_data->user_pass !== $user->user_pass) {
            $this->store_password_change($user_id, $user->user_pass);
        }
    }

    public function track_new_user_password($user_id) {
        $user = get_userdata($user_id);
        if (!$user) return;
        $this->store_password_change($user_id, $user->user_pass);
    }

    public function track_password_reset($user, $new_pass) {
        $this->store_password_change($user->ID, wp_hash_password($new_pass));
    }

    private function store_password_change($user_id, $hashed_password) {
        $authguard_last_passwords = get_user_meta($user_id, 'authguard_last_passwords', true);
        if (!is_array($authguard_last_passwords)) {
            $authguard_last_passwords = [];
        }

        $authguard_last_passwords[] = [
            'password' => $hashed_password,
            'date'     => current_time('mysql'),
        ];

        $authguard_last_passwords = array_slice($authguard_last_passwords, -5);

        update_user_meta($user_id, 'authguard_last_passwords', $authguard_last_passwords);
        update_user_meta($user_id, 'authguard_last_password_change', current_time('mysql'));
    }

    public function check_force_password_reset($user_login, $user) {
        if (defined('DOING_AJAX') && DOING_AJAX) return;
        if (defined('REST_REQUEST') && REST_REQUEST) return;

        $force_reset_roles = isset($this->settings['password_reset_roles']) ? $this->settings['password_reset_roles'] : [];
        if (empty($force_reset_roles) || !is_array($force_reset_roles)) return;

        $user_roles = (array) $user->roles;
        $matched = array_intersect($user_roles, $force_reset_roles);
        if (empty($matched)) return;

        $duration = isset($this->settings['password_reset_duration']) ? intval($this->settings['password_reset_duration']) : 30;
        if ($duration < 1) $duration = 30;

        $last_change = get_user_meta($user->ID, 'authguard_last_password_change', true);

        if (empty($last_change)) {
            $this->redirect_to_password_reset($user);
            return;
        }

        $last_change_time = strtotime($last_change);
        $expiry_time = $last_change_time + ($duration * DAY_IN_SECONDS);

        if (time() > $expiry_time) {
            $this->redirect_to_password_reset($user);
        }
    }

    private function redirect_to_password_reset($user) {
        wp_destroy_all_sessions();

        $key = get_password_reset_key($user);
        if (is_wp_error($key)) return;

        set_transient('authguard_force_reset_' . $user->ID, true, 300);

        wp_safe_redirect(
            add_query_arg(
                [
                    'action'             => 'rp',
                    'key'                => $key,
                    'login'              => rawurlencode($user->user_login),
                    'authguard_forced'   => '1',
                ],
                wp_login_url()
            )
        );
        exit;
    }

    public function force_reset_login_message($message) {
        if (isset($_GET['authguard_forced']) && $_GET['authguard_forced'] === '1') {
            return '<p class="message notice notice-warning" style="border-left: 4px solid #dba617; padding: 12px; background: #fdf8ed;">' .
                '<strong>' . esc_html__('Password Expired', 'authguard') . ':</strong> ' .
                esc_html__('Your password has expired. Please set a new password to continue.', 'authguard') .
                '</p>';
        }
        return $message;
    }
}
