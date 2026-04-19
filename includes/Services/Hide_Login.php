<?php
namespace MosPress\Authpress\Services;
if ( ! defined( 'ABSPATH' ) ) exit;
class Hide_Login
{
/**
     * The custom login slug (default: 'login')
     * Change it to whatever you like, e.g. 'signin', 'access', etc.
     */
    private $login_slug = '';

	public function __construct()
	{
		$options = authguard_get_option();
		$this->login_slug = (
				isset($options['hide_login']['login_url']) &&
				!empty($options['hide_login']['login_url'])
			) ? sanitize_text_field(wp_unslash($options['hide_login']['login_url'])) : '';
		error_log('Custom login slug: ' . $this->login_slug);
 		if ($this->login_slug) {
			// Setup rewrite and blocking
			// add_action( 'init', [ $this, 'add_rewrite_rule' ] );
			// add_filter( 'query_vars', [ $this, 'register_query_var' ] );
			// add_filter( 'template_include', [ $this, 'render_login_template' ] );
			// add_action( 'init', [ $this, 'block_wp_login' ], 1 );
			add_action( 'init', [ $this, 'add_rewrite_rule' ] );
			add_filter( 'query_vars', [ $this, 'register_query_var' ] );
			add_action( 'template_redirect', [ $this, 'load_default_login_template' ] );
			add_action( 'wp_loaded', [ $this, 'block_wp_login' ], 1 );
		}

        // Flush rewrite rules on activation
        register_activation_hook( __FILE__, [ $this, 'activate' ] );
        register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );
	}


    /**
     * Add rewrite rule for the custom login URL
     */
    public function add_rewrite_rule() {
        // Support multisite or single
        if ( is_multisite() ) {
            $blog_id = get_current_blog_id();
            add_rewrite_rule( '^site' . $blog_id . '-' . $this->login_slug . '/?$', 'index.php?authguard_login=1', 'top' );
        } else {
            add_rewrite_rule( '^' . $this->login_slug . '/?$', 'index.php?authguard_login=1', 'top' );
        }
    }

    /**
     * Register our custom query var
     */
    public function register_query_var( $vars ) {
        $vars[] = 'authguard_login';
        return $vars;
    }

    /**
     * Render the login form on the custom URL
     */
    // public function render_login_template( $template ) {
    //     if ( get_query_var( 'authguard_login' ) ) {
    //         status_header( 200 );
    //         nocache_headers();

    //         // Simple HTML layout with WordPress login form
    //         echo '<!DOCTYPE html><html ' . get_language_attributes() . '><head>';
    //         wp_head();
    //         echo '<title>' . get_bloginfo( 'name' ) . ' &rsaquo; Login</title>';
    //         echo '<style>
    //             body { font-family: sans-serif; background: #f9f9f9; }
    //             .authguard-login-wrapper { max-width: 400px; margin: 80px auto; padding: 40px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    //         </style>';
    //         echo '</head><body>';
    //         echo '<div class="authguard-login-wrapper">';
    //         wp_login_form();
    //         echo '</div>';
    //         wp_footer();
    //         echo '</body></html>';
    //         exit;
    //     }
    //     return $template;
    // }


    /**
     * Load the default WP login template (wp-login.php)
     */

    public function load_default_login_template() {
        if ( get_query_var( 'authguard_login' ) ) {
            // Mimic wp-login.php behavior
            global $pagenow;
            $pagenow = 'wp-login.php';
            // Set up required constants
            if ( ! defined( 'WP_LOGIN_PATH' ) ) {
                define( 'WP_LOGIN_PATH', ABSPATH . 'wp-login.php' );
            }
            if ( file_exists( WP_LOGIN_PATH ) ) {
                require_once WP_LOGIN_PATH;
                exit;
            } else {
                wp_die( 'Login template missing.' );
            }
        }
    }

    /**
     * Block access to /wp-login.php and show 404
     */
    public function block_wp_login() {
        global $pagenow;

        if ( $pagenow === 'wp-login.php' ) {
            status_header( 404 );
            nocache_headers();

            // Use the theme's 404 template if available
            $template = get_404_template();
            if ( $template ) {
                include $template;
            } else {
                echo '<h1>404 Not Found</h1><p>This page does not exist.</p>';
            }
            exit;
        }
    }

    /**
     * Flush rewrite rules on plugin activation
     */
    public function activate() {
        $this->add_rewrite_rule();
        flush_rewrite_rules();
    }

    /**
     * Flush rewrite rules on deactivation
     */
    public function deactivate() {
        flush_rewrite_rules();
    }
}