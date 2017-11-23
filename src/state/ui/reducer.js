/** @format */

/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_MINIMIZING,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
} from '../action-types';

/**
 * Tracks the current message the user has typed into the happychat client
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const currentMessage = ( state = '', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE:
			return '';
		case HAPPYCHAT_SET_CURRENT_MESSAGE:
			return action.message;
	}
	return state;
};

/**
 * Tracks the last time Happychat had focus. This lets us determine things like
 * whether the user has unread messages. A numerical value is the timestamp where focus
 * was lost, and `null` means HC currently has focus.
 *
 * @param {Object} state Current state
 * @param {Object} action Action payload
 * @return {Object}        Updated state
 */
export const lostFocusAt = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_BLUR:
			return Date.now();
		case HAPPYCHAT_FOCUS:
			return null;
	}
	return state;
};

/**
 * Tracks whether the happychat panel is open
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const isOpen = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_OPEN:
			return !! action.isOpen;
	}
	return state;
};

/**
 * Tracks the state of the happychat minimizing process
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const isMinimizing = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_MINIMIZING:
			return action.isMinimizing ? true : false;
	}
	return state;
};

export default combineReducers( { currentMessage, isMinimizing, isOpen, lostFocusAt } );
