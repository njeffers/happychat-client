/** @format */

/**
 * Internal dependencies
 */
import getUserInfo from '../get-user-info';

describe( 'HAPPYCHAT_IO_SEND_MESSAGE_USERINFO action', () => {
	const state = {
		user: {
			geoLocation: {
				city: 'Timisoara',
			},
		},
	};

	const previousWindow = global.window;
	const previousScreen = global.screen;
	const previousNavigator = global.navigator;

	beforeAll( () => {
		global.window = {
			innerWidth: 'windowInnerWidth',
			innerHeight: 'windowInnerHeight',
		};
		global.screen = {
			width: 'screenWidth',
			height: 'screenHeight',
		};
		global.navigator = {
			userAgent: 'navigatorUserAgent',
		};
	} );

	afterAll( () => {
		global.window = previousWindow;
		global.screen = previousScreen;
		global.navigator = previousNavigator;
	} );

	test( 'should send relevant browser information to the connection', () => {
		const expectedInfo = {
			howCanWeHelp: 'howCanWeHelp',
			howYouFeel: 'howYouFeel',
			siteId: 'siteId',
			siteUrl: 'siteUrl',
			localDateTime: new Intl.DateTimeFormat( 'en-us', {
				hour12: true,
				hour: '2-digit',
				minute: '2-digit',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			} ).format( new Date() ),
			screenSize: {
				width: 'screenWidth',
				height: 'screenHeight',
			},
			browserSize: {
				width: 'windowInnerWidth',
				height: 'windowInnerHeight',
			},
			userAgent: 'navigatorUserAgent',
			geoLocation: state.user.geoLocation,
		};

		const userInfo = getUserInfo( state )( {
			site: {
				ID: 'siteId',
				URL: 'siteUrl',
			},
			howCanWeHelp: 'howCanWeHelp',
			howYouFeel: 'howYouFeel',
		} );

		expect( userInfo ).toMatchObject( expectedInfo );
	} );
} );
