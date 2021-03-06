/** @format */

/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
// utils
import { hasTouch } from 'src/lib/touch-detect';
// UI components
import Happychat, { ENTRY_FORM } from 'src/form';
import { MessageForm } from 'src/ui/components/message-form';
// state: general, actions, selectors
import eventAPIFactory from 'src/state/event-api';
import reducer from 'src/state/reducer';
import { socketMiddleware } from 'src/state/middleware';
import { HAPPYCHAT_GROUP_WPCOM } from 'src/state/constants';
import { setAssetsLoaded, setFormDefaultValues } from 'src/state/ui/actions';
import { setCurrentUser, setGroups, setLocale, setEligibility } from 'src/state/user/actions';
import { setFallbackTicketOptions } from 'src/state/fallbackTicket/actions';
import config from 'src/config';

const store = createStore(
	reducer,
	{},
	compose( applyMiddleware( socketMiddleware() ), devToolsEnhancer() )
);

const dispatchAssetsFinishedDownloading = () => store.dispatch( setAssetsLoaded() );

/**
 * Creates an iframe in the node provided by the nodeId prop.
 *
 * We want this iframe to be non-blocking respect of the main window onload event,
 * but also we want to notify happychat when all assets are done downloading.
 *
 * @param  {Object} props Properties used by the renderMethod.
 * @param  {Function} assetsLoadedHook Callback to be executed when all assets are done downloading.
 * @returns {HTMLNode} Target node where Happychat can hook into.
 */
const createIframe = ( props, assetsLoadedHook = () => {} ) => {
	const { nodeId, groups, entryOptions } = props;
	const iframeElement = document.createElement( 'iframe' );

	const primaryHasAnySecondary = options =>
		Array.isArray( options ) && find( options, opt => opt.secondaryOptions );

	const isThereAnySecondaryOptions = options =>
		options &&
		( options.secondaryOptions || primaryHasAnySecondary( entryOptions.primaryOptions ) );

	// Calculate height based on the number of components
	// the iframe may need to render.
	let iframeHeight = 415;
	iframeHeight = iframeHeight + ( entryOptions && entryOptions.primaryOptions ? 95 : 0 );
	iframeHeight = iframeHeight + ( isThereAnySecondaryOptions( entryOptions ) ? 95 : 0 );
	iframeHeight = iframeHeight + ( entryOptions && entryOptions.itemList ? 100 : 0 );
	iframeHeight = iframeHeight + ( entryOptions && entryOptions.openTextField ? 100 : 0 );
	iframeHeight = iframeHeight + ( entryOptions && entryOptions.openTextArea ? 150 : 0 );

	// style iframe element
	iframeElement.width = '100%';
	iframeElement.height = iframeHeight + 'em';
	iframeElement.frameBorder = 0;
	iframeElement.scrolling = 'no';

	document.getElementById( nodeId ).appendChild( iframeElement );

	// Force FF (and maybe other browsers?) to write the changes to this iframe;
	// otherwise, the changes wont' be applied.
	iframeElement.contentDocument.open();
	iframeElement.contentDocument.write();
	iframeElement.contentDocument.close();

	// We want to show a loading indicator while the rest of assets
	// are downloading. This CSS pertains to the loading indicator
	// and needs to be available since the very beginning.
	const styleLoading = document.createElement( 'style' );
	styleLoading.setAttribute( 'type', 'text/css' );
	styleLoading.appendChild(
		document.createTextNode( `
			@-webkit-keyframes spinner-line__animation {
			  0% {
			    background-position: 0 0;
			  }
			  100% {
			    background-position: 600px 0;
			  }
			}
			@keyframes spinner-line__animation {
			  0% {
			    background-position: 0 0;
			  }
			  100% {
			    background-position: 600px 0;
			  }
			}

			hr.spinner-line {
			  border: none;
			  height: 3px;
			  margin: 24px 0;
			  background-image: linear-gradient(to right, #a8bece 0%, #c8d7e1 50%, #a8bece 100%);
			  background-size: 300px 100%;
			  -webkit-animation: spinner-line__animation 1.2s infinite linear;
			          animation: spinner-line__animation 1.2s infinite linear;
			}
		` )
	);
	iframeElement.contentDocument.head.appendChild( styleLoading );

	// Then, we inject the stylesheets: the noticon custom font, Happychat, and the theme if any.
	// We want to tell Happychat when they are downloaded, and we do so by means of the onload method
	// of the stylesheets, which will resolve the Promise.all()
	const styleNoticon = document.createElement( 'link' );
	styleNoticon.setAttribute( 'rel', 'stylesheet' );
	styleNoticon.setAttribute( 'type', 'text/css' );
	styleNoticon.setAttribute( 'href', 'https://s1.wp.com/i/noticons/noticons.css' );
	const styleNoticonPromise = new Promise( resolve => ( styleNoticon.onload = () => resolve() ) );

	const styleHC = document.createElement( 'link' );
	styleHC.setAttribute( 'rel', 'stylesheet' );
	styleHC.setAttribute( 'type', 'text/css' );
	styleHC.setAttribute( 'href', config( 'css_url' ) + 'happychat.css' );

	// TODO: rework this to use skills and have local themes loaded
	const styleHCPromise = new Promise( resolve => ( styleHC.onload = () => resolve() ) );

	const styleHCTheme = document.createElement( 'link' );
	styleHCTheme.setAttribute( 'rel', 'stylesheet' );
	styleHCTheme.setAttribute( 'type', 'text/css' );
	let styleHCThemePromise = Promise.resolve();
	if ( groups && groups.length > 0 ) {
		const groupName = groups[ 0 ];
		if ( groupName === 'woo' || groupName === 'jpop' ) {
			styleHCTheme.setAttribute( 'href', config( 'css_url' ) + groupName + '.css' );
			styleHCThemePromise = new Promise( resolve => ( styleHCTheme.onload = () => resolve() ) );
		}
	}

	Promise.all( [ styleNoticonPromise, styleHCPromise, styleHCThemePromise ] ).then( () =>
		assetsLoadedHook()
	);

	// appending the stylesheets to the iframe will trigger the network request
	iframeElement.contentDocument.head.appendChild( styleNoticon );
	iframeElement.contentDocument.head.appendChild( styleHC );
	iframeElement.contentDocument.head.appendChild( styleHCTheme );

	// some CSS styles depend on these top-level classes being present
	iframeElement.contentDocument.body.classList.add( hasTouch() ? 'touch' : 'notouch' );

	// React advises to use an element -not the body itself- as the target render,
	// that's why we create this wrapperElement inside the iframe.
	const targetNode = document.createElement( 'div' );
	const spinnerLine = document.createElement( 'hr' );
	spinnerLine.className = 'spinner-line';
	targetNode.appendChild( spinnerLine );
	iframeElement.contentDocument.body.appendChild( targetNode );

	return targetNode;
};

const isAnyCanChatPropFalse = ( canChat, entryOptions ) =>
	false === canChat ||
	( Array.isArray( entryOptions.primaryOptions ) &&
		entryOptions.primaryOptions.length > 0 &&
		false === entryOptions.primaryOptions[ 0 ].canChat ) ||
	( Array.isArray( entryOptions.secondaryOptions ) &&
		entryOptions.secondaryOptions.length > 0 &&
		false === entryOptions.secondaryOptions[ 0 ].canChat ) ||
	( Array.isArray( entryOptions.itemList ) &&
		entryOptions.itemList.length > 0 &&
		false === entryOptions.itemList[ 0 ].canChat );

/* eslint-disable camelcase */
export const renderHappychat = (
	targetNode,
	{
		userObject: { ID, email, username, display_name, avatar_URL, language },
		groups = [ HAPPYCHAT_GROUP_WPCOM ],
		canChat = true,
		entry = ENTRY_FORM,
		entryOptions = {},
	}
) => {
	store.dispatch(
		setCurrentUser( {
			ID,
			email,
			username,
			display_name,
			avatar_URL,
		} )
	);
	store.dispatch( setGroups( groups ) );
	store.dispatch( setLocale( language ) );
	store.dispatch( setFallbackTicketOptions( entryOptions ) );
	store.dispatch( setFormDefaultValues( entryOptions.defaultValues ) );

	isAnyCanChatPropFalse( canChat, entryOptions )
		? store.dispatch( setEligibility( false ) )
		: store.dispatch( setEligibility( true ) );

	ReactDOM.render(
		<Provider store={ store }>
			<Happychat entry={ entry } entryOptions={ entryOptions } />
		</Provider>,
		targetNode
	);
};
/* eslint-enable camelcase */

export const createTargetNode = ( { nodeId, groups, entryOptions } ) => {
	return createIframe( { nodeId, groups, entryOptions }, dispatchAssetsFinishedDownloading );
};

export const renderError = ( targetNode, { error } ) =>
	ReactDOM.render( <MessageForm message={ 'Could not load form. ' + error } />, targetNode );

export const eventAPI = eventAPIFactory( store );
