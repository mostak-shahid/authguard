<?php

namespace MosPress\Authguard\Public;

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://mostak-shahid.github.io/
 * @since      1.0.0
 *
 * @package    Authguard
 * @subpackage Authguard/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Authguard
 * @subpackage Authguard/public
 * @author     Md. Mostak Shahid <mostak.shahid@gmail.com>
 */
class PublicClass
{

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct($plugin_name, $version)
	{

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		// add_action('wp_footer', function () {
		// 	echo '<pre>';
		// 	print_r(get_option('authguard_options'));
		// 	echo '</pre>';
		// });
	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles()
	{

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
		wp_enqueue_style('authguard', AUTHGUARD_URL . 'assets/css/style.css', array(), $this->version, 'all');
		// wp_enqueue_style( 'authguard', plugin_dir_url( __FILE__ ) . 'css/authguard-public.css', array(), $this->version, 'all' );
		wp_enqueue_style('authguard' . '-public', AUTHGUARD_URL . 'public/css/public-style.css', array(), $this->version, 'all');
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts()
	{

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		// wp_enqueue_script($this->plugin_name, plugin_dir_url(__DIR__) . 'assets/js/script.js', array('jquery'), $this->version, false);
		wp_enqueue_script('authguard', AUTHGUARD_URL . 'assets/js/script.js', array('jquery'), $this->version, false);
		wp_enqueue_script('authguard' . '-public-ajax', AUTHGUARD_URL . 'public/js/public-ajax.js', array('jquery'), $this->version, false);
		wp_enqueue_script('authguard' . '-public-script', AUTHGUARD_URL . 'public/js/public-script.js', array('jquery'), $this->version, false);
		$ajax_params = array(
			'admin_url' => admin_url(),
			'ajax_url' => admin_url('admin-ajax.php'),
			'_wp_nonce' => esc_attr(wp_create_nonce('authguard_wp_nonce')),
			// 'install_plugin_wpnonce' => esc_attr(wp_create_nonce('updates')),
		);
		wp_localize_script('authguard' . '-public-ajax', 'authguard_ajax_obj', $ajax_params);
	}
	public function authguard_ajax_callback()
	{
		if (isset($_POST['_wp_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wp_nonce'])), 'authguard_wp_nonce')) {
			// wp_send_json_success(array('variation_id' => $variation_id, 'price' => $price));
			wp_send_json_success();
		} else {
			wp_send_json_error(array('error_message' => esc_html__('Nonce verification failed. Please try again.', 'authguard')));
			// wp_die(esc_html__('Nonce verification failed. Please try again.', 'authguard'));
		}
		wp_die();
	}
}



