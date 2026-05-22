<?php

// ✅ Get posts (with embed info)
// GET /wp-json/authguard/v1/posts?page=1&per_page=10&status=publish&search=hello
register_rest_route( self::NAMESPACE, '/posts', [
    'methods'  => 'GET',
    'callback' => [$this, 'get_posts'],
    'permission_callback' => function () {
        return current_user_can( 'edit_posts' );
    },
    'args' => [
        'page'     => ['type' => 'integer'],
        'per_page' => ['type' => 'integer'],
        'status'   => ['type' => 'string'],
        'search'   => ['type' => 'string'],
        'orderby'  => ['type' => 'string'], // title|date
        'order'    => ['type' => 'string'], // asc|desc
    ],
]);

// ✅ Change status of a single post
// POST /wp-json/authguard/v1/post/123/status
// { "status": "draft" }
register_rest_route( self::NAMESPACE, '/post/(?P<id>\d+)/status', [
    'methods'  => 'POST',
    'callback' => [$this, 'change_post_status'],
    'permission_callback' => function () {
        return current_user_can( 'edit_posts' );
    },
    'args' => [
        'status' => [
            'required' => true,
            'type'     => 'string',
            'enum'     => [ 'publish', 'draft', 'trash' ],
        ],
    ],
]);

// ✅ Bulk status change
// POST /wp-json/authguard/v1/posts/status
// { "ids": [1,2,3], "status": "trash" }

register_rest_route( self::NAMESPACE, '/posts/status', [
    'methods'  => 'POST',
    'callback' => [$this, 'bulk_change_status'],
    'permission_callback' => function () {
        return current_user_can( 'edit_posts' );
    },
    'args' => [
        'ids' => [
            'required' => true,
            'type'     => 'array',
            'items'    => [ 'type' => 'integer' ],
        ],
        'status' => [
            'required' => true,
            'type'     => 'string',
            'enum'     => [ 'publish', 'draft', 'trash' ],
        ],
    ],
]);


    /**
     * Check permission for API access
     *
     * @param WP_REST_Request $request Request object.
     * @return bool
     */
    // public function check_permission( $request ) {
    //     // Change this based on your requirements
    //     // For development, you might want to allow all users
    //     // For production, restrict to specific capabilities
    //     return current_user_can( 'manage_options' );
    // }
    /**
     * Check if user has permission to access the endpoint.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|WP_Error True if user has permission, WP_Error otherwise.
     */
    public function check_permission( WP_REST_Request $request ) {

        // Check if user has capability to manage options (typically administrators)
        if ( ! current_user_can( 'manage_options' ) ) {
            return new WP_Error(
                'rest_forbidden',
                __( 'You do not have permission to access this endpoint.', 'authguard' ),
                array( 'status' => 403 )
            );
        }

        return true;
    }
    
    // /**
    //  * Return posts for DataTables (server-side).
    //  */
    // public function get_posts( WP_REST_Request $request ) {
    //     $page     = max( 1, intval( $request->get_param('page') ?: 1 ) );
    //     $per_page = max( 1, intval( $request->get_param('per_page') ?: 10 ) );
    //     $status   = sanitize_text_field( $request->get_param('status') ?: 'publish' );
    //     $search   = sanitize_text_field( $request->get_param('search') ?: '' );

    //     // Sorting
    //     $orderby_param = strtolower( sanitize_text_field( $request->get_param('orderby') ?: '' ) );
    //     $order_param   = strtoupper( sanitize_text_field( $request->get_param('order') ?: 'ASC' ) );
    //     $allowed_orderby = [
    //         'title' => 'title',
    //         'date'  => 'date',
    //         'id'    => 'ID',
    //     ];
    //     $orderby = isset( $allowed_orderby[ $orderby_param ] ) ? $allowed_orderby[ $orderby_param ] : 'date';
    //     $order   = in_array( $order_param, [ 'ASC', 'DESC' ], true ) ? $order_param : 'DESC';

    //     $args = [
    //         'post_type'      => 'post',
    //         'post_status'    => $status, // publish|draft|trash|etc
    //         'posts_per_page' => $per_page,
    //         'paged'          => $page,
    //         'orderby'        => $orderby,
    //         'order'          => $order,
    //         's'              => $search,
    //         'no_found_rows'  => false, // we need totals for DataTables
    //     ];

    //     $query = new WP_Query( $args );

    //     $rows = [];
    //     foreach ( $query->posts as $post ) {
    //         $author_id  = $post->post_author;
    //         $categories = wp_get_post_terms( $post->ID, 'category', [ 'fields' => 'names' ] );
    //         $tags       = wp_get_post_terms( $post->ID, 'post_tag', [ 'fields' => 'names' ] );

    //         $rows[] = [
    //             'id'    => $post->ID,
    //             'title' => get_the_title( $post ),
    //             'date'  => get_the_date( '', $post ),
    //             'author'=> [
    //                 'id'     => $author_id,
    //                 'name'   => get_the_author_meta( 'display_name', $author_id ),
    //                 'avatar' => get_avatar_url( $author_id, [ 'size' => 24 ] ),
    //             ],
    //             'categories' => $categories ?: [],
    //             'tags'       => $tags ?: [],
    //             'status'       => get_post_status($post),
    //         ];
    //     }

    //     return [
    //         'data'  => $rows,
    //         'total' => (int) $query->found_posts,
    //         'page'  => (int) $page,
    //     ];
    // }

    // /**
    //  * Change status for a single post.
    //  */
    // public function change_post_status( WP_REST_Request $request ) {
    //     $post_id = (int) $request['id'];
    //     $status  = sanitize_text_field( $request['status'] );

    //     $updated = wp_update_post([
    //         'ID'          => $post_id,
    //         'post_status' => $status,
    //     ], true );

    //     if ( is_wp_error( $updated ) ) {
    //         return new WP_Error( 'update_failed', __( 'Failed to update post status', 'authguard' ), [ 'status' => 500 ] );
    //     }

    //     return [ 'success' => true, 'post_id' => $post_id, 'status' => $status ];
    // }

    // /**
    //  * Bulk change status of posts.
    //  */
    // public function bulk_change_status( WP_REST_Request $request ) {
    //     $ids    = $request['ids'];
    //     $status = sanitize_text_field( $request['status'] );

    //     $updated = [];
    //     foreach ( $ids as $id ) {
    //         $result = wp_update_post([
    //             'ID'          => (int) $id,
    //             'post_status' => $status,
    //         ], true );

    //         if ( ! is_wp_error( $result ) ) {
    //             $updated[] = (int) $id;
    //         }
    //     }

    //     return [ 'success' => true, 'updated' => $updated, 'status' => $status ];
    // }


        // Get specifications for a product
        register_rest_route( self::NAMESPACE,'/product/(?P<product_id>\d+)/specifications',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_product_specifications' ),
                'permission_callback' => function () {
                    return current_user_can( 'edit_posts' );
                },
                'args'                => array(
                    'product_id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Save specifications for a product
        register_rest_route( self::NAMESPACE,'/product/(?P<product_id>\d+)/specifications',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'save_product_specifications' ),
                'permission_callback' => function () {
                    return current_user_can( 'edit_posts' );
                },
                'args'                => array(
                    'product_id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

    // Need to add this to pro 
    
    register_rest_route(self::NAMESPACE, '/plugins', [
        'methods' => 'GET',
        'callback' => function () {
            $response = wp_remote_get('https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[author]=mostakshahid&request[per_page]=24');
            if (is_wp_error($response)) {
                return new WP_Error('api_error', 'Failed to fetch plugins', ['status' => 500]);
            }
            return json_decode(wp_remote_retrieve_body($response), true);
        },
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
    ]);
    

    register_rest_route( self::NAMESPACE, '/deactivation-link',
        array(
            'methods' => 'GET',
            'callback' => array( $this, 'get_deactivation_link' ),
            'permission_callback' => array( $this, 'check_permission' ),
        )
    );

    /**
     * Get the deactivation link.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response|WP_Error The response or error.
     */
    public function get_deactivation_link( WP_REST_Request $request ) {
        // Get the encrypted key from options
        $encrypted_key = get_option( 'authguard_deactive_key' );

        if ( false === $encrypted_key ) {
            return new WP_Error(
                'key_not_found',
                __( 'Deactivation key not found. Please reactivate the plugin.', 'authguard' ),
                array( 'status' => 404 )
            );
        }

        // Decrypt the key
        $decrypted_key = CryptoHelper::decrypt( $encrypted_key );

        if ( false === $decrypted_key ) {
            return new WP_Error(
                'decryption_failed',
                __( 'Failed to decrypt deactivation key. Please contact support.', 'authguard' ),
                array( 'status' => 500 )
            );
        }

        // Build the deactivation URL
        $deactivation_url = add_query_arg(
            array(
                'action' => 'authguard_deactivate',
                'secret_key' => $decrypted_key,
            ),
            admin_url( 'admin-post.php' )
        );

        // Return the response
        return new WP_REST_Response(
            array(
                'success' => true,
                'deactivation_url' => $deactivation_url,
                'message' => __( 'Deactivation link generated successfully.', 'authguard' ),
                'warning' => __( 'This link will only work once. After deactivation, a new link will be generated on reactivation.', 'authguard' ),
            ),
            200
        );
    }