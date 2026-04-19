<?php
/**
 * WP-CLI Commands
 *
 * @package Authpress
 * @subpackage CLI
 */

namespace MosPress\Authpress\CLI;
use WP_CLI;

/**
 * Class CLI_Command
 *
 * Handles WP-CLI commands for AuthGuard.
 */
class CLI_Command {

    /**
     * Seed the logs table with sample data.
     *
     * ## OPTIONS
     *
     * [--count=<number>]
     * : Number of log entries to create. Default: 10
     *
     * ## EXAMPLES
     *
     *     # Create 10 log entries (default)
     *     wp authguard seed-logs
     *
     *     # Create 50 log entries
     *     wp authguard seed-logs --count=50
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function seed_logs( $args, $assoc_args ) {
        global $wpdb;

        // Get parameters with defaults
        $count = isset( $assoc_args['count'] ) ? absint( $assoc_args['count'] ) : 10;
        
        $table_name = $wpdb->prefix . 'authguard_logs';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist. Please activate the plugin first." );
            return;
        }

        WP_CLI::log( "Starting to seed {$count} log entries..." );

        $progress = \WP_CLI\Utils\make_progress_bar( 'Seeding logs', $count );

        $inserted = 0;
        $failed = 0;

        for ( $i = 1; $i <= $count; $i++ ) {
            // Generate random data for each log entry
            $user_id = rand( 1, 10 );
            $ip = $this->generate_random_ip();
            $user_agent = $this->generate_random_user_agent();
            $created_at = $this->generate_random_date_last_10_days();
            
            $title = $this->generate_lorem_title();
            $description = $this->generate_lorem_description();
            $category = $this->generate_random_category();

            $result = $wpdb->insert(
                $table_name,
                array(
                    'user_id'     => $user_id,
                    'ip'          => $ip,
                    'user_agent'  => $user_agent,
                    'title'       => $title,
                    'category'    => $category,
                    'description' => $description,
                    'created_at'  => $created_at,
                ),
                array(
                    '%d', // user_id
                    '%s', // ip
                    '%s', // user_agent
                    '%s', // title
                    '%s', // description
                    '%s', // data
                    '%s', // created_at
                )
            );

            if ( $result ) {
                $inserted++;
            } else {
                $failed++;
                WP_CLI::debug( "Failed to insert log entry #{$i}: " . $wpdb->last_error );
            }

            $progress->tick();
        }

        $progress->finish();

        // Summary
        WP_CLI::success( sprintf(
            'Successfully inserted %d log entries. Failed: %d',
            $inserted,
            $failed
        ) );

        // Show sample of inserted data
        $this->show_sample_logs( 5 );
    }

    /**
     * Clear all logs from the table.
     *
     * ## OPTIONS
     *
     * [--yes]
     * : Skip confirmation prompt.
     *
     * ## EXAMPLES
     *
     *     # Clear logs with confirmation
     *     wp authguard clear-logs
     *
     *     # Clear logs without confirmation
     *     wp authguard clear-logs --yes
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function clear_logs( $args, $assoc_args ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'authguard_logs';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        // Get count before deletion
        $count = $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" );

        if ( $count == 0 ) {
            WP_CLI::warning( 'No logs found in the table.' );
            return;
        }

        // Confirmation prompt (unless --yes flag is set)
        if ( ! isset( $assoc_args['yes'] ) ) {
            WP_CLI::confirm(
                sprintf( 'Are you sure you want to delete %d log entries?', $count ),
                $assoc_args
            );
        }

        // Delete all rows
        $result = $wpdb->query( "TRUNCATE TABLE {$table_name}" );

        if ( false === $result ) {
            WP_CLI::error( 'Failed to clear logs: ' . $wpdb->last_error );
        } else {
            WP_CLI::success( sprintf( 'Successfully deleted %d log entries.', $count ) );
        }
    }

    /**
     * Show recent logs from the table.
     *
     * ## OPTIONS
     *
     * [--limit=<number>]
     * : Number of logs to display. Default: 10
     *
     * [--format=<format>]
     * : Output format (table, csv, json, yaml). Default: table
     *
     * ## EXAMPLES
     *
     *     # Show 10 recent logs
     *     wp authguard show-logs
     *
     *     # Show 20 recent logs in JSON format
     *     wp authguard show-logs --limit=20 --format=json
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function show_logs( $args, $assoc_args ) {
        global $wpdb;

        $limit = isset( $assoc_args['limit'] ) ? absint( $assoc_args['limit'] ) : 10;
        $format = isset( $assoc_args['format'] ) ? $assoc_args['format'] : 'table';
        
        $table_name = $wpdb->prefix . 'authguard_logs';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, user_id, ip, title, LEFT(description, 50) as description, created_at 
                FROM {$table_name} 
                ORDER BY ID DESC 
                LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        if ( empty( $results ) ) {
            WP_CLI::warning( 'No logs found.' );
            return;
        }

        WP_CLI\Utils\format_items( $format, $results, array( 'ID', 'user_id', 'ip', 'title', 'description', 'created_at' ) );
    }

    /**
     * Generate a random valid IP address (IPv4).
     *
     * @return string
     */
    private function generate_random_ip() {
        // Generate random IPv4 address
        // Avoid special ranges (like 0.x.x.x, 127.x.x.x, 224-255.x.x.x)
        $first_octet = rand( 1, 223 );
        if ( $first_octet == 127 ) {
            $first_octet = 128; // Skip localhost range
        }
        
        return sprintf(
            '%d.%d.%d.%d',
            $first_octet,
            rand( 0, 255 ),
            rand( 0, 255 ),
            rand( 1, 254 )
        );
    }

    /**
     * Generate a random user agent string.
     *
     * @return string
     */
    private function generate_random_user_agent() {
        $user_agents = array(
            // Chrome on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            // Chrome on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            // Firefox on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            // Firefox on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
            // Safari on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            // Edge on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
            // Chrome on Linux
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            // Mobile Chrome
            'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
            // Mobile Safari
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        );

        return $user_agents[ array_rand( $user_agents ) ];
    }

    /**
     * Generate a random date within the last 10 days.
     *
     * @return string Date in MySQL format (Y-m-d H:i:s)
     */
    private function generate_random_date_last_10_days() {
        // Get current timestamp
        $now = current_time( 'timestamp' );
        
        // Calculate 10 days ago in seconds (10 days * 24 hours * 60 minutes * 60 seconds)
        $ten_days_ago = $now - ( 10 * 24 * 60 * 60 );
        
        // Generate random timestamp between 10 days ago and now
        $random_timestamp = rand( $ten_days_ago, $now );
        
        // Convert to MySQL datetime format
        return date( 'Y-m-d H:i:s', $random_timestamp );
    }

    /**
     * Generate a random Lorem Ipsum title.
     *
     * @return string
     */
    private function generate_lorem_title() {
        $titles = array(
            'Lorem ipsum dolor sit amet',
            'Consectetur adipiscing elit',
            'Sed do eiusmod tempor incididunt',
            'Ut labore et dolore magna',
            'Aliqua enim ad minim veniam',
            'Quis nostrud exercitation ullamco',
            'Laboris nisi ut aliquip',
            'Ex ea commodo consequat',
            'Duis aute irure dolor',
            'Reprehenderit in voluptate velit',
            'Esse cillum dolore eu fugiat',
            'Nulla pariatur excepteur sint',
            'Occaecat cupidatat non proident',
            'Sunt in culpa qui officia',
            'Deserunt mollit anim id',
        );

        return $titles[ array_rand( $titles ) ];
    }

    /**
     * Generate a random Lorem Ipsum description.
     *
     * @return string
     */
    private function generate_lorem_description() {
        $descriptions = array(
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
            'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
            'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
            'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
        );

        return $descriptions[ array_rand( $descriptions ) ];
    }

    /**
     * Generate random Lorem Ipsum data (JSON format).
     *
     * @return string
     */
    private function generate_random_category() {
        $categories = array(
            'Lorem ipsum',
            'Consectetur',
            'Sed do eiusmod',
            'Ut labore',
            'Aliqua enim',
            'Quis nostrud',
            'Laboris nisi',
            'Ex ea commodo',
            'Duis aute',
            'Reprehenderit',
            'Esse cillum',
            'Nulla',
            'Occaecat',
            'Sunt in',
            'Deserunt',
        );

        return $categories[ array_rand( $categories ) ];
    }

    /**
     * Display sample of recently inserted logs.
     *
     * @param int $limit Number of logs to show.
     */
    private function show_sample_logs( $limit = 5 ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'authguard_logs';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, title, created_at FROM {$table_name} ORDER BY ID DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        if ( ! empty( $results ) ) {
            WP_CLI::log( "\nSample of inserted logs:" );
            WP_CLI\Utils\format_items( 'table', $results, array( 'ID', 'title', 'created_at' ) );
        }
    }

    /**
     * Seed the login redirects table with sample data.
     *
     * ## OPTIONS
     *
     * [--count=<number>]
     * : Number of login redirect entries to create. Default: 10
     *
     * ## EXAMPLES
     *
     *     # Create 10 login redirect entries (default)
     *     wp authguard seed-login-redirects
     *
     *     # Create 50 login redirect entries
     *     wp authguard seed-login-redirects --count=50
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function seed_login_redirects( $args, $assoc_args ) {
        global $wpdb;

        $count = isset( $assoc_args['count'] ) ? absint( $assoc_args['count'] ) : 10;

        $table_name = $wpdb->prefix . 'authguard_login_redirects';

        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist. Please activate the plugin first." );
            return;
        }

        WP_CLI::log( "Starting to seed {$count} login redirect entries..." );

        $progress = \WP_CLI\Utils\make_progress_bar( 'Seeding login redirects', $count );

        $inserted = 0;
        $failed = 0;

        for ( $i = 1; $i <= $count; $i++ ) {
            $user_id    = rand( 1, 10 );
            $type       = $this->generate_random_redirect_type();
            $value      = $this->generate_random_redirect_value();
            $redirect_to = $this->generate_random_redirect_url();
            $status     = rand( 0, 1 ) ? 'active' : 'inactive';
            $created_at = $this->generate_random_date_last_10_days();

            $result = $wpdb->insert(
                $table_name,
                array(
                    'user_id'    => $user_id,
                    'type'       => $type,
                    'value'      => $value,
                    'redirect_to' => $redirect_to,
                    'status'     => $status,
                    'created_at' => $created_at,
                ),
                array(
                    '%d',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                )
            );

            if ( $result ) {
                $inserted++;
            } else {
                $failed++;
                WP_CLI::debug( "Failed to insert login redirect entry #{$i}: " . $wpdb->last_error );
            }

            $progress->tick();
        }

        $progress->finish();

        WP_CLI::success( sprintf(
            'Successfully inserted %d login redirect entries. Failed: %d',
            $inserted,
            $failed
        ) );

        $this->show_sample_login_redirects( 5 );
    }

    /**
     * Clear all login redirects from the table.
     *
     * ## OPTIONS
     *
     * [--yes]
     * : Skip confirmation prompt.
     *
     * ## EXAMPLES
     *
     *     # Clear login redirects with confirmation
     *     wp authguard clear-login-redirects
     *
     *     # Clear login redirects without confirmation
     *     wp authguard clear-login-redirects --yes
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function clear_login_redirects( $args, $assoc_args ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'authguard_login_redirects';

        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        $count = $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" );

        if ( $count == 0 ) {
            WP_CLI::warning( 'No login redirects found in the table.' );
            return;
        }

        if ( ! isset( $assoc_args['yes'] ) ) {
            WP_CLI::confirm(
                sprintf( 'Are you sure you want to delete %d login redirect entries?', $count ),
                $assoc_args
            );
        }

        $result = $wpdb->query( "TRUNCATE TABLE {$table_name}" );

        if ( false === $result ) {
            WP_CLI::error( 'Failed to clear login redirects: ' . $wpdb->last_error );
        } else {
            WP_CLI::success( sprintf( 'Successfully deleted %d login redirect entries.', $count ) );
        }
    }

    /**
     * Show recent login redirects from the table.
     *
     * ## OPTIONS
     *
     * [--limit=<number>]
     * : Number of login redirects to display. Default: 10
     *
     * [--format=<format>]
     * : Output format (table, csv, json, yaml). Default: table
     *
     * ## EXAMPLES
     *
     *     # Show 10 recent login redirects
     *     wp authguard show-login-redirects
     *
     *     # Show 20 recent login redirects in JSON format
     *     wp authguard show-login-redirects --limit=20 --format=json
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function show_login_redirects( $args, $assoc_args ) {
        global $wpdb;

        $limit = isset( $assoc_args['limit'] ) ? absint( $assoc_args['limit'] ) : 10;
        $format = isset( $assoc_args['format'] ) ? $assoc_args['format'] : 'table';

        $table_name = $wpdb->prefix . 'authguard_login_redirects';

        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} ORDER BY ID DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        if ( empty( $results ) ) {
            WP_CLI::warning( 'No login redirects found.' );
            return;
        }

        WP_CLI\Utils\format_items( $format, $results, array( 'ID', 'user_id', 'type', 'value', 'redirect_to', 'status', 'created_at' ) );
    }

    /**
     * Generate a random redirect type.
     *
     * @return string
     */
    private function generate_random_redirect_type() {
        $types = array(
            'user',
            'role',
        );

        return $types[ array_rand( $types ) ];
    }

    /**
     * Generate a random redirect value based on type.
     *
     * @return string
     */
    private function generate_random_redirect_value() {
        $user_ids = array( '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' );
        $role_slugs = array( 'administrator', 'editor', 'author', 'contributor', 'subscriber' );

        $random_type = rand( 0, 1 ) ? 'user' : 'role';

        if ( $random_type === 'user' ) {
            return $user_ids[ array_rand( $user_ids ) ];
        } else {
            return $role_slugs[ array_rand( $role_slugs ) ];
        }
    }

    /**
     * Generate a random redirect URL.
     *
     * @return string
     */
    private function generate_random_redirect_url() {
        $urls = array(
            'https://example.com/dashboard',
            'https://example.com/profile',
            'https://example.com/admin',
            'https://example.com/settings',
            'https://example.com/home',
            'https://example.com/welcome',
            'https://example.com/my-account',
            'https://example.com/user-panel',
            'https://example.com/user-dashboard',
            'https://example.com/members-area',
        );

        return $urls[ array_rand( $urls ) ];
    }

    /**
     * Display sample of recently inserted login redirects.
     *
     * @param int $limit Number of login redirects to show.
     */
    private function show_sample_login_redirects( $limit = 5 ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'authguard_login_redirects';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, type, value, redirect_to, status, created_at FROM {$table_name} ORDER BY ID DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        if ( ! empty( $results ) ) {
            WP_CLI::log( "\nSample of inserted login redirects:" );
            WP_CLI\Utils\format_items( 'table', $results, array( 'ID', 'type', 'value', 'redirect_to', 'status', 'created_at' ) );
        }
    }

    /**
     * Seed 2FA logs table with sample data.
     *
     * ## OPTIONS
     *
     * [--count=<number>]
     * : Number of 2FA log entries to create. Default: 10
     *
     * [--days=<number>]
     * : Number of days back to create logs for. Default: 7
     *
     * ## EXAMPLES
     *
     *     # Create 10 2FA log entries (default)
     *     wp authguard seed-2fa-logs
     *
     *     # Create 50 2FA log entries
     *     wp authguard seed-2fa-logs --count=50
     *
     *     # Create 100 2FA log entries for the last 30 days
     *     wp authguard seed-2fa-logs --count=100 --days=30
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function seed_2fa_logs( $args, $assoc_args ) {
        global $wpdb;

        $count = isset( $assoc_args['count'] ) ? absint( $assoc_args['count'] ) : 10;
        $days = isset( $assoc_args['days'] ) ? absint( $assoc_args['days'] ) : 7;

        $table_name = $wpdb->prefix . 'authguard_2fa_logs';

        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist. Please activate plugin first." );
            return;
        }

        WP_CLI::log( "Starting to seed {$count} 2FA log entries for the last {$days} days..." );

        $progress = \WP_CLI\Utils\make_progress_bar( 'Seeding 2FA logs', $count );

        $inserted = 0;
        $failed = 0;

        for ( $i = 1; $i <= $count; $i++ ) {
            $user_id      = rand( 1, 10 );
            $method       = $this->generate_random_2fa_method();
            $status       = $this->generate_random_2fa_status();
            $ip_address   = $this->generate_random_ip();
            $user_agent   = $this->generate_random_user_agent();
            $attempts     = $status === 'failed' ? rand( 1, 5 ) : 1;
            $created_at   = $this->generate_random_date_last_n_days( $days );
            $verified_at  = null;
            $expires_at   = null;

            if ( $status === 'verified' ) {
                $verified_at = date( 'Y-m-d H:i:s', strtotime( $created_at ) + rand( 10, 300 ) );
            } elseif ( $status === 'expired' || $status === 'failed' ) {
                $expires_at = date( 'Y-m-d H:i:s', strtotime( $created_at ) + rand( 300, 900 ) );
            } else {
                $expires_at = date( 'Y-m-d H:i:s', strtotime( $created_at ) + rand( 300, 600 ) );
            }

            $code_hash = wp_generate_password( 32, false );

            $result = $wpdb->insert(
                $table_name,
                array(
                    'user_id'     => $user_id,
                    'method'      => $method,
                    'status'      => $status,
                    'code_hash'   => $code_hash,
                    'expires_at'  => $expires_at,
                    'verified_at' => $verified_at,
                    'ip_address'  => $ip_address,
                    'user_agent'  => $user_agent,
                    'attempts'    => $attempts,
                    'created_at'  => $created_at,
                ),
                array(
                    '%d',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%d',
                    '%s',
                )
            );

            if ( $result ) {
                $inserted++;
            } else {
                $failed++;
                WP_CLI::debug( "Failed to insert 2FA log entry #{$i}: " . $wpdb->last_error );
            }

            $progress->tick();
        }

        $progress->finish();

        WP_CLI::success( sprintf(
            'Successfully inserted %d 2FA log entries. Failed: %d',
            $inserted,
            $failed
        ) );

        $this->show_sample_2fa_logs( 5 );
    }

    /**
     * Clear all 2FA logs from table.
     *
     * ## OPTIONS
     *
     * [--yes]
     * : Skip confirmation prompt.
     *
     * ## EXAMPLES
     *
     *     # Clear 2FA logs with confirmation
     *     wp authguard clear-2fa-logs
     *
     *     # Clear 2FA logs without confirmation
     *     wp authguard clear-2fa-logs --yes
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function clear_2fa_logs( $args, $assoc_args ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'authguard_2fa_logs';

        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        $count = $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" );

        if ( $count == 0 ) {
            WP_CLI::warning( 'No 2FA logs found in table.' );
            return;
        }

        if ( ! isset( $assoc_args['yes'] ) ) {
            WP_CLI::confirm(
                sprintf( 'Are you sure you want to delete %d 2FA log entries?', $count ),
                $assoc_args
            );
        }

        $result = $wpdb->query( "TRUNCATE TABLE {$table_name}" );

        if ( false === $result ) {
            WP_CLI::error( 'Failed to clear 2FA logs: ' . $wpdb->last_error );
        } else {
            WP_CLI::success( sprintf( 'Successfully deleted %d 2FA log entries.', $count ) );
        }
    }

    /**
     * Show recent 2FA logs from table.
     *
     * ## OPTIONS
     *
     * [--limit=<number>]
     * : Number of 2FA logs to display. Default: 10
     *
     * [--format=<format>]
     * : Output format (table, csv, json, yaml). Default: table
     *
     * [--status=<status>]
     * : Filter by status (sent, verified, failed, expired)
     *
     * ## EXAMPLES
     *
     *     # Show 10 recent 2FA logs
     *     wp authguard show-2fa-logs
     *
     *     # Show 20 recent 2FA logs
     *     wp authguard show-2fa-logs --limit=20
     *
     *     # Show only verified logs
     *     wp authguard show-2fa-logs --status=verified
     *
     *     # Show 2FA logs in JSON format
     *     wp authguard show-2fa-logs --format=json
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function show_2fa_logs( $args, $assoc_args ) {
        global $wpdb;

        $limit = isset( $assoc_args['limit'] ) ? absint( $assoc_args['limit'] ) : 10;
        $format = isset( $assoc_args['format'] ) ? $assoc_args['format'] : 'table';
        $status = isset( $assoc_args['status'] ) ? sanitize_text_field( $assoc_args['status'] ) : '';

        $table_name = $wpdb->prefix . 'authguard_2fa_logs';

        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        $where = '1=1';
        $where_params = array();

        if ( ! empty( $status ) ) {
            $where .= ' AND status = %s';
            $where_params[] = $status;
        }

        $query = $wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE {$where} ORDER BY ID DESC LIMIT %d",
            array_merge( $where_params, array( $limit ) )
        );

        $results = $wpdb->get_results( $query, ARRAY_A );

        if ( empty( $results ) ) {
            WP_CLI::warning( 'No 2FA logs found.' );
            return;
        }

        WP_CLI\Utils\format_items(
            $format,
            $results,
            array( 'ID', 'user_id', 'method', 'status', 'ip_address', 'attempts', 'created_at', 'verified_at' )
        );
    }

    /**
     * Generate a random 2FA method.
     *
     * @return string
     */
    private function generate_random_2fa_method() {
        $methods = array( 'email', 'sms', 'whatsapp', 'totp', 'hotp', 'backup_code' );

        return $methods[ array_rand( $methods ) ];
    }

    /**
     * Generate a random 2FA status.
     *
     * @return string
     */
    private function generate_random_2fa_status() {
        $statuses = array( 'sent', 'verified', 'failed', 'expired' );

        return $statuses[ array_rand( $statuses ) ];
    }

    /**
     * Generate a random date within last N days.
     *
     * @param int $days Number of days to look back.
     * @return string Date in MySQL format (Y-m-d H:i:s)
     */
    private function generate_random_date_last_n_days( $days = 7 ) {
        $now = current_time( 'timestamp' );
        $n_days_ago = $now - ( $days * 24 * 60 * 60 );
        $random_timestamp = rand( $n_days_ago, $now );

        return date( 'Y-m-d H:i:s', $random_timestamp );
    }

    /**
     * Display sample of recently inserted 2FA logs.
     *
     * @param int $limit Number of 2FA logs to show.
     */
    private function show_sample_2fa_logs( $limit = 5 ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'authguard_2fa_logs';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, user_id, method, status, ip_address, created_at FROM {$table_name} ORDER BY ID DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        if ( ! empty( $results ) ) {
            WP_CLI::log( "\nSample of inserted 2FA logs:" );
            WP_CLI\Utils\format_items( 'table', $results, array( 'ID', 'user_id', 'method', 'status', 'ip_address', 'created_at' ) );
        }
    }
}