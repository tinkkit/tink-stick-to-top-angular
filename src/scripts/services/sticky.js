'use strict';
(function(module) {
  try {
    module = angular.module('tink.sticktotop');
  } catch (e) {
    module = angular.module('tink.sticktotop', ['tink.navigation']);
  }
  module.factory('sticky', function($window) {
    var sticky = function(elm) {
    	/* variables */

	      var classes = {
							plugin: 'fixedsticky',
							active: 'fixedsticky-on',
							inactive: 'fixedsticky-off',
							clone: 'fixedsticky-dummy',
							withoutFixedFixed: 'fixedsticky-withoutfixedfixed'
						},
						keys = {
							offset: 'fixedStickyOffset',
							position: 'fixedStickyPosition',
							id: 'fixedStickyId'
						},
						tests = {
							sticky: featureTest( 'position', 'sticky' ),
							fixed: featureTest( 'position', 'fixed', true )
						},
						uniqueIdCounter = 0;


        /* functions ¨*/
        function featureTest( property, value, noPrefixes ) {
	        // Thanks Modernizr! https://github.com/phistuck/Modernizr/commit/3fb7217f5f8274e2f11fe6cfeda7cfaf9948a1f5
	        var prop = property + ':',
	          el = document.createElement( 'test' ),
	          mStyle = el.style;

	        if( !noPrefixes ) {
	          mStyle.cssText = prop + [ '-webkit-', '-moz-', '-ms-', '-o-', '' ].join( value + ';' + prop ) + value + ';';
	        } else {
	          mStyle.cssText = prop + value;
	        }
	        return mStyle[ property ].indexOf( value ) !== -1;
	      }

	      function getPx( unit ) {
	        return parseInt( unit, 10 ) || 0;
	      }

	      function getScrollTop() {
					var prop = 'pageYOffset',
						method = 'scrollTop';
					return $window ? (prop in $window) ? $window[ prop ] :
						$window.document.documentElement[ method ] :
						$window.document.body[ method ];
				}

				function bypass() {
					// Check native sticky, check fixed and if fixed-fixed is also included on the page and is supported
					return ( tests.sticky && !optOut ) ||
						!tests.fixed ||
						$window.FixedFixed && !$( $window.document.documentElement ).hasClass( 'fixed-supported' );
				}
				function update( el ) {
					if( !el.offsetWidth ) { return; }

					var $el = $( el ),
						height = $el.outerHeight(),
						initialOffset = $el.data( keys.offset ),
						scroll = getScrollTop(),
						isAlreadyOn = $el.is( '.' + classes.active ),
						toggle = function( turnOn ) {
							$el[ turnOn ? 'addClass' : 'removeClass' ]( classes.active )
								[ !turnOn ? 'addClass' : 'removeClass' ]( classes.inactive );
						},
						viewportHeight = $( window ).height(),
						position = $el.data( keys.position ),
						skipSettingToFixed,
						elTop,
						elBottom,
						$parent = $el.parent(),
						parentOffset = $parent.offset().top,
						parentHeight = $parent.outerHeight();

					if( initialOffset === undefined ) {
						initialOffset = $el.offset().top;
						$el.data( keys.offset, initialOffset );
						$el.after( $( '<div>' ).addClass( classes.clone ).height( height ) );
					}

					if( !position ) {
						// Some browsers require fixed/absolute to report accurate top/left values.
						skipSettingToFixed = $el.css( 'top' ) !== 'auto' || $el.css( 'bottom' ) !== 'auto';

						if( !skipSettingToFixed ) {
							$el.css( 'position', 'fixed' );
						}

						position = {
							top: $el.css( 'top' ) !== 'auto',
							bottom: $el.css( 'bottom' ) !== 'auto'
						};

						if( !skipSettingToFixed ) {
							$el.css( 'position', '' );
						}

						$el.data( keys.position, position );
					}

					function isFixedToTop() {
						var offsetTop = scroll + elTop;

						// Initial Offset Top
						return initialOffset < offsetTop &&
							// Container Bottom
							offsetTop + height <= parentOffset + parentHeight;
					}

					function isFixedToBottom() {
						// Initial Offset Top + Height
						return initialOffset + ( height || 0 ) > scroll + viewportHeight - elBottom &&
							// Container Top
							scroll + viewportHeight - elBottom >= parentOffset + ( height || 0 );
					}

					elTop = getPx( $el.css( 'top' ) );
					elBottom = getPx( $el.css( 'bottom' ) );

					if( position.top && isFixedToTop() || position.bottom && isFixedToBottom() ) {
						if( !isAlreadyOn ) {
							toggle( true );
						}
					} else {
						if( isAlreadyOn ) {
							toggle( false );
						}
					}
				};

				function init( el ) {console.log('run')
						var $el = $( el );

						if( bypass() ) {
							return $el;
						}

						return $el.each(function() {
							var _this = this;
							var id = uniqueIdCounter++;
							$( this ).data( keys.id, id );

							$( $window ).bind( 'scroll.fixedsticky' + id, function() {
								update( _this );
							}).trigger( 'scroll.fixedsticky' + id );

							$( $window ).bind( 'resize.fixedsticky' + id , function() {
								if( $el.is( '.' + classes.active ) ) {
									update( _this );
								}
							});
						});
				};

				init(elm);
			}
    return sticky;
});
})();