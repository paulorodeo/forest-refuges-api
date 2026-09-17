<?php
/**
 * Plugin Name: Casa na Floresta - Partner Property Origin
 * Description: Private administrative origin metadata for Houzez properties.
 */
defined( 'ABSPATH' ) || exit;
const CNF_PARTNER_META_KEYS = array( '_cnf_source_type', '_cnf_partner_id', '_cnf_partner_name', '_cnf_partner_property_id', '_cnf_partner_source_url', '_cnf_source_status', '_cnf_last_synced_at', '_cnf_imported_at', '_cnf_review_status' );
function cnf_partner_origin_admin_capability() { return current_user_can( 'manage_options' ); }
function cnf_partner_origin_sanitize( $value, $meta_key ) {
	$value = is_scalar( $value ) ? trim( (string) $value ) : '';
	if ( '_cnf_partner_source_url' === $meta_key ) return esc_url_raw( $value, array( 'https' ) );
	$allowed = array( '_cnf_source_type' => array( 'own', 'partner' ), '_cnf_partner_id' => array( '', 'mercado-de-terras', 'viva-rural', 'banco-de-terras' ), '_cnf_source_status' => array( 'candidate', 'review', 'published', 'rejected' ), '_cnf_review_status' => array( 'pending', 'approved', 'rejected' ) );
	return isset( $allowed[ $meta_key ] ) ? ( in_array( $value, $allowed[ $meta_key ], true ) ? $value : '' ) : sanitize_text_field( $value );
}
function cnf_partner_origin_register_meta() {
	foreach ( CNF_PARTNER_META_KEYS as $meta_key ) register_post_meta( 'property', $meta_key, array( 'type' => 'string', 'single' => true, 'show_in_rest' => false, 'sanitize_callback' => 'cnf_partner_origin_sanitize', 'auth_callback' => 'cnf_partner_origin_admin_capability' ) );
}
add_action( 'init', 'cnf_partner_origin_register_meta', 20 );
function cnf_partner_origin_partner_names() { return array( 'mercado-de-terras' => 'Mercado de Terras', 'viva-rural' => 'Viva Rural', 'banco-de-terras' => 'Banco de Terras' ); }
function cnf_partner_origin_field( $post_id, $key ) { return (string) get_post_meta( $post_id, $key, true ); }
function cnf_partner_origin_select( $name, $value, $options ) { echo '<select name="' . esc_attr( $name ) . '">'; foreach ( $options as $option_value => $label ) echo '<option value="' . esc_attr( $option_value ) . '"' . selected( $value, $option_value, false ) . '>' . esc_html( $label ) . '</option>'; echo '</select>'; }
function cnf_partner_origin_add_meta_box() { if ( cnf_partner_origin_admin_capability() ) add_meta_box( 'cnf-partner-origin', 'Origem do imóvel', 'cnf_partner_origin_render_meta_box', 'property', 'normal', 'default' ); }
add_action( 'add_meta_boxes_property', 'cnf_partner_origin_add_meta_box' );
function cnf_partner_origin_render_meta_box( $post ) {
	wp_nonce_field( 'cnf_partner_origin_save', 'cnf_partner_origin_nonce' ); $values = array(); foreach ( CNF_PARTNER_META_KEYS as $key ) $values[ $key ] = cnf_partner_origin_field( $post->ID, $key );
	echo '<table class="form-table" role="presentation"><tbody>';
	$fields = array( '_cnf_source_type' => 'Tipo de origem', '_cnf_partner_id' => 'Parceiro', '_cnf_partner_property_id' => 'ID externo', '_cnf_source_status' => 'Status na origem', '_cnf_imported_at' => 'Data de importação', '_cnf_last_synced_at' => 'Última sincronização', '_cnf_review_status' => 'Status editorial' );
	foreach ( $fields as $key => $label ) { echo '<tr><th><label for="' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td>'; if ( '_cnf_source_type' === $key ) cnf_partner_origin_select( $key, $values[ $key ], array( 'own' => 'Próprio', 'partner' => 'Parceiro' ) ); elseif ( '_cnf_partner_id' === $key ) cnf_partner_origin_select( $key, $values[ $key ], array( '' => '—', 'mercado-de-terras' => 'Mercado de Terras', 'viva-rural' => 'Viva Rural', 'banco-de-terras' => 'Banco de Terras' ) ); elseif ( '_cnf_source_status' === $key ) cnf_partner_origin_select( $key, $values[ $key ], array( 'candidate' => 'Candidato', 'review' => 'Em revisão', 'published' => 'Publicado na origem', 'rejected' => 'Rejeitado na origem' ) ); elseif ( '_cnf_review_status' === $key ) cnf_partner_origin_select( $key, $values[ $key ], array( 'pending' => 'Pendente', 'approved' => 'Aprovado', 'rejected' => 'Rejeitado' ) ); else echo '<input class="regular-text" type="text" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $values[ $key ] ) . '">'; echo '</td></tr>'; }
	echo '<tr><th>URL da fonte</th><td>'; if ( $values['_cnf_partner_source_url'] ) echo '<a href="' . esc_url( $values['_cnf_partner_source_url'] ) . '" target="_blank" rel="noreferrer">' . esc_html( $values['_cnf_partner_source_url'] ) . '</a><br>'; echo '<input class="large-text" type="url" name="_cnf_partner_source_url" value="' . esc_attr( $values['_cnf_partner_source_url'] ) . '"></td></tr></tbody></table>';
}
function cnf_partner_origin_save_meta_box( $post_id, $post ) {
	if ( ! isset( $_POST['cnf_partner_origin_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cnf_partner_origin_nonce'] ) ), 'cnf_partner_origin_save' ) || ! cnf_partner_origin_admin_capability() || 'property' !== $post->post_type ) return;
	foreach ( CNF_PARTNER_META_KEYS as $meta_key ) if ( array_key_exists( $meta_key, $_POST ) && '_cnf_partner_name' !== $meta_key ) update_post_meta( $post_id, $meta_key, cnf_partner_origin_sanitize( wp_unslash( $_POST[ $meta_key ] ), $meta_key ) );
	$names = cnf_partner_origin_partner_names(); $partner_id = cnf_partner_origin_field( $post_id, '_cnf_partner_id' ); update_post_meta( $post_id, '_cnf_partner_name', $names[ $partner_id ] ?? '' );
}
add_action( 'save_post_property', 'cnf_partner_origin_save_meta_box', 10, 2 );
function cnf_partner_origin_columns( $columns ) { $columns['cnf_origin'] = 'Origem / Parceiro'; return $columns; }
add_filter( 'manage_property_posts_columns', 'cnf_partner_origin_columns' );
function cnf_partner_origin_render_column( $column, $post_id ) { if ( 'cnf_origin' !== $column || ! cnf_partner_origin_admin_capability() ) return; $type = cnf_partner_origin_field( $post_id, '_cnf_source_type' ); $partner = cnf_partner_origin_field( $post_id, '_cnf_partner_name' ); echo esc_html( 'partner' === $type && $partner ? 'Parceiro / ' . $partner : 'Próprio' ); }
add_action( 'manage_property_posts_custom_column', 'cnf_partner_origin_render_column', 10, 2 );
function cnf_partner_origin_filter_dropdown() { global $typenow; if ( 'property' !== $typenow || ! cnf_partner_origin_admin_capability() ) return; $current = isset( $_GET['cnf_origin'] ) ? sanitize_key( wp_unslash( $_GET['cnf_origin'] ) ) : ''; cnf_partner_origin_select( 'cnf_origin', $current, array( '' => 'Todos', 'own' => 'Próprios', 'mercado-de-terras' => 'Mercado de Terras', 'viva-rural' => 'Viva Rural', 'banco-de-terras' => 'Banco de Terras' ) ); }
add_action( 'restrict_manage_posts', 'cnf_partner_origin_filter_dropdown' );
function cnf_partner_origin_apply_filter( $query ) { if ( ! is_admin() || ! $query->is_main_query() || ! cnf_partner_origin_admin_capability() || 'property' !== $query->get( 'post_type' ) ) return; $origin = isset( $_GET['cnf_origin'] ) ? sanitize_key( wp_unslash( $_GET['cnf_origin'] ) ) : ''; if ( 'own' === $origin ) $query->set( 'meta_query', array( array( 'key' => '_cnf_source_type', 'compare' => 'NOT EXISTS' ) ) ); elseif ( in_array( $origin, array_keys( cnf_partner_origin_partner_names() ), true ) ) $query->set( 'meta_query', array( array( 'key' => '_cnf_partner_id', 'value' => $origin ) ) ); }
add_action( 'pre_get_posts', 'cnf_partner_origin_apply_filter' );

function cnf_partner_origin_remove_rest_fields( $response, $post, $request ) {
	foreach ( CNF_PARTNER_META_KEYS as $meta_key ) {
		unset( $response->data[ $meta_key ] );
		if ( isset( $response->data['property_meta'][ $meta_key ] ) ) {
			unset( $response->data['property_meta'][ $meta_key ] );
		}
	}
	return $response;
}
add_filter( 'rest_prepare_property', 'cnf_partner_origin_remove_rest_fields', 100, 3 );

require_once __DIR__ . '/cnf-partner-property-commercial.php';
