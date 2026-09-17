<?php
/** Private commercial extension for cnf-partner-property-origin.php. */
defined( 'ABSPATH' ) || exit;

const CNF_PARTNER_COMMERCIAL_META_KEYS = array( '_cnf_partner_contact_name', '_cnf_partner_phone', '_cnf_partner_creci', '_cnf_partner_commission_pct', '_cnf_broker_share_pct', '_cnf_internal_notes' );
const CNF_PARTNER_INTERNAL_NOTE_LIMIT = 5000;

function cnf_partner_commercial_percentage( $value ) {
	$value = str_replace( ',', '.', trim( (string) $value ) );
	if ( ! is_numeric( $value ) || (float) $value < 0 || (float) $value > 100 ) return '';
	return rtrim( rtrim( number_format( (float) $value, 4, '.', '' ), '0' ), '.' );
}
function cnf_partner_commercial_sanitize( $value, $key ) {
	$value = is_scalar( $value ) ? trim( (string) $value ) : '';
	if ( in_array( $key, array( '_cnf_partner_commission_pct', '_cnf_broker_share_pct' ), true ) ) return cnf_partner_commercial_percentage( $value );
	if ( '_cnf_internal_notes' === $key ) {
		$value = sanitize_textarea_field( $value );
		return function_exists( 'mb_substr' ) ? mb_substr( $value, 0, CNF_PARTNER_INTERNAL_NOTE_LIMIT ) : substr( $value, 0, CNF_PARTNER_INTERNAL_NOTE_LIMIT );
	}
	return sanitize_text_field( $value );
}
function cnf_partner_commercial_register_meta() {
	foreach ( CNF_PARTNER_COMMERCIAL_META_KEYS as $key ) register_post_meta( 'property', $key, array( 'type' => 'string', 'single' => true, 'show_in_rest' => false, 'sanitize_callback' => 'cnf_partner_commercial_sanitize', 'auth_callback' => 'cnf_partner_origin_admin_capability' ) );
}
add_action( 'init', 'cnf_partner_commercial_register_meta', 21 );
function cnf_partner_commercial_price_number( $raw ) {
	$value = preg_replace( '/[^0-9,\.\-]/', '', (string) $raw );
	if ( false === $value || '' === $value ) return null;
	if ( str_contains( $value, ',' ) && str_contains( $value, '.' ) ) $value = strrpos( $value, ',' ) > strrpos( $value, '.' ) ? str_replace( array( '.', ',' ), array( '', '.' ), $value ) : str_replace( ',', '', $value );
	elseif ( str_contains( $value, ',' ) ) $value = str_replace( ',', '.', $value );
	return is_numeric( $value ) && (float) $value >= 0 ? (float) $value : null;
}
function cnf_partner_commercial_calculate( $price, $commission, $share ) {
	$price = cnf_partner_commercial_price_number( $price ); $commission = cnf_partner_commercial_percentage( $commission ); $share = cnf_partner_commercial_percentage( $share );
	if ( null === $price || '' === $commission || '' === $share ) return null;
	$total = $price * ( (float) $commission / 100 ); $mine = $total * ( (float) $share / 100 );
	return array( 'price' => $price, 'commission_pct' => (float) $commission, 'share_pct' => (float) $share, 'effective_pct' => (float) $commission * (float) $share / 100, 'total' => $total, 'mine' => $mine );
}
function cnf_partner_commercial_money( $value ) { return 'R$ ' . number_format( (float) $value, 2, ',', '.' ); }
function cnf_partner_commercial_words( $value ) { if ( ! class_exists( 'NumberFormatter' ) ) return null; $words = ( new NumberFormatter( 'pt_BR', NumberFormatter::SPELLOUT ) )->format( floor( (float) $value ) ); return $words ? ucfirst( $words ) . ' reais' : null; }
function cnf_partner_commercial_render_row( $key, $label, $value, $type = 'text' ) { echo '<tr><th><label for="' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td><input class="regular-text" type="' . esc_attr( $type ) . '" step="0.0001" min="0" max="100" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '"></td></tr>'; }
function cnf_partner_commercial_render_box( $post ) {
	if ( ! cnf_partner_origin_admin_capability() ) return;
	wp_nonce_field( 'cnf_partner_commercial_save', 'cnf_partner_commercial_nonce' );
	$values = array(); foreach ( CNF_PARTNER_COMMERCIAL_META_KEYS as $key ) $values[ $key ] = (string) get_post_meta( $post->ID, $key, true );
	echo '<h2>Contato do parceiro <span class="description">(interno)</span></h2><table class="form-table"><tbody>';
	cnf_partner_commercial_render_row( '_cnf_partner_contact_name', 'Nome do parceiro', $values['_cnf_partner_contact_name'] ); cnf_partner_commercial_render_row( '_cnf_partner_phone', 'Telefone do parceiro', $values['_cnf_partner_phone'] ); cnf_partner_commercial_render_row( '_cnf_partner_creci', 'CRECI do parceiro', $values['_cnf_partner_creci'] );
	echo '</tbody></table><h2>Comissão <span class="description">(interno)</span></h2><table class="form-table"><tbody>';
	cnf_partner_commercial_render_row( '_cnf_partner_commission_pct', 'Comissão total do imóvel (%)', $values['_cnf_partner_commission_pct'], 'number' ); cnf_partner_commercial_render_row( '_cnf_broker_share_pct', 'Minha participação na comissão (%)', $values['_cnf_broker_share_pct'], 'number' ); echo '</tbody></table>';
	$calc = cnf_partner_commercial_calculate( get_post_meta( $post->ID, 'fave_property_price', true ), $values['_cnf_partner_commission_pct'], $values['_cnf_broker_share_pct'] );
	if ( $calc ) { echo '<h2>Cálculos administrativos</h2><table class="widefat striped"><tbody><tr><th>Valor do imóvel</th><td>' . esc_html( cnf_partner_commercial_money( $calc['price'] ) ); $words = cnf_partner_commercial_words( $calc['price'] ); if ( $words ) echo '<br><span class="description">' . esc_html( $words ) . '</span>'; echo '</td></tr><tr><th>Comissão total</th><td>' . esc_html( $calc['commission_pct'] . '%' ) . '<br>' . esc_html( cnf_partner_commercial_money( $calc['total'] ) ) . '</td></tr><tr><th>Minha participação</th><td>' . esc_html( $calc['share_pct'] . '% da comissão' ) . '<br>' . esc_html( cnf_partner_commercial_money( $calc['mine'] ) ) . '</td></tr><tr><th>Participação efetiva</th><td>' . esc_html( $calc['effective_pct'] . '% do valor da venda' ) . '<br>' . esc_html( cnf_partner_commercial_money( $calc['mine'] ) ) . '</td></tr></tbody></table>'; }
	echo '<h2>Anotações internas da parceria</h2><textarea class="large-text" rows="8" maxlength="' . esc_attr( CNF_PARTNER_INTERNAL_NOTE_LIMIT ) . '" name="_cnf_internal_notes">' . esc_textarea( $values['_cnf_internal_notes'] ) . '</textarea><p class="description">Máximo de ' . esc_html( CNF_PARTNER_INTERNAL_NOTE_LIMIT ) . ' caracteres.</p>';
}
function cnf_partner_commercial_add_meta_box() { if ( cnf_partner_origin_admin_capability() ) add_meta_box( 'cnf-partner-commercial', 'Comercial da parceria', 'cnf_partner_commercial_render_box', 'property', 'normal', 'default' ); }
add_action( 'add_meta_boxes_property', 'cnf_partner_commercial_add_meta_box' );
function cnf_partner_commercial_save( $post_id, $post ) {
	if ( ! isset( $_POST['cnf_partner_commercial_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cnf_partner_commercial_nonce'] ) ), 'cnf_partner_commercial_save' ) || ! cnf_partner_origin_admin_capability() || ! current_user_can( 'edit_post', $post_id ) || 'property' !== $post->post_type || wp_is_post_revision( $post_id ) ) return;
	foreach ( CNF_PARTNER_COMMERCIAL_META_KEYS as $key ) if ( array_key_exists( $key, $_POST ) ) update_post_meta( $post_id, $key, cnf_partner_commercial_sanitize( wp_unslash( $_POST[ $key ] ), $key ) );
}
add_action( 'save_post_property', 'cnf_partner_commercial_save', 11, 2 );
function cnf_partner_commercial_remove_rest_fields( $response ) { foreach ( CNF_PARTNER_COMMERCIAL_META_KEYS as $key ) { unset( $response->data[ $key ] ); if ( isset( $response->data['property_meta'][ $key ] ) ) unset( $response->data['property_meta'][ $key ] ); } return $response; }
add_filter( 'rest_prepare_property', 'cnf_partner_commercial_remove_rest_fields', 101 );
