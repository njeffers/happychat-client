/** @format */

/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Returns the geo location of the current user, based happychat session initiation (on ip)
 * @param {Object}  state  Global state tree
 * @return {?String}        Current user geo location
 */
export default state => get( state, 'user.geoLocation', null );
