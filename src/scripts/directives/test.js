'use strict';
(function(module) {
  try {
    module = angular.module('tink.sticktotop');
  } catch (e) {
    module = angular.module('tink.sticktotop', ['tink.navigation']);
  }
  module.directive('dirFixed',['sticky','$timeout','$window','fixedCont',function (sticky,$timeout,$window,fixedCont) {
   return {
    restrict: 'A',
    link: function (scope, element, attrs) {
    	//Add element to service
    	fixedCont.addEl(element);

    	//variables to use
    	var padding =0,
      	$el = $( element ),
      	originalPlace=null,
      	scrollBase,
      	isGoingback;

      	//get the scroll top
      	function getScrollTop() {
	        var prop = 'pageYOffset',
	          method = 'scrollTop';
	        return $window ? (prop in $window) ? $window[ prop ] :
	          $window.document.documentElement[ method ] :
	          $window.document.body[ method ];
      	}	

      	//Get the right padding of the body
      	$timeout(function(){
	        padding = parseInt($('body').css('padding-top'));
	        $el.css('top',padding);
	        $el.css('position','static');
	        update();
      	},250);

      	//update
      	function update(){
      		//Get the current top offset
      		var wTop  = getScrollTop() + padding;
      		//The element reached the top freeze it
      		if((wTop > $el.position().top) || (originalPlace && wTop > originalPlace.position().top)){
      		  //If there is nog div placeholder place it	
	          if( originalPlace === null) {
	            originalPlace = $( '<div>' ).height( $el.outerHeight(true));
	            $el.after(originalPlace );
	          }	          
	      		//set the element in fixed mode	
	          $el.css('position','fixed');
	          fixedCont.setel($el);
	          scrollBase =wTop;
	          isGoingback=0;
	        }

	        ;(function($) {
				    var delay = 0;
				    $.fn.translate3d = function(translations, speed, easing, complete) {
				        var opt = $.speed(speed, easing, complete);
				        opt.easing = opt.easing || 'ease';
				        translations = $.extend({x: 0, y: 0, z: 0}, translations);

				        return this.each(function() {
				            var $this = $(this);

				            $this.css({ 
				                transitionDuration: opt.duration + 'ms',
				                transitionTimingFunction: opt.easing,
				                transform: 'translate3d(' + translations.x + 'px, ' + translations.y + 'px,0px) translateZ(0)'
				            });

				            setTimeout(function() { 
				                $this.css({ 
				                    transitionDuration: '0s', 
				                    transitionTimingFunction: 'ease'
				                });

				                opt.complete();
				            }, opt.duration + (delay || 0));
				        });
				    };
				})(jQuery);

	        function changeTop(el,top,val){
	        	//for (var i = top;i >= val;i--){
	        		//el.css('-webkit-transform','translate3d(0px, '+i+'px, 0px)');
	        				  el.translate3d({x: 0, y: val, z: 0},0);

	        	//}
	        }

	        function reacheTop(el,top,val){
	        	//for (var i = top;i <= val;i++){
	        		//el.css('-webkit-transform','translate3d(0px, '+i+'px, 0px)');
	        			  el.translate3d({x: 0, y: val, z: 0},0);

	        //}
	        }

	        function matrix(el){
						        	 var obj = $(el);
					 var transformMatrix = obj.css("-webkit-transform") ||
					   obj.css("-moz-transform")    ||
					   obj.css("-ms-transform")     ||
					   obj.css("-o-transform")      ||
					   obj.css("transform");
					 var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
					 var x = matrix[12] || matrix[4] || 0;//translate x
					 var y = matrix[13] || matrix[5] || 0;//translate y
					 return {x:x,y:y};
	        }

	        //if the position is not fixed (so the element is back on is place) and reache the previous elemtn ! push it away
	        if($el.css('position') !== 'fixed' && fixedCont.getel() &&   ($el.position().top-wTop) <= fixedCont.getPos()-50){
	          var el = fixedCont.getel();
	          var top = parseInt(el.css('top'));

						
						var stop = parseInt(matrix(el).y);
	          var value =  stop-(fixedCont.getPos()-($el.position().top-wTop)-5);
	          changeTop(el,stop,value);
	          //el.animate({ 'top': value+'px' }, 1);
	          //el.css('top',top-(fixedCont.getPos()-($el.position().top-wTop))-2)
	   
	          isGoingback = 1;
	          scrollBase =wTop;
	        }else if(originalPlace && wTop <= originalPlace.position().top){
            originalPlace.remove();
            originalPlace= null;
            fixedCont.setel(null);
            scrollBase =wTop;
           $el.css('position','static');   
           isGoingback = 1;
        	}else if(isGoingback){
          var elo = fixedCont.getPrev($el)
          
          var nu  = wTop;
         
          if(elo){
            elo = $(fixedCont.getPrev($el));
						var stop =  parseInt(matrix(elo).y);

            var change = stop+ (scrollBase-nu);
            if(change < 0){
              reacheTop(elo,stop,change);
            }else{
							//elo.css('top',padding);
              reacheTop(elo,stop,0);
              isGoingback = 0;
            }         
   
          }
           scrollBase = nu;
        }

      	}
      	angular.element($window).bind("scroll.sticky", function() {
	        update();
	        scope.$apply();
	      });
	      document.addEventListener("touchmove", function() {
	        update();
	        scope.$apply();
	      }, false);
				document.addEventListener("scroll", function() {
	        update();
	        scope.$apply();
	      }, false);

	      fixedCont.init();
    }
  };
}]).factory('fixedCont',['$window','$timeout',function($window,$timeout){

  var padding;
  $timeout(function(){
    padding = parseInt($('body').css('padding-top'));
  },250);

  function getScrollTop() {
    var prop = 'pageYOffset',
      method = 'scrollTop';
    return $window ? (prop in $window) ? $window[ prop ] :
      $window.document.documentElement[ method ] :
      $window.document.body[ method ];
  }

  var ctrl = {};
  var count = 0;
  var el=null;
  ctrl.init = function(){
    count++;
  }
  ctrl.setel = function(nel){
    el = nel;
  }
  ctrl.getel = function(nel){
    return el;
  }
  var elList=[];
  ctrl.addEl = function(nel){
    var place = nel.position().top;
    elList.push(nel.get(0));
  }

  ctrl.getPrev = function(nel){
    var index = elList.indexOf(nel.get(0));
    if( index > 0){
      return elList[index -1];
    }
    return null;
  }

  ctrl.getPos = function(nel){
    if(el === null){return 0;
      //return getScrollTop()+padding;
    }
    return el.position().top + el.outerHeight(true)-padding;
  }
  return ctrl;
}]);
})();
