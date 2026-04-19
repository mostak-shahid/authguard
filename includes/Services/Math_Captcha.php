<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Math_Captcha

{
	protected $options;

	public function __construct()
	{
		$this->options = authguard_get_option();
		$captcha_settings_enabled = (
				isset($this->options['captcha']['settings']['enabled']) &&
				!empty($this->options['captcha']['settings']['enabled'])
			) ? sanitize_text_field(wp_unslash($this->options['captcha']['settings']['enabled'])) : false;
		
		if ($captcha_settings_enabled) {
			add_action('login_head', [$this, 'add_header_script'], 9999);
			add_action('login_footer', [$this, 'add_footer_script'], 9999);
		}
	}

	//add_action('woocommerce_init', $plugin_public, 'ultimate_product_badge_for_woocommerce_add_badge', 9);
	public function add_header_script()
	{
		// echo wp_kses_post($this->options['more']['header_content']) ?? '';
		wp_enqueue_script('jquery.captcha.basic.min', AUTHGUARD_URL . 'assets/plugins/basic-math-captcha/jquery.captcha.basic.min.js', array('jquery'), '1.0.0', false);
	}
	public function add_footer_script()
	{
		?>
		<script>
			jQuery(document).ready(function($) { 			
				$('#loginform, #registerform, #lostpasswordform, #resetpassform').captcha();
			});
		</script>
		<style>
			#captchaInput {
				width: 2.5em;
				margin-left: .5em;
			}
		</style>
		<?php
	}
}