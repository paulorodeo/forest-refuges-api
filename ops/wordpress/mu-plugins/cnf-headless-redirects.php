<?php
/**
 * Plugin Name: Casa na Floresta - Headless redirects
 * Description: Sends public legacy WordPress property and editorial URLs to the headless frontend.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

const CNF_HEADLESS_PUBLIC_ORIGIN = 'https://www.casanafloresta.com.br';
const CNF_HEADLESS_LEGACY_HOST = 'www2.casanafloresta.com.br';

/** Only redirect public, safe requests received for the legacy public host. */
function cnf_headless_is_legacy_public_request() {
	$host = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( preg_replace( '/:\\d+$/', '', (string) $_SERVER['HTTP_HOST'] ) ) : '';
	$method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) : 'GET';

	if ( CNF_HEADLESS_LEGACY_HOST !== $host || ! in_array( $method, array( 'GET', 'HEAD' ), true ) ) return false;
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ( defined( 'WP_CLI' ) && WP_CLI ) ) return false;
	if ( is_user_logged_in() ) return false;

	return true;
}

function cnf_headless_redirect( $path ) {
	wp_redirect( CNF_HEADLESS_PUBLIC_ORIGIN . $path, 301, 'Casa na Floresta Headless' );
	exit;
}

/** Return the nearest current hub for an editorial category or tag. */
function cnf_headless_taxonomy_destination( $term ) {
	$slug = sanitize_title( $term->slug );
	$property_hubs = array(
		'chacara' => '/chacaras',
		'chacaras-e-glebas' => '/chacaras',
		'dicas-para-chacaras' => '/chacaras',
		'sitio' => '/sitios',
		'aluguel-de-temporada' => '/temporada',
		'airbnb' => '/temporada',
	);
	$regions = array( 'sao-paulo', 'vale-do-ribeira', 'sorocaba', 'campinas', 'ribeirao-preto', 'barretos', 'bauru' );

	if ( isset( $property_hubs[ $slug ] ) ) return $property_hubs[ $slug ];
	if ( in_array( $slug, $regions, true ) ) return '/regiao/' . rawurlencode( $slug );

	return '/blog';
}

function cnf_headless_redirect_legacy_content() {
	if ( ! cnf_headless_is_legacy_public_request() || is_feed() ) return;

	/*
	 * WordPress canonicalizes the historic /blog/{slug}/ format to /{slug}/
	 * before it resolves the post query. Resolve that narrow public format here
	 * so a legacy article reaches the headless canonical URL in one 301.
	 */
	$request_path = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ), PHP_URL_PATH ) : '';
	if ( preg_match( '#^/blog/([^/]+)/?$#', $request_path, $matches ) ) {
		$slug = sanitize_title( rawurldecode( $matches[1] ) );
		$post = $slug ? get_page_by_path( $slug, OBJECT, 'post' ) : null;
		if ( $post instanceof WP_Post && 'publish' === $post->post_status ) {
			cnf_headless_redirect( '/' . rawurlencode( $post->post_name ) );
		}
	}

	if ( is_singular( 'property' ) ) {
		$post = get_queried_object();
		if ( $post instanceof WP_Post && 'publish' === $post->post_status ) {
			cnf_headless_redirect( '/imovel/' . rawurlencode( $post->post_name ) );
		}
		return;
	}

	if ( is_singular( 'post' ) ) {
		$post = get_queried_object();
		if ( $post instanceof WP_Post && 'publish' === $post->post_status ) {
			cnf_headless_redirect( '/' . rawurlencode( $post->post_name ) );
		}
		return;
	}

	if ( is_category() || is_tag() ) {
		$term = get_queried_object();
		if ( $term instanceof WP_Term ) cnf_headless_redirect( cnf_headless_taxonomy_destination( $term ) );
		return;
	}

	if ( is_author() || is_date() || is_search() || is_post_type_archive( 'post' ) || is_tax( 'post_format' ) ) {
		cnf_headless_redirect( '/blog' );
	}
}
add_action( 'template_redirect', 'cnf_headless_redirect_legacy_content', 1 );
