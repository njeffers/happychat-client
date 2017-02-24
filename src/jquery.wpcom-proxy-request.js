const jQuery = require( 'jquery' );

( function( $ ) {
	if ( $.wpcom_proxy_request ) {
		return;
	}
	var proxy, origin = window.location.origin,
		proxyOrigin = 'https://public-api.wordpress.com',
		ready = false,
		supported = true,
		usingPM = false,
		structuredData = true,
		bufferedOps = [],
		deferreds = {},
		hasFileSerializationBug = false,
		check = function( event ) {
			structuredData = 'object' === typeof event.originalEvent.data;
			$( window ).unbind( 'message', check );
			buildProxy();
		},
		buildProxy = function() {
			if ( ! usingPM ) {
				$( window ).bind( 'message', receive );
			} else {
				pm.bind( 'proxy', function( e ) {
					receive( e );
				} );
			}
			proxy = document.createElement( 'iframe' );
			proxy.src = 'https://public-api.wordpress.com/wp-admin/rest-proxy/#' + origin;
			proxy.style.display = 'none';
			$( proxy ).bind( 'load', function() {
				let request;
				ready = true;
				while ( request = bufferedOps.shift() ) {
					postRequest( request );
				}
			} );
			$( document ).ready( function() {
				$( document.body ).append( proxy );
			} );
		},
		receive = function( e ) {
			let event, data, deferred_id, deferred;
			if ( ! usingPM ) {
				event = e.originalEvent;
				if ( event.origin !== proxyOrigin ) {
					return;
				}
				data = structuredData ? event.data : JSON.parse( event.data );
			} else {
				data = e;
			}
			if ( ! data || ! data.length ) {
				return;
			}
			deferred_id = data[ data.length - 1 ];
			if ( 'undefined' === typeof deferreds[ deferred_id ] ) {
				return;
			}
			deferred = deferreds[ deferred_id ];
			delete deferreds[ deferred_id ];
			deferred.resolve.apply( deferred, data.slice( 0, -1 ) );
		},
		perform = function() {
			const request = buildRequest.apply( null, arguments );
			postRequest( request );
			return deferreds[ request.callback ].promise();
		},
		buffer = function() {
			const request = buildRequest.apply( null, arguments );
			bufferedOps.push( request );
			return deferreds[ request.callback ].promise();
		},
		postRequest = function( request ) {
			let files = findFilesInRequest( request ),
				data = structuredData ? request : JSON.stringify( request );
			if ( hasFileSerializationBug && files.has_files ) {
				postAsArrayBuffer( request, files );
			} else {
				try {
					sendPostMessage( data );
				} catch ( e ) {
					if ( files.has_files ) {
						hasFileSerializationBug = true;
						postAsArrayBuffer( request, files );
					} else {
						throw e;
					}
				}
			}
		},
		sendPostMessage = function( data ) {
			if ( ! usingPM ) {
				proxy.contentWindow.postMessage( data, proxyOrigin );
			} else if ( window.pm ) {
				pm( {
					data: data,
					type: 'proxy',
					target: proxy.contentWindow,
					url: 'https://public-api.wordpress.com/wp-admin/rest-proxy/#' + origin,
					origin: proxyOrigin
				} );
			}
		},
		postAsArrayBuffer = function( request, files ) {
			if ( ! files.has_files )				{
				return;
			}
			$.each( files.file_keys, function( n, i ) {
				let reader = new FileReader(),
					key = request.formData[ i ][ 0 ],
					file = request.formData[ i ][ 1 ];
				reader.onload = function( e ) {
					request.formData[ i ] = [ key, {
						fileContents: e.target.result,
						fileName: file.name,
						mimeType: file.type
					} ];
					const are_there_still_files = findFilesInRequest( request );
					if ( ! are_there_still_files.has_files ) {
						proxy.contentWindow.postMessage( request, proxyOrigin );
					}
				};
				reader.readAsArrayBuffer( file );
			} );
		},
		findFilesInRequest = function( request ) {
			const files = {
				has_files: false,
				file_keys: []
			};
			if ( ! structuredData || ! request.formData || request.formData.length <= 0 )				{
				return files;
			}
			$.each( request.formData, function( i, arr ) {
				const maybe_a_file = arr[ 1 ];
				if ( 'object' === typeof maybe_a_file && '[object File]' == Object.prototype.toString.call( maybe_a_file ) ) {
					files.has_files = true;
					files.file_keys.push( i );
				}
			} );
			return files;
		},
		buildRequest = function() {
			let args = jQuery.makeArray( arguments ),
				request = args.pop(),
				path = args.pop(),
				deferred = new jQuery.Deferred(),
				deferred_id;
			if ( jQuery.isFunction( request ) ) {
				deferred.done( request );
				request = path;
				path = args.pop();
			}
			if ( 'string' === typeof( request ) ) {
				request = {
					path: request
				};
			}
			if ( path ) {
				request.path = path;
			}
			do {
				deferred_id = Math.random();
			} while ( 'undefined' !== typeof deferreds[ deferred_id ] );
			deferreds[ deferred_id ] = deferred;
			request.callback = deferred_id;
			request.supports_args = true;
			return request;
		};
	if ( $.inArray( typeof window.postMessage, [ 'function', 'object' ] ) != -1 ) {
		$( window ).bind( 'message', check );
		window.postMessage( {}, origin );
	} else if ( window.pm ) {
		usingPM = true;
		buildProxy();
	} else {
		supported = false;
	}
	$.wpcom_proxy_request = function() {
		if ( ! supported ) {
			throw ( 'Browser does not support window.postMessage' );
		}
		if ( ready ) {
			return perform.apply( null, arguments );
		}
		return buffer.apply( null, arguments );
	};
	$.wpcom_proxy_rebuild = function() {
		if ( ! ready )			{
			return;
		}
		ready = false;
		$( proxy ).remove();
		buildProxy();
	};
} )( jQuery );

window.jQuery = jQuery;
