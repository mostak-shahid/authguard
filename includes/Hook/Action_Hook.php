<?php
namespace MosPress\Authguard\Hook;
if ( ! defined( 'ABSPATH' ) ) exit;
class Action_Hook
{
	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;
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
        $this->plugin_name = 'authguard';
        add_action('admin_init', [$this, 'authguard_do_activation_redirect']);
        add_action('admin_menu', [$this, 'authguard_admin_menu']);
        add_action('current_screen', [$this, 'authguard_hide_admin_notices']);
        add_action('admin_head', [$this, 'authguard_option_form_submit']);
        add_action('upgrader_process_complete', [$this, 'authguard_update_completed'], 10, 2);
		
    }

	/**
	 * Redirect to the welcome pages.
	 *
	 * @since    1.0.0
	 */
	public function authguard_do_activation_redirect()
	{
		if (get_option('authguard_do_activation_redirect')) {
			delete_option('authguard_do_activation_redirect');
			wp_safe_redirect(admin_url('admin.php?page=' . $this->plugin_name));
		}
	}


	/**
	 * Adding menu to admin menu.
	 *
	 * @since    1.0.0
	 */
	public function authguard_admin_menu()
	{
		add_menu_page(
			esc_html(AUTHGUARD_NAME),
			esc_html(AUTHGUARD_NAME),
			'manage_options',
			$this->plugin_name,
			array($this, 'authguard_dashboard_react_page_html'),
			AUTHGUARD_URL . 'admin/images/menu-icon.svg',
			57
		);
	}
	/**
	 * Loading plugin Welcome page.
	 *
	 * @since    1.0.0
	 */
	public function authguard_dashboard_php_page_html()
	{
		if (!current_user_can('manage_options')) {
			return;
		}
		// include_once(AUTHGUARD_PATH . 'admin/partials/' . $this->plugin_name . '-admin-display.php');
		echo '<div id="authguard-settings-react-app"></div>';
	}
	public function authguard_dashboard_react_page_html()
	{
		if (!current_user_can('manage_options')) {
			return;
		}
		include_once(AUTHGUARD_PATH . 'admin/partials/' . $this->plugin_name . '-admin-display-react.php');
	}

	/**
	 * Removing all notieces from settings page.
	 *
	 * @since    1.0.0
	 */
	public function authguard_hide_admin_notices()
	{
		// $current_screen = get_current_screen();
		// var_dump($current_screen->id);
		if (authguard_is_plugin_page()) {
			remove_all_actions('user_admin_notices');
			remove_all_actions('admin_notices');
		}
	}
	public function authguard_option_form_submit()
	{
		$authguard_options = array_replace_recursive(authguard_get_option(), get_option('authguard_options', []));
		if (isset($_POST['authguard_options_form_field']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['authguard_options_form_field'])), 'authguard_options_form_action')) {

			$err = 0;
			if (isset($_POST["authguard_options"]["base_input"]["submit"])) {

				$authguard_options["base_input"]["text_input"] = isset($_POST["authguard_options"]["base_input"]["text_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["text_input"])) : '';

				$authguard_options["base_input"]["email_input"] = isset($_POST["authguard_options"]["base_input"]["email_input"]) ? sanitize_email(wp_unslash($_POST["authguard_options"]["base_input"]["email_input"])) : '';

				$authguard_options["base_input"]["color_input"] = isset($_POST["authguard_options"]["base_input"]["color_input"]) ? sanitize_hex_color(wp_unslash($_POST["authguard_options"]["base_input"]["color_input"])) : '';

				$authguard_options["base_input"]["date_input"] = isset($_POST["authguard_options"]["base_input"]["date_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["date_input"])) : '';

				$authguard_options["base_input"]["datetime_local_input"] = isset($_POST["authguard_options"]["base_input"]["datetime_local_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["datetime_local_input"])) : '';

				$authguard_options["base_input"]["textarea_input"] = isset($_POST["authguard_options"]["base_input"]["textarea_input"]) ? sanitize_textarea_field(wp_unslash($_POST["authguard_options"]["base_input"]["textarea_input"])) : '';

				$authguard_options["base_input"]["switch_input"] = isset($_POST["authguard_options"]["base_input"]["switch_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["switch_input"])) : '';

				$authguard_options["base_input"]["radio_input"] = isset($_POST["authguard_options"]["base_input"]["radio_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["radio_input"])) : '';

				$authguard_options["base_input"]["datalist_input"] = isset($_POST["authguard_options"]["base_input"]["datalist_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["datalist_input"])) : '';

				$authguard_options["base_input"]["select_input"] = isset($_POST["authguard_options"]["base_input"]["select_input"]) ? sanitize_text_field(wp_unslash($_POST["authguard_options"]["base_input"]["select_input"])) : '';
			}
			if (isset($_POST["authguard_options"]["array_input"]["submit"])) {

				$authguard_options["array_input"]["checkbox_input"] = isset($_POST["authguard_options"]["array_input"]["checkbox_input"]) ? array_map('sanitize_text_field', wp_unslash($_POST["authguard_options"]["array_input"]["checkbox_input"])) : [];

				$authguard_options["array_input"]["multi-select_input"] = isset($_POST["authguard_options"]["array_input"]["multi-select_input"]) ? array_map('sanitize_text_field', wp_unslash($_POST["authguard_options"]["array_input"]["multi-select_input"])) : [];
			}
			$authguard_options["editor_input"] = isset($_POST["authguard_options"]["editor_input"]) ? wp_kses_post(wp_unslash($_POST["authguard_options"]["editor_input"])) : '';

			if (!$err) {
				$_POST['settings-updated'] = true;
			}

			// var_dump($_POST);
		}
		update_option('authguard_options', $authguard_options);
	}
	public function authguard_update_completed($upgrader_object, $options)
	{

		// If an update has taken place and the updated type is plugins and the plugins element exists
		if ($options['action'] == 'update' && $options['type'] == 'plugin' && isset($options['plugins'])) {
			foreach ($options['plugins'] as $plugin) {
				// Check to ensure it's my plugin
				if ($plugin == plugin_basename(AUTHGUARD_MAIN_FILE)) {
					// do stuff here
					$authguard_options = array_replace_recursive(authguard_get_option(), get_option('authguard_options', []));
					update_option('authguard_options', $authguard_options);
				}
			}
		}
	}
	public static function authguard_deactivation_scripts()
	{
		?>
		<!-- Password Modal -->
		<div id="password-modal">
			<div class="modal-content">
				<div class="modal-header">Verify Your Password</div>
				<div class="modal-body">
					<label for="plugin-password">Enter your current password to deactivate this plugin:</label>
					<input type="password" id="plugin-password" class="modal-input" placeholder="Password">
					<div id="password-error" class="modal-error"></div>
				</div>
				<div class="modal-footer">
					<button type="button" id="cancel-deactivation" class="button">Cancel</button>
					<button type="button" id="verify-password" class="button button-primary">Verify & Deactivate</button>
				</div>
			</div>
		</div>
		<script type="text/javascript">
			jQuery(document).ready(function($) {
				var deactivateUrl = '';
				
				// Intercept deactivate link click
				$('tr[data-plugin="authguard/authguard.php"] .deactivate a').on('click', function(e) {
					e.preventDefault();
					deactivateUrl = $(this).attr('href');
					$('#password-modal').show();
					$('#plugin-password').focus();
				});
				
				// Close modal
				$('#cancel-deactivation, #password-modal').on('click', function(e) {
					if (e.target === this) {
						$('#password-modal').hide();
						$('#plugin-password').val('');
						$('#password-error').hide();
					}
				});
				
				// Verify password and deactivate
				$('#verify-password').on('click', function() {
					var password = $('#plugin-password').val();
					
					$.ajax({
						url: ajaxurl,
						type: 'POST',
						data: {
							action: 'verify_user_password',
							password: password,
							nonce: '<?php echo esc_html( wp_create_nonce( 'verify_password_nonce' ) ); ?>'
						},
						success: function(response) {
							if (response.success) {
								// Password correct, proceed with deactivation
								window.location.href = deactivateUrl;
							} else {
								// Password incorrect
								$('#password-error').text(response.data.message).show();
								$('#plugin-password').val('').focus();
							}
						}
					});
				});
				
				// Allow Enter key to submit
				$('#plugin-password').on('keypress', function(e) {
					if (e.which === 13) {
						$('#verify-password').click();
					}
				});
			});
		</script>
		<?php
	}
}
