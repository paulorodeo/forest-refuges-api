<?php
/**
 * Plugin Name: Casa na Floresta - Seasonal Public Pricing
 * Description: Shows seasonal properties as Sob Consulta without changing their administrative price.
 */
defined( 'ABSPATH' ) || exit;

const CNF_SEASONAL_PROPERTY_STATUS_SLUGS = array( 'temporada', 'airbnb' );
const CNF_SEASONAL_PRICE_META_KEYS = array(
	'fave_property_price',
	'fave_property_sec_price',
	'fave_property_price_prefix',
	'fave_property_price_postfix',
);

function cnf_is_seasonal_property( $post_id ) {
	return 'property' === get_post_type( $post_id ) && has_term( CNF_SEASONAL_PROPERTY_STATUS_SLUGS, 'property_status', $post_id );
}

function cnf_seasonal_public_price_meta( $value, $post_id, $meta_key, $single ) {
	if ( ! in_array( $meta_key, CNF_SEASONAL_PRICE_META_KEYS, true ) || is_admin() || current_user_can( 'edit_post', $post_id ) || ! cnf_is_seasonal_property( $post_id ) ) return $value;
	if ( 'fave_property_price' === $meta_key ) return $single ? 'Sob Consulta' : array( 'Sob Consulta' );
	return $single ? '' : array( '' );
}
add_filter( 'get_post_metadata', 'cnf_seasonal_public_price_meta', 10, 4 );

function cnf_seasonal_public_price_rest( $response, $post ) {
	if ( ! cnf_is_seasonal_property( $post->ID ) ) return $response;
	foreach ( CNF_SEASONAL_PRICE_META_KEYS as $meta_key ) {
		unset( $response->data[ $meta_key ] );
		if ( isset( $response->data['property_meta'][ $meta_key ] ) ) unset( $response->data['property_meta'][ $meta_key ] );
	}
	return $response;
}
add_filter( 'rest_prepare_property', 'cnf_seasonal_public_price_rest', 100, 2 );
