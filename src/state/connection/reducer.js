/** @format **/

/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_IO_INIT,
	HAPPYCHAT_IO_RECEIVE_ACCEPT,
	HAPPYCHAT_IO_RECEIVE_DISCONNECT,
	HAPPYCHAT_IO_RECEIVE_INIT,
	HAPPYCHAT_IO_RECEIVE_RECONNECTING,
} from '../action-types';
import {
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
} from '../constants';

/**
 * Tracks connection errors as defined by the SocketIO library
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const error = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_INIT:
			return null;
		case HAPPYCHAT_IO_RECEIVE_DISCONNECT:
			return action.error;
	}
	return state;
};

/**
 * Tracks the state of the happychat client connection
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const status = ( state = HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_INIT:
			return HAPPYCHAT_CONNECTION_STATUS_CONNECTING;
		case HAPPYCHAT_IO_RECEIVE_INIT:
			return HAPPYCHAT_CONNECTION_STATUS_CONNECTED;
		case HAPPYCHAT_IO_RECEIVE_DISCONNECT:
			return HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED;
		case HAPPYCHAT_IO_RECEIVE_RECONNECTING:
			return HAPPYCHAT_CONNECTION_STATUS_RECONNECTING;
	}
	return state;
};

/**
 * Tracks whether happychat.io is accepting new chats.
 *
 * @param  {Boolean} state  Current happychat status
 * @param  {Object}  action Action playload
 * @return {Boolean}        Updated happychat status
 */
export const isAvailable = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_ACCEPT:
			return action.isAvailable;
	}
	return state;
};

export default combineReducers( {
	error,
	isAvailable,
	status,
} );
