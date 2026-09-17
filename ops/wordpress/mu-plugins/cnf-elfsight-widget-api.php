<?php
/**
 * Plugin Name: Casa na Floresta - Elfsight Widget API
 * Description: Exposes the active local Elfsight WhatsApp widget configuration to the headless frontend.
 */
defined( 'ABSPATH' ) || exit;

const CNF_ELFSIGHT_WIDGET_IDS = array( 1, 2, 3, 8, 9, 10 );

function cnf_elfsight_widget_api_register_routes() {
	register_rest_route( 'cnf/v1', '/elfsight-whatsapp-widget/(?P<id>\d+)', array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'cnf_elfsight_widget_api_get_widget',
		'permission_callback' => '__return_true',
		'args'                => array( 'id' => array( 'validate_callback' => static function( $value ) { return is_numeric( $value ); } ) ),
	) );
}
add_action( 'rest_api_init', 'cnf_elfsight_widget_api_register_routes' );

function cnf_elfsight_widget_api_get_widget( WP_REST_Request $request ) {
	$id = absint( $request['id'] );
	if ( ! in_array( $id, CNF_ELFSIGHT_WIDGET_IDS, true ) ) {
		return new WP_Error( 'cnf_elfsight_widget_not_found', 'Widget não disponível.', array( 'status' => 404 ) );
	}
	global $wpdb;
	$table = $wpdb->prefix . 'elfsight_whatsapp_chat_widgets';
	$row = $wpdb->get_row( $wpdb->prepare( "SELECT id, active, options FROM {$table} WHERE id = %d", $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	if ( ! $row || ! absint( $row['active'] ) ) {
		return new WP_Error( 'cnf_elfsight_widget_not_found', 'Widget não disponível.', array( 'status' => 404 ) );
	}
	$options = json_decode( (string) $row['options'], true );
	if ( ! is_array( $options ) ) {
		return new WP_Error( 'cnf_elfsight_widget_invalid', 'Configuração do widget inválida.', array( 'status' => 500 ) );
	}
	return rest_ensure_response( array(
		'id'        => $id,
		'version'   => '1.2.0',
		'options'   => $options,
		'scriptUrl' => plugins_url( 'elfsight-whatsapp-chat-cc/assets/elfsight-whatsapp-chat.js' ),
	) );
}
