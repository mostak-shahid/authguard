<?php
namespace MosPress\Authguard\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
use WP_Error;
class Customizer
{

	protected $options;

	public function __construct() {
		$this->options = authguard_get_option();

		add_action('login_enqueue_scripts', [$this, 'enqueue_login_assets'], 20);
	}

	public function enqueue_login_assets() {
		// Enqueue a base style handle to attach inline CSS
		// wp_register_style('authguard-login-style', false); // no external CSS file
		wp_enqueue_style('authguard-login', AUTHGUARD_URL . 'assets/css/login.css', array(), '1.0.0', 'all');
		wp_enqueue_script('authguard-login', AUTHGUARD_URL . 'assets/js/login.js', array('jquery'), '1.0.0', false);
		
		// wp_enqueue_style('authguard-login-style');
		$css = '';

		// Handle Jarallax scripts if video background
		if (
			isset($this->options['customizer']['redesign']['background']['type']) &&
			sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['background']['type'])) === 'video' &&
			isset($this->options['customizer']['redesign']['background']['video'])
		) {
			wp_enqueue_style('jarallax.min', AUTHGUARD_URL . 'assets/plugins/jarallax/jarallax.min.css');
			wp_enqueue_script('jarallax.min', AUTHGUARD_URL . 'assets/plugins/jarallax/jarallax.min.js', ['jquery'], null, true);
			wp_enqueue_script('jarallax-video.min', AUTHGUARD_URL . 'assets/plugins/jarallax/jarallax-video.min.js', ['jquery'], null, true);

			$video = esc_url($this->options['customizer']['redesign']['background']['video'] ?? '');
			// Output the video container markup
			add_action('login_footer', function() use ($video) {
				echo '<div class="jarallax" data-jarallax data-video-src="' . esc_url($video) . '"></div>';
			});
			// Add inline CSS
			$css .= "
			.login .jarallax {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: -2;
			}";

		}

		
		$overlay_color = isset($this->options['customizer']['redesign']['background']['overlay']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['background']['overlay'])) : '';
		
		if ($overlay_color) {
			add_action('login_footer', function () {
				echo '<div class="login-overlay"></div>';
			});
			$css .= "
			.login .login-overlay {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: {$overlay_color};
				z-index: -1;
			}";
		}

		
		$logo_disabled = isset($this->options['customizer']['redesign']['logo']['disabled']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['logo']['disabled'])) : false;
		$logo = isset($this->options['customizer']['redesign']['logo']['image']['url']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['logo']['image']['url'])) : '';
		$width = isset($this->options['customizer']['redesign']['logo']['width']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['logo']['width'])) : '';
		$height = isset($this->options['customizer']['redesign']['logo']['height']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['logo']['height'])) : '';
		$space = isset($this->options['customizer']['redesign']['logo']['space']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['logo']['space'])) : '';

		

		$css .= ".login h1 a {";
			$css .= "display: " . ($logo_disabled ? 'none' : 'block') . ";";
			if ($space) $css .= "margin: 0 auto {$space};";
			$css .= "background-repeat: no-repeat;";
			$css .= "background-position: center;";
			$css .= "background-size: contain;";
			if ($width) $css .= "width: {$width};";
			if ($height) $css .= "height: {$height};";
			if ($logo) $css .= "background-image: url('{$logo}');";			
			$css .= "z-index: 2; ";
			$css .= "position: relative;;";
		$css .= "}";
		
		
		$wrapper_width = isset($this->options['customizer']['redesign']['form']['wrapper']['width']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['width'])) : '320px';
		$wrapper_height = isset($this->options['customizer']['redesign']['form']['wrapper']['height']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['height'])) : '';
		$wrapper_margin = isset($this->options['customizer']['redesign']['form']['wrapper']['margin']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['margin']), 'sanitize_text_field') : [];
		$wrapper_padding = isset($this->options['customizer']['redesign']['form']['wrapper']['padding']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['padding']), 'sanitize_text_field') : ['top' => '5%','right' => '0px','bottom' => '0px','left' => '0px',];
		$wrapper_position = isset($this->options['customizer']['redesign']['form']['wrapper']['position']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['position'])) : 'center';
		$wrapper_background = isset($this->options['customizer']['redesign']['form']['wrapper']['background']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['background']), 'sanitize_text_field') : [];
		$wrapper_border = isset($this->options['customizer']['redesign']['form']['wrapper']['border']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['border']), 'sanitize_text_field') : [];
		$wrapper_border_radius = isset($this->options['customizer']['redesign']['form']['wrapper']['border_radius']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['border_radius'])) : '';
		$wrapper_glass_effect = isset($this->options['customizer']['redesign']['form']['wrapper']['glass_effect']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['wrapper']['glass_effect'])) : false;

		$css .= "#login {";
		if ($wrapper_width) {
			$css .= "width: 100%;";
			$css .= "max-width: {$wrapper_width};";
		}
		if ($wrapper_height) {
			$css .= "height: {$wrapper_height};";
		}
		$css .= $this->authguard_generate_boxcontrol_css($wrapper_padding);
		$css .= $this->authguard_generate_boxcontrol_css($wrapper_margin, 'margin');

		if ($wrapper_position == 'left') {$css .= "margin-left: 0;";}
		else if ($wrapper_position == 'right') {$css .= "margin-right: 0;";}
		else {$css .= "margin: auto;";}
		$css .= $this->authguard_generate_background_css($wrapper_background);
		$css .= $this->authguard_generate_border_css($wrapper_border);
		if ($wrapper_border_radius) {
			$css .= "border-radius: {$wrapper_border_radius};";
		}
		if ($wrapper_glass_effect) {
			$css .= "backdrop-filter: blur(10px) saturate(180%); -webkit-backdrop-filter: blur(10px) saturate(180%);";
			$wrapper_background_color = isset($wrapper_background['color']) ? sanitize_text_field(wp_unslash($wrapper_background['color'])) : '';
			if ($wrapper_background_color) {
				$css .= "background-color: {$wrapper_background_color}80;";
			} else {
				$css .= "background-color: #ffffff80;";
			}
		}
		$css .= "box-sizing: border-box;";
		$css .= "}";

		$unit_margin = isset($this->options['customizer']['redesign']['form']['unit']['margin']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['unit']['margin']), 'sanitize_text_field') : ['top' => '5%','right' => '0px','bottom' => '0px','left' => '0px',];
		$unit_padding = isset($this->options['customizer']['redesign']['form']['unit']['padding']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['unit']['padding']), 'sanitize_text_field') : ['top' => '5%','right' => '0px','bottom' => '0px','left' => '0px',];
		$unit_background = isset($this->options['customizer']['redesign']['form']['unit']['background']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['unit']['background']), 'sanitize_text_field') : [];
		$unit_border = isset($this->options['customizer']['redesign']['form']['unit']['border']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['form']['unit']['border']), 'sanitize_text_field') : [];
		$unit_border_radius = isset($this->options['customizer']['redesign']['form']['unit']['border_radius']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['unit']['border_radius'])) : '';
		$unit_glass_effect = isset($this->options['customizer']['redesign']['form']['unit']['glass_effect']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['form']['unit']['glass_effect'])) : false;
		
		$css .= ".login form {";
		
		$css .= $this->authguard_generate_boxcontrol_css($unit_padding);
		$css .= $this->authguard_generate_boxcontrol_css($unit_margin, 'margin');
		$css .= $this->authguard_generate_background_css($unit_background);
		$css .= $this->authguard_generate_border_css($unit_border);

		if ($unit_border_radius) {
			$css .= "border-radius: {$unit_border_radius};";
		}
		if ($unit_glass_effect) {
			$css .= "backdrop-filter: blur(10px) saturate(180%); -webkit-backdrop-filter: blur(10px) saturate(180%);";
			$unit_background_color      = isset($unit_background['color']) ? sanitize_text_field(wp_unslash($unit_background['color'])) : '';
			if ($unit_background_color) {
				$css .= "background-color: {$unit_background_color}80;";
			} else {
				$css .= "background-color: #ffffff80;";
			}
		}
		$css .= "}";
		

		
		$disable_remember_me       = isset($this->options['customizer']['redesign']['other']['disable_remember_me']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['other']['disable_remember_me'])) : false;
		if ($disable_remember_me) {
			$css .= ".login #loginform .forgetmenot { display: none; }";
		}
		$fields_width       = isset($this->options['customizer']['redesign']['fields']['width']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['fields']['width'])) : '100%';
		$fields_height       = isset($this->options['customizer']['redesign']['fields']['height']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['fields']['height'])) : '40px';
		$fields_font       = isset($this->options['customizer']['redesign']['fields']['font']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['fields']['font']), 'sanitize_text_field') : [];		
		$fields_border = isset($this->options['customizer']['redesign']['fields']['border']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['fields']['border']), 'sanitize_text_field') : [];
		$fields_border_radius = isset($this->options['customizer']['redesign']['fields']['border_radius']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['fields']['border_radius'])) : '4px';
		$fields_boxshadow = isset($this->options['customizer']['redesign']['fields']['boxshadow']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['fields']['boxshadow']), 'sanitize_text_field') : [];	
		$fields_padding = isset($this->options['customizer']['redesign']['fields']['padding']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['fields']['padding']), 'sanitize_text_field') : ['top' => '10px','right' => '10px','bottom' => '10px','left' => '10px',];
		$fields_margin = isset($this->options['customizer']['redesign']['fields']['margin']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['fields']['margin']), 'sanitize_text_field') : ['top' => '0px','right' => '0px','bottom' => '10px','left' => '0px',];
		$fields_background_color = isset($this->options['customizer']['redesign']['fields']['background_color']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['fields']['background_color'])) : '#ffffff';
		$fields_label_font = isset($this->options['customizer']['redesign']['fields']['label_font']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['fields']['label_font']), 'sanitize_text_field') : [];
		$css .= '.login form input[type="text"], .login form input[type="password"], .login form input[type="color"], .login form input[type="date"], .login form input[type="datetime"], .login form input[type="datetime-local"], .login form input[type="email"], .login form input[type="month"], .login form input[type="number"], .login form input[type="search"], .login form input[type="tel"], .login form input[type="time"], .login form input[type="url"], .login form input[type="week"], .login form select, .login form textarea {';
		if ($fields_width) {
			$css .= "width: {$fields_width}; max-width: 100%;";
		}
		
		$css .= $this->authguard_generate_font_css($fields_font);
		$css .= $this->authguard_generate_border_css($fields_border);
		if ($fields_border_radius) {
			$css .= "border-radius: {$fields_border_radius};";
		}
		$css .= $this->authguard_generate_boxshadow_css($fields_boxshadow);
		$css .= $this->authguard_generate_boxcontrol_css($fields_padding);
		$css .= $this->authguard_generate_boxcontrol_css($fields_margin, 'margin');
		if ($fields_background_color) {
			$css .= "background-color: {$fields_background_color};";
		}
		$css .= "}";
		
		$css .= '.login form input[type="text"], .login form input[type="password"], .login form input[type="color"], .login form input[type="date"], .login form input[type="datetime"], .login form input[type="datetime-local"], .login form input[type="email"], .login form input[type="month"], .login form input[type="number"], .login form input[type="search"], .login form input[type="tel"], .login form input[type="time"], .login form input[type="url"], .login form input[type="week"], .login form select {';
		if ($fields_height) {
			$css .= "height: {$fields_height};";
		}
		$css .= "}";
		$css .= '.login form label {';
		$css .= $this->authguard_generate_font_css($fields_label_font);
		$css .= "}";

		$button_font = isset($this->options['customizer']['redesign']['button']['font']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['font']), 'sanitize_text_field') : [];
		$button_background = isset($this->options['customizer']['redesign']['button']['background']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['background']), 'sanitize_text_field') : [];	
		$button_color = isset($this->options['customizer']['redesign']['button']['color']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['color']), 'sanitize_text_field') : [];	
		$button_padding = isset($this->options['customizer']['redesign']['button']['padding']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['padding']), 'sanitize_text_field') : [];	
		$button_margin = isset($this->options['customizer']['redesign']['button']['margin']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['margin']), 'sanitize_text_field') : [];	
		$button_margin = isset($this->options['customizer']['redesign']['button']['margin']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['margin']), 'sanitize_text_field') : [];	
		$button_border = isset($this->options['customizer']['redesign']['button']['border']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['border']), 'sanitize_text_field') : [];	
		$button_border_radius = isset($this->options['customizer']['redesign']['button']['border_radius']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['button']['border_radius'])) : '0px';
		$button_boxshadow = isset($this->options['customizer']['redesign']['button']['boxshadow']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['boxshadow']), 'sanitize_text_field') : [];	
		$button_textshadow = isset($this->options['customizer']['redesign']['button']['textshadow']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['button']['textshadow']), 'sanitize_text_field') : [];	
		$button_size = isset($this->options['customizer']['redesign']['button']['size']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['button']['size'])) : 'auto';

		$css .= '.login form .submit .button-primary {';
		$css .= $this->authguard_generate_font_css($button_font);
		$css .= $this->authguard_generate_background_css($button_background);
		// $css .= $this->authguard_generate_color_css($button_color);
		$css .= $this->authguard_generate_boxcontrol_css($button_padding);
		$css .= $this->authguard_generate_boxcontrol_css($button_margin, 'margin');
		$css .= $this->authguard_generate_border_css($button_border);
		if ($button_border_radius) {
			$css .= "border-radius: {$button_border_radius};";
		}
		$css .= $this->authguard_generate_boxshadow_css($button_boxshadow);
		$css .= $this->authguard_generate_textshadow_css($button_textshadow);
		if ($button_size && $button_size != 'auto') {
			$css .= "width: 100%;";
		}
		isset($button_background['normal'])? $css .= 'background-color: '.sanitize_text_field(wp_unslash($button_background['normal'])).';':'';
		isset($button_color['normal'])? $css .= 'color: '.sanitize_text_field(wp_unslash($button_color['normal'])).';':'';
		$css .= "}";

		// Button hover states
		$css .= '.login form .submit .button-primary.hover, .login form .submit .button-primary:hover, .login form .submit .button-primary.focus, .login form .submit .button-primary:focus {';
		isset($button_background['hover'])? $css .= 'background-color: '.sanitize_text_field(wp_unslash($button_background['hover'])).';':'';
		isset($button_color['hover'])? $css .= 'color: '.sanitize_text_field(wp_unslash($button_color['hover'])).';':'';
		$css .= "}";

		// Button active states
		$css .= '.login form .submit .button-primary.active, .login form .submit .button-primary.active:hover, .login form .submit .button-primary.active:focus, .login form .submit .button-primary:active {';		
			isset($button_background['active'])? $css .= 'background-color: '.sanitize_text_field(wp_unslash($button_background['active'])).';':'';
			isset($button_color['active'])? $css .= 'color: '.sanitize_text_field(wp_unslash($button_color['active'])).';':'';
		$css .= "}";


		$type = isset($this->options['customizer']['redesign']['background']['type']) ? sanitize_text_field(wp_unslash($this->options['customizer']['redesign']['background']['type'])) : 'color';
		$background = isset($this->options['customizer']['redesign']['background']['background']) ? map_deep(wp_unslash($this->options['customizer']['redesign']['background']['background']), 'sanitize_text_field') : [];


		$css .= ".login {";
		if ($type != 'video')
		$css .= $this->authguard_generate_background_css($background);
		$css .= "}";

		wp_add_inline_style('authguard-login', $css);
	}
}