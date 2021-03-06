/** @format */

/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_CHAT_STATUS_ASSIGNING } from 'src/state/constants';

export default state => get( state, 'chat.status' ) === HAPPYCHAT_CHAT_STATUS_ASSIGNING;
