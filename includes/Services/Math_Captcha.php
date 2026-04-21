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
			add_action('login_enqueue_scripts', [$this, 'enqueue_assets'], 21);
		}
	}

	public function enqueue_assets()
	{
		wp_enqueue_script('jquery.captcha.basic.min', AUTHGUARD_URL . 'assets/plugins/basic-math-captcha/jquery.captcha.basic.min.js', array('jquery'), '1.0.0', false);

		wp_add_inline_style('authguard-login', '#captchaInput { width: 2.5em; margin-left: .5em; }');

		wp_add_inline_script('authguard-login', "jQuery(document).ready(function(\$) { \$('#loginform, #registerform, #lostpasswordform, #resetpassform').captcha(); });");
	}
}
