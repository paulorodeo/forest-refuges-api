<?php
/**
 * Plugin Name: Casa na Floresta - Contextual Elfsight Widgets
 * Description: Keeps native Elfsight shortcode rendering on legacy WordPress pages that are still rendered.
 */
defined( 'ABSPATH' ) || exit;

function cnf_elfsight_contextual_widget_id() {
	if ( is_admin() || wp_doing_ajax() || wp_is_json_request() || is_feed() ) return 0;
	// The Houzez child-theme description template owns Widget 10 on property singles.
	// Do not emit a second global/footer instance here.
	if ( is_singular( 'property' ) ) return 0;
	if ( is_page( 'servicos' ) ) return 2;
	if (
		is_post_type_archive( 'property' ) ||
		is_tax( array( 'property_type', 'property_status', 'property_city', 'property_state', 'property_area' ) ) ||
		is_page( array( 'regioes', 'tipos-de-imoveis-rurais', 'chacaras', 'sitios', 'chales', 'refugios-urbanos', 'temporada', 'pesqueiros', 'busca' ) )
	) return 1;
	return 0;
}

function cnf_elfsight_contextual_render_widget() {
	$widget_id = cnf_elfsight_contextual_widget_id();
	if ( ! $widget_id || ! shortcode_exists( 'elfsight_whatsapp_chat' ) ) return;
	// Redirects execute at template_redirect before wp_footer, so this never changes a www2 → www response.
	echo do_shortcode( '[elfsight_whatsapp_chat id="' . absint( $widget_id ) . '"]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
add_action( 'wp_footer', 'cnf_elfsight_contextual_render_widget', 1 );
