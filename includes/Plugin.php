<?php

namespace MosPress\Authguard;

defined('ABSPATH') || exit;


use MosPress\Authguard\API\Ajax_API;
use MosPress\Authguard\API\Rest_API;
use MosPress\Authguard\Hook\Action_Hook;
use MosPress\Authguard\Hook\Filter_Hook;
use MosPress\Authguard\Core\ImportExport;
use MosPress\Authguard\Core\More;
use MosPress\Authguard\Core\Tools;
use MosPress\Authguard\Services\Customizer;
use MosPress\Authguard\Services\Math_Captcha;
use MosPress\Authguard\Services\Two_FA;
use MosPress\Authguard\Services\Limit_Login;
use MosPress\Authguard\Services\Hide_Login;
use MosPress\Authguard\Services\Auto_Login;
use MosPress\Authguard\Services\Login_redirect;

use MosPress\Authguard\UserMeta;

class Plugin {

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if (defined('AUTHGUARD_VERSION')) {
			$this->version = AUTHGUARD_VERSION;
		} else {
			$this->version = '1.0.0';
		}

		$this->plugin_name = 'authguard';
		$this->define_admin_hooks();
		$this->define_public_hooks();

		Ajax_API::get_instance();
		Rest_API::get_instance();
		Action_Hook::get_instance();
		Filter_Hook::get_instance();
		
		// Instantiate additional core classes
		new ImportExport();
		new More();
		new Tools();
		new Customizer();
		new Math_Captcha();
		new Two_FA();
		new Limit_Login();
		new Hide_Login();
		new Auto_Login();
		new Login_redirect();
		new UserMeta();
	}


	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks()
	{
		$plugin_admin = new \MosPress\Authguard\Admin\AdminClass($this->plugin_name, $this->version);
		add_action('admin_enqueue_scripts', [$plugin_admin, 'enqueue_styles'], 9999);
		add_action('admin_enqueue_scripts', [$plugin_admin, 'enqueue_scripts'], 9999);
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks()
	{

		$plugin_public = new \MosPress\Authguard\Public\PublicClass($this->plugin_name, $this->version);
		add_action('wp_enqueue_scripts', [$plugin_public, 'enqueue_styles']);
		add_action('wp_enqueue_scripts', [$plugin_public, 'enqueue_scripts']);
		// Save settings by ajax
		add_action('wp_ajax_authguard_ajax_callback', [$plugin_public, 'authguard_ajax_callback']);
		add_action('wp_ajax_nopriv_authguard_ajax_callback', [$plugin_public, 'authguard_ajax_callback']);
	}


    // private static $instance = null;

    // public static function get_instance() {
    //     if (self::$instance === null) {
    //         self::$instance = new self();
    //         self::$instance->init();
    //     }
    //     return self::$instance;
    // }

    public function init() {

		Ajax_API::get_instance();
		Rest_API::get_instance();
		Action_Hook::get_instance();
		Filter_Hook::get_instance();
        
        // add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function enqueue_assets($hook) {

        if ($hook !== 'toplevel_page_authguard') {
            return;
        }

        $asset_path = plugin_dir_path(__DIR__) . 'assets/build/';

        wp_enqueue_style(
            'authguard-style',
            plugins_url('assets/build/app.css', dirname(__FILE__)),
            [],
            filemtime($asset_path . 'app.css')
        );

        wp_enqueue_script(
            'authguard-script',
            plugins_url('assets/build/app.js', dirname(__FILE__)),
            [],
            filemtime($asset_path . 'app.js'),
            true
        );
    }
}
