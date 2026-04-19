<?php
namespace MosPress\Authpress\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Limit_Login
{
    private $options;
    private $transient_prefix = 'authguard_limit_login_';
    private $lockout_meta_key = 'authguard_lockout_time';

    public function __construct() {
        $this->options = authguard_get_option();
        $limit_login_enabled = (
            isset($this->options['limit_login_attempts']['enabled']) &&
            !empty($this->options['limit_login_attempts']['enabled'])
        ) ? sanitize_text_field(wp_unslash($this->options['limit_login_attempts']['enabled'])) : false;

        if ($limit_login_enabled) {
            add_filter('authenticate', [$this, 'check_login_attempt'], 30, 3);
            add_action('wp_login_failed', [$this, 'track_failed_login'], 10, 2);
            add_filter('login_errors', [$this, 'show_lockout_message']);

            $disable_xml_rpc = isset($this->options['limit_login_attempts']['disable_xml_rpc_requests']) ?
                sanitize_text_field(wp_unslash($this->options['limit_login_attempts']['disable_xml_rpc_requests'])) : false;

            if ($disable_xml_rpc) {
                add_filter('xmlrpc_enabled', '__return_false');
            }
        }

        $custom_login_url = isset($this->options['hide_login']['login_url']) ?
            sanitize_text_field(wp_unslash($this->options['hide_login']['login_url'])) : '';

        if (!empty($custom_login_url)) {
            add_action('init', [$this, 'redirect_to_custom_login']);
            add_action('template_redirect', [$this, 'show_404_template']);
        }
    }

    /**
     * Check if IP is blacklisted
     *
     * @param string $ip
     * @return bool
     */
    private function is_ip_blacklisted($ip) {
        $blacklist = isset($this->options['limit_login_attempts']['ip_blacklist']) && 
            is_array($this->options['limit_login_attempts']['ip_blacklist']) ?
            $this->options['limit_login_attempts']['ip_blacklist'] : [];

        if (empty($blacklist)) {
            return false;
        }

        foreach ($blacklist as $blacklisted) {
            $blacklisted = trim(sanitize_text_field($blacklisted));
            
            // Check for exact match
            if ($ip === $blacklisted) {
                return true;
            }

            // Check for CIDR notation
            if (strpos($blacklisted, '/') !== false) {
                if ($this->ip_in_range($ip, $blacklisted)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if email is blacklisted
     *
     * @param string $email
     * @return bool
     */
    private function is_email_blacklisted($email) {
        $blacklist = isset($this->options['limit_login_attempts']['email_blacklist']) && 
            is_array($this->options['limit_login_attempts']['email_blacklist']) ?
            $this->options['limit_login_attempts']['email_blacklist'] : [];

        if (empty($blacklist) || !is_email($email)) {
            return false;
        }

        $email = strtolower(sanitize_email($email));

        foreach ($blacklist as $blacklisted) {
            $blacklisted = strtolower(sanitize_email($blacklisted));
            if ($email === $blacklisted) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if IP is in CIDR range
     *
     * @param string $ip
     * @param string $range
     * @return bool
     */
    private function ip_in_range($ip, $range) {
        if (strpos($range, '/') === false) {
            return $ip === $range;
        }

        list($range, $netmask) = explode('/', $range, 2);
        $range_decimal = ip2long($range);
        $ip_decimal = ip2long($ip);
        $wildcard_decimal = pow(2, (32 - $netmask)) - 1;
        $netmask_decimal = ~ $wildcard_decimal;

        return (($ip_decimal & $netmask_decimal) == ($range_decimal & $netmask_decimal));
    }

    /**
     * Get client IP address
     *
     * @return string
     */
    private function get_client_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR');

        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', sanitize_text_field(wp_unslash($_SERVER[$key]))) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }

        return isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '0.0.0.0';
    }

    /**
     * Get current lockout status
     *
     * @param string $identifier
     * @return array|false
     */
    private function get_lockout_status($identifier) {
        $lockout_data = get_transient($this->transient_prefix . $identifier);
        return $lockout_data ? $lockout_data : false;
    }

    /**
     * Set lockout
     *
     * @param string $identifier
     * @param int $lockout_time
     */
    private function set_lockout($identifier, $lockout_time) {
        $lockout_data = array(
            'lockout_time' => $lockout_time,
            'locked_until' => time() + ($lockout_time * 60)
        );
        set_transient($this->transient_prefix . $identifier, $lockout_data, $lockout_time * 60);
    }

    /**
     * Check login attempt and enforce limits
     *
     * @param WP_User|WP_Error|null $user
     * @param string $username
     * @param string $password
     * @return WP_User|WP_Error
     */
    public function check_login_attempt($user, $username, $password) {
        $ip = $this->get_client_ip();
        $identifier = 'ip_' . md5($ip);

        // Check IP blacklist
        if ($this->is_ip_blacklisted($ip)) {
            return new \WP_Error('ip_blacklisted', __('Your IP address has been blacklisted. Please contact the site administrator.', 'authguard'));
        }

        // Check email blacklist
        if (!empty($username) && is_email($username)) {
            if ($this->is_email_blacklisted($username)) {
                return new \WP_Error('email_blacklisted', __('Your email address has been blacklisted. Please contact the site administrator.', 'authguard'));
            }
        } else {
            // Check username for blacklisted email (user might be using username)
            $user_obj = get_user_by('login', $username);
            if ($user_obj && $this->is_email_blacklisted($user_obj->user_email)) {
                return new \WP_Error('email_blacklisted', __('Your email address has been blacklisted. Please contact the site administrator.', 'authguard'));
            }
        }

        // Check if currently locked out
        $lockout = $this->get_lockout_status($identifier);
        if ($lockout && isset($lockout['locked_until'])) {
            $remaining_time = ceil(($lockout['locked_until'] - time()) / 60);
            if ($remaining_time > 0) {
                $message = isset($this->options['limit_login_attempts']['lockout_message']) ?
                    $this->options['limit_login_attempts']['lockout_message'] : 
                    'Too many failed login attempts. Please try again in {minutes} minutes.';
                
                $message = str_replace('{minutes}', $remaining_time, $message);
                return new \WP_Error('too_many_attempts', $message);
            } else {
                // Lockout expired, clean up
                delete_transient($this->transient_prefix . $identifier);
            }
        }

        return $user;
    }

    /**
     * Track failed login attempts
     *
     * @param string $username
     * @param WP_Error $error
     */
    public function track_failed_login($username, $error) {
        $ip = $this->get_client_ip();
        $identifier = 'ip_' . md5($ip);

        $lockout = $this->get_lockout_status($identifier);
        $attempts = isset($lockout['attempts']) ? $lockout['attempts'] : 0;
        $attempts++;

        $attempts_allowed = isset($this->options['limit_login_attempts']['attempts_allowed']) ? 
            intval($this->options['limit_login_attempts']['attempts_allowed']) : 5;

        if ($attempts >= $attempts_allowed) {
            $minutes_lockout = isset($this->options['limit_login_attempts']['minutes_lockout']) ? 
                intval($this->options['limit_login_attempts']['minutes_lockout']) : 5;
            $this->set_lockout($identifier, $minutes_lockout);
        } else {
            $lockout_data = array(
                'attempts' => $attempts,
                'last_attempt' => time()
            );
            // Store for 1 hour
            set_transient($this->transient_prefix . $identifier, $lockout_data, HOUR_IN_SECONDS);
        }
    }

    /**
     * Show lockout message
     *
     * @param string $message
     * @return string
     */
    public function show_lockout_message($message) {
        $ip = $this->get_client_ip();
        $identifier = 'ip_' . md5($ip);
        $lockout = $this->get_lockout_status($identifier);

        if ($lockout && isset($lockout['locked_until'])) {
            $remaining_time = ceil(($lockout['locked_until'] - time()) / 60);
            if ($remaining_time > 0) {
                $lockout_message = isset($this->options['limit_login_attempts']['lockout_message']) ?
                    $this->options['limit_login_attempts']['lockout_message'] : 
                    'Too many failed login attempts. Please try again in {minutes} minutes.';
                
                return str_replace('{minutes}', $remaining_time, $lockout_message);
            }
        }

        return $message;
    }

    /**
     * Clear lockout for an identifier
     *
     * @param string $identifier
     */
    public function clear_lockout($identifier) {
        delete_transient($this->transient_prefix . $identifier);
    }

    /**
     * Clear all lockouts
     */
    public function clear_all_lockouts() {
        global $wpdb;
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
                $wpdb->esc_like('_transient_' . $this->transient_prefix) . '%'
            )
        );
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
                $wpdb->esc_like('_transient_timeout_' . $this->transient_prefix) . '%'
            )
        );
    }

    /**
     * Redirect guest users from wp-login.php and wp-admin to custom login URL
     */
    public function redirect_to_custom_login() {
        global $pagenow;

        $custom_login_url = isset($this->options['hide_login']['login_url']) ?
            sanitize_text_field(wp_unslash($this->options['hide_login']['login_url'])) : '';

        if (empty($custom_login_url)) {
            return;
        }

        // Allow access for logged-in users
        if (is_user_logged_in()) {
            return;
        }

        // Allow access to custom login page itself
        $request_uri = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';
        $current_url = home_url($request_uri);
        $custom_login_url_full = home_url($custom_login_url);

        if (strpos($current_url, $custom_login_url) !== false) {
            return;
        }

        // Allow access to login actions that don't need redirection
        if (isset($_GET['action'])) {
            $allowed_actions = ['logout', 'rp', 'resetpass'];
            if (in_array($_GET['action'], $allowed_actions)) {
                return;
            }
        }

        // Redirect from wp-login.php
        if ($pagenow === 'wp-login.php') {
            wp_safe_redirect(home_url('?authguard_404=1'));
            exit;
        }

        // Redirect from wp-admin for non-admin users
        if ($pagenow === 'wp-admin' && !isset($_GET['authguard_bypass'])) {
            wp_safe_redirect(home_url('?authguard_404=1'));
            exit;
        }
    }

    /**
     * Show 404 template for custom login redirection
     */
    public function show_404_template() {
        if (isset($_GET['authguard_404']) && $_GET['authguard_404'] === '1') {
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            nocache_headers();
            include(get_query_template('404'));
            exit;
        }
    }
}
