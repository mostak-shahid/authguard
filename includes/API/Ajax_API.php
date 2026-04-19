<?php
namespace MosPress\Authguard\API;
if ( ! defined( 'ABSPATH' ) ) exit;
use MosPress\Authguard\Helpers\CryptoHelper;

class Ajax_API
{
    private static $instance = null;
    public static function get_instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    public function __construct()
	{
        add_action('wp_ajax_authguard_reset_settings', [$this, 'authguard_reset_settings']);			
		add_action('init', [$this, 'authguard_maybe_flush_rules'], 99);   
		
    }    
	public static function authguard_reset_all_settings()
	{
		// wp_send_json_success($_POST['_admin_nonce']);
		if (isset($_POST['_admin_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_admin_nonce'])), 'authguard_admin_nonce')) {
			$authguard_default_options = authguard_get_default_options();

			// wp_send_json_success(['name' => $name]);

			$success = update_option('authguard_options', $authguard_default_options);

			if ($success) {
				wp_send_json_success(['message' => __('Settings reset successfully.', 'authguard')]);
			} else {
				wp_send_json_error(['error_message' => __('Invalid settings path.', 'authguard')]);
			}
		} else {
			wp_send_json_error(array('error_message' => esc_html__('Nonce verification failed. Please try again.', 'authguard')));
			// wp_die(esc_html__('Nonce verification failed. Please try again.', 'authguard'));
		}
		wp_die();
	}
	public function authguard_reset_settings()
	{
		// wp_send_json_success($_POST['_admin_nonce']);
		if (isset($_POST['_admin_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_admin_nonce'])), 'authguard_admin_nonce')) {
			$name = isset($_POST['name'])?sanitize_text_field(wp_unslash($_POST['name'])):'';
			$authguard_options = authguard_get_option();
			$authguard_default_options = authguard_get_default_options();

			// wp_send_json_success(['name' => $name]);

			$success = $this->reset_option_by_path($authguard_options, $authguard_default_options, $name);

			if ($success) {
				update_option('authguard_options', $authguard_options);
				wp_send_json_success(['message' => __('Settings reset successfully.', 'authguard')]);
			} else {
				wp_send_json_error(['error_message' => __('Invalid settings path.', 'authguard')]);
			}
		} else {
			wp_send_json_error(array('error_message' => esc_html__('Nonce verification failed. Please try again.', 'authguard')));
			// wp_die(esc_html__('Nonce verification failed. Please try again.', 'authguard'));
		}
		wp_die();
	}
	private function reset_option_by_path(&$options, $defaults, $path)
	{
		$keys = explode('.', $path);
		$target = &$options;
		$default = $defaults;

		foreach ($keys as $key) {
			if (!isset($target[$key]) || !isset($default[$key])) {
				return false; // path not found
			}
			$target = &$target[$key];
			$default = $default[$key];
		}

		// Set the value at the final nested level
		$target = $default;
		return true;
	}
	public function authguard_maybe_flush_rules() {
		if (get_option('authguard_flush_rewrite', false)) {
			flush_rewrite_rules();
			delete_option('authguard_flush_rewrite');
		}
	}	
	public static function verify_user_password_ajax() {
		check_ajax_referer('verify_password_nonce', 'nonce');
		
		$password = isset($_POST['password']) ? sanitize_text_field( wp_unslash( $_POST['password'] ) ) : '';
		$user = wp_get_current_user();
		
		// Verify password
		if (wp_check_password($password, $user->user_pass, $user->ID)) {
			wp_send_json_success(array('message' => 'Password verified'));
		} else {
			wp_send_json_error(array('message' => 'Incorrect password. Please try again.'));
		}
	}
}

// new Ajax_API();