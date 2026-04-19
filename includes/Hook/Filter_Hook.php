<?php
namespace MosPress\Authguard\Hook;

if ( ! defined( 'ABSPATH' ) ) exit;

class Filter_Hook {

    private $plugin_slug;      // authguard
    private $plugin_basename;  // authguard/authguard.php
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {

        // Automatically detect plugin slug + basename
        $this->plugin_basename = plugin_basename( AUTHGUARD_MAIN_FILE ); 
        $this->plugin_slug     = dirname( $this->plugin_basename );

        /**
         * Now supports:
         * plugin_action_links_authguard/authguard.php
         * WITHOUT hard-coding strings.
         */
        add_filter(
            "plugin_action_links_{$this->plugin_basename}",
            [ $this, 'authguard_add_action_links' ]
        );

        add_filter('admin_body_class', [ $this, 'authguard_admin_body_class' ]);

        add_filter('authguard_default_options_modify', [ $this, 'modify_authguard_default_options' ]);
        add_filter('authguard_default_colors_modify', [ $this, 'modify_authguard_default_colors' ]);
        add_filter('authguard_default_gradients_modify', [ $this, 'modify_authguard_default_gradients' ]);
        add_filter('authguard_default_tables_modify', [ $this, 'modify_authguard_default_tables' ]);
        add_filter('authguard_default_presets_modify', [ $this, 'modify_authguard_default_presets' ]);

        /**
         * Allow PRO add-ons or Module Federation remotes to inject links dynamically
         */
        add_filter('authguard_action_links_extra', '__return_empty_array');

        

    }

    /**
     * Add Settings link + dynamic injected links
     */
    public function authguard_add_action_links( $links ) {

        $default_links = [
            '<a href="' . admin_url("admin.php?page={$this->plugin_slug}") . '">' .
                esc_html__('Settings', 'authguard') .
            '</a>',
            '<a href="https://mostak-shahid.github.io/plugins/authguard.html" target="_blank">' .
                esc_html__('Docs', 'authguard') .
            '</a>',
            '<a href="https://www.facebook.com/mospressbd" target="_blank">' .
                esc_html__('Community', 'authguard') .
            '</a>',
        ];

        /**
         * Dynamic links injected from PRO plugin or remote MF
         * Example:
         * add_filter( 'authguard_action_links_extra', function($links) {
         *     $links[] = '<a href="https://example.com/pro">Go Pro</a>';
         *     return $links;
         * });
         */
        $extra_links = apply_filters('authguard_action_links_extra', []);

        return array_merge( $default_links, $extra_links, $links );
    }

    /**
     * Add body classes on plugin pages
     */
    public function authguard_admin_body_class( $classes ) {
        // error_log("Filter_Hook constructor called");
        if (function_exists('authguard_is_plugin_page') && authguard_is_plugin_page()) {
            $classes .= ' ' . sanitize_html_class( $this->plugin_slug . '-settings-template' ) . ' ';
        }
        return $classes;
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_authguard_default_options( $opts ) {
        $defaults = [

            'customizer' => [
                'redesign' => [
                    'templates' => [
                        'layout' => 'default-login'
                    ],
                    'background'=> [
                        'type' => 'image', // gradient, image, video
                        'background' => [
                            "image" => [],
                            "color" => "#f0f0f1",
                            "position" => "center",
                            "size" => "auto",
                            "repeat" => "repeat",
                            "origin" => "padding-box",
                            "clip" => "border-box",
                            "attachment" => "scroll",
                        ],
                        'video' => '',
                        'overlay' => '#ffffff00',
                    ],
                    'logo' => [
                        'disabled' => false,
                        'image' => [],
                        'width' => '64px',
                        'height' => '64px',
                        'space' => '24px',
                        'url' => 'https://wordpress.org/'
                    ],
                    'form' => [
                        'wrapper' => [
                            'width' => '320px',
                            'height' => '',
                            'margin' => [],
                            'padding' => [
                                'top' => '5%',
                                'right' => '0px',
                                'bottom' => '0px',
                                'left' => '0px',
                            ],
                            'position' => 'center',
                            'background' => [
                                "image" => [
                                    'id' => '',
                                    'url' => '',
                                ],
                                "color" => "",
                                "position" => "center",
                                "size" => "auto",
                                "repeat" => "repeat",
                                "attachment" => "scroll",
                            ],
                            'border' => [],
                            'border_radius' => '0px',
                            //box-shadow: 0 1px 3px rgba(0, 0, 0, .04);
                            "glass_effect" => false,
                        ],
                        'unit' => [
                            'margin' => [
                                'top' => '24px',
                                'right' => '0px',
                                'bottom' => '24px',
                                'left' => '0px',
                            ],
                            'padding' => [
                                'top' => '26px',
                                'right' => '24px',
                                'bottom' => '26px',
                                'left' => '24px',
                            ],
                            'background' => [
                                "image" => "",
                                "color" => "#fff",
                                "position" => "center",
                                "size" => "auto",
                                "repeat" => "repeat",
                                "attachment" => "scroll",
                            ],
                            'border' => [],
                            'border_radius' => '0px',
                            //box-shadow: 0 1px 3px rgba(0, 0, 0, .04);
                            "glass_effect" => false,

                        ],
                    ],
                    'fields' => [
                        'width' => '100%',
                        'height' => '40px',
                        'font' => [						
                            "enabled" => false,
                            "color" => '#2c3338',
                            "font-size" => '14px', 
                            "font-weight" => '400', 
                            "font-style" => '', 
                            "font-variant" => '', 
                            "font-stretch" => '', 
                            "text-align" => '', 
                            "text-decoration" => '', 
                            "text-transform" => '', 
                        ],
                        'border' => ['color'=> '#8c8f94','style'=> 'solid','width'=> '0.0625rem'],
                        'border_radius' => '4px',
                        'boxshadow' => [],
                        'padding' => [
                            'top' => '0.1875rem',
                            'right' => '0.3125rem',
                            'bottom' => '0.1875rem',
                            'left' => '0.3125rem',
                        ],
                        'margin' => [
                            'top' => '0px',
                            'right' => '6px',
                            'bottom' => '16px',
                            'left' => '0px',
                        ],
                        'background_color' => '#ffffff',
                        'label_font' => [							
                            "enabled" => false,
                            "color" => '#3c434a',
                            "font-size" => '14px', 
                            "font-weight" => '400', 
                            "font-style" => '', 
                            "font-variant" => '', 
                            "font-stretch" => '', 
                            "text-align" => '', 
                            "text-decoration" => '', 
                            "text-transform" => '', 
                        ],
                    ],
                    'button' => [
                        'font' => [
                            "enabled" => false,
                            "color" => '#ffffff',
                            "font-size" => '13px', 
                            "font-weight" => '', 
                            "font-style" => '', 
                            "font-variant" => '', 
                            "font-stretch" => '', 
                            "text-align" => '', 
                            "text-decoration" => '', 
                            "text-transform" => '', 
                        ],
                        'background' => [
                            'normal' => '#2271b1', 
                            'hover' => '#135e96', 
                            'active' => '#135e96',
                        ],
                        'color' => [
                            'normal' => '#ffffff', 
                            'hover' => '#ffffff', 
                            'active' => '#ffffff',
                        ],
                        'padding' => [
                            'top' => '0px',
                            'right' => '12px',
                            'bottom' => '0px',
                            'left' => '12px',
                        ],
                        'margin' => [],
                        'border' => [
                            'color'=> '#2271b1',
                            'style'=> 'solid',
                            'width'=> '1px'
                        ],
                        'border_radius' => '3px',
                        'boxshadow' => [],
                        'textshadow' => [],
                        'size' => 'auto',


                    ],
                ],
            ],	
            'captcha' => [
                'settings' => [
                    'enabled' => true,
                    'selected_captcha' => 'math_captcha', // recaptcha_v2, recaptcha_v3, hcaptcha
                ],
            ],
            'auto_login' => [
                'settings' => [
                    'enabled' => true,
                    'selected_auto_login' => ['link_login'], // link_login, social_login, barcode_login
                ],
                'link_login' => [
                    'enabled' => true,
                ],
                'social_login' => [
                    'enabled' => true,
                ],
                'barcode_login' => [
                    'enabled' => true,
                ]
            ],            
            'login_redirects' => [
                'enabled' => false,
                'rules' => [],
            ],            
            'limit_login_attempts' => [
                'enabled' => false,
                'attempts_allowed' => 5,
                'minutes_lockout' => 5,
                'ip_blacklist' => [],
                'email_blacklist' => [],
                'lockout_message' => 'Too many failed login attempts. Please try again in {minutes} minutes.',
                'disable_xml_rpc_requests' => false,
            ],
            'hide_login' => [
                'login_url' => '',
            ],
            'two_fa_authentication' => [
                'settings' => [
                    'enabled' => true,
                    'enable_backup_codes' => true,
                    'selected_method' => ['email'], // totp, email, hotp,
                ],
            ],
            'misc' => [
                'disable_remember_me' => false,
                'disable_register_link' => false,
                'disable_lost_password' => false,
                'disable_privacy_policy' => false,
                'disable_back_to_website' => false,
                'login_by' => 'both', //username, email, both
                'registered_with_password' => false, //true, false
            ],

            'page' => [
                'background' => [],
                'boxshadow' => [
                    'enabled' => false,
                    'inset' => false,
                ],
                // 'color' => '#ffffff',
                'color' => '',
                // 'gradient' => 'linear-gradient(135deg, #ff8c00 0%, #fcff41 100%)',
                'gradient' => '',
                'font' => [
                    'enabled' => false,
                ],
                'media_uploader' => [],
                'multicolor' => [],
                'repeatable_field' => [
                    ['address' => '123 Main St, Cityville, Country' ],
                    ['address' => '456 Side St, Townsville, Country' ],
                ],
                'textshadow' => [
                    'enabled' => false,
                ],
                'unitcontrol' => '',
            ],
            'basic' => [
                'text' => '',
                'textarea' => '',
                'radio' => 'radio-1',
                'select' => 'select-2',
                'number' => 10,
                'color' => '#ff0000',
                'checkbox' => true,
                'switch' => true,
                'date' => '',
                'time' => '',
                'datetime' => '',

            ],
            'array' => [
                'checkbox' => ['checkbox-1', 'checkbox-3']
            ],
            'more' => [
                'enable_scripts' => false,
                'css' => '/* CSS Code Here */',
                'js' => '// JavaScript Code Here',
                'header_content' => '<!-- Content inside HEAD tag -->',
                'footer_content' => '<!-- Content inside BODY tag -->',
            ],
            'tools' => [
                'hide_plugin' => false, // delete, uninstall, none
                'self_defense' => false, // delete, uninstall, none
                'delete_data_on' => 'none', // delete, uninstall, none
            ]
        ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_authguard_default_colors( $opts ) {
        $defaults = [
            ['name' => esc_html__('Black', 'authguard'), 'color' => '#000000'],
            ['name' => esc_html__('Blue', 'authguard'), 'color' => '#0073AA'],
            ['name' => esc_html__('Cyan', 'authguard'), 'color' => '#00A0D2'],
            ['name' => esc_html__('Deep Blue', 'authguard'), 'color' => '#005075'],
            ['name' => esc_html__('Deep Purple', 'authguard'), 'color' => '#23036A'],
            ['name' => esc_html__('Gold', 'authguard'), 'color' => '#FFB900'],
            ['name' => esc_html__('Gray', 'authguard'), 'color' => '#888888'],
            ['name' => esc_html__('Green', 'authguard'), 'color' => '#008000'],
            ['name' => esc_html__('Light Gray', 'authguard'), 'color' => '#E6E6E6'],
            ['name' => esc_html__('Lime Green', 'authguard'), 'color' => '#82C91E'],
            ['name' => esc_html__('Navy Blue', 'authguard'), 'color' => '#001F3F'],
            ['name' => esc_html__('Orange', 'authguard'), 'color' => '#FF6600'],
            ['name' => esc_html__('Pink', 'authguard'), 'color' => '#FF4081'],
            ['name' => esc_html__('Purple', 'authguard'), 'color' => '#800080'],
            ['name' => esc_html__('Red', 'authguard'), 'color' => '#FF0000'],
            ['name' => esc_html__('Silver', 'authguard'), 'color' => '#C0C0C0'],
            ['name' => esc_html__('White', 'authguard'), 'color' => '#FFFFFF'],
            ['name' => esc_html__('Yellow', 'authguard'), 'color' => '#FFFF00'],
        ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_authguard_default_gradients( $opts ) {
        $defaults = [
            ['name' => esc_html__('Blue to Purple', 'authguard'), 'gradient' => 'linear-gradient(135deg, #0064fa 0%, #800080 100%)'],
            ['name' => esc_html__('Pink to Orange', 'authguard'), 'gradient' => 'linear-gradient(135deg, #ff4081 0%, #ff6600 100%)'],
            ['name' => esc_html__('Cyan to Blue', 'authguard'), 'gradient' => 'linear-gradient(135deg, #00a0d2 0%, #0073aa 100%)'],
            ['name' => esc_html__('Lime Green to Green', 'authguard'), 'gradient' => 'linear-gradient(135deg, #82c91e 0%, #008000 100%)'],
            ['name' => esc_html__('Gold to Orange', 'authguard'), 'gradient' => 'linear-gradient(135deg, #ffb900 0%, #ff6600 100%)'],
            ['name' => esc_html__('Red to Deep Purple', 'authguard'), 'gradient' => 'linear-gradient(135deg, #ff0000 0%, #23036a 100%)'],
            ['name' => esc_html__('Yellow to Lime Green', 'authguard'), 'gradient' => 'linear-gradient(135deg, #ffff00 0%, #82c91e 100%)'],
            ['name' => esc_html__('Silver to Gray', 'authguard'), 'gradient' => 'linear-gradient(135deg, #c0c0c0 0%, #888888 100%)'],
	    ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_authguard_default_tables( $opts ) {
        $defaults = [
            ['authguard_logs'],
	    ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default Presets
     */
    public function modify_authguard_default_presets( $opts ) {
        $defaults = [
            [
                'name' => esc_html__('Default Login', 'authguard'), 
                'template' => 'default-login', 
                'img' => AUTHGUARD_URL . 'assets/images/default-login.png', 
                'preset' => [
                    'customizer' => [
                        'redesign' => [
                            'templates' => [
                                'layout' => 'default-login'
                            ],
                            'form' => [
                                'wrapper' => [
                                    'position' => 'center',
                                ],
                            ],
                        ],
                    ],
                ]
            ],
            [
                'name' => esc_html__('Default Login Left', 'authguard'), 
                'template' => 'default-login-left', 
                'img' => AUTHGUARD_URL . 'assets/images/default-login-left.png', 
                'preset' => [
                    'customizer' => [
                        'redesign' => [
                            'templates' => [
                                'layout' => 'default-login-left'
                            ],
                            'form' => [
                                'wrapper' => [
                                    'position' => 'left',
                                ],
                            ],
                        ],
                    ],
                ]
            ],
            [
                'name' => esc_html__('Default Login Right', 'authguard'), 
                'template' => 'default-login-right', 
                'img' => AUTHGUARD_URL . 'assets/images/default-login-right.png', 
                'preset' => [
                    'customizer' => [
                        'redesign' => [
                            'templates' => [
                                'layout' => 'default-login-right'
                            ],
                            'form' => [
                                'wrapper' => [
                                    'position' => 'right',
                                ],
                            ],
                        ],
                    ],
                ]
            ],
	    ];
        return wp_parse_args( $opts, $defaults );
    }
}
