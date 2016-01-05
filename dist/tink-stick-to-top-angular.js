'use strict';
(function(module) {
  try {
    module = angular.module('tink.sticktotop');
  } catch (e) {
    module = angular.module('tink.sticktotop', []);
  }
  module.directive('tinkSticky',['$timeout','$window','stickyService',function ($timeout,$window,fixedCont) {
   return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var level = 1;
      if(attrs.tinkLevel){
        level = parseFloat(attrs.tinkLevel);
      }
      fixedCont.register(element,level);

      scope.$on('$destroy', function handleDestroy() {
          fixedCont.unRegister(element, level);
      });

    }
  };


}]).factory('stickyService',['$window','$timeout',function($window,$timeout){
  // Create scope for factory
  var ctrl = {};
  var padding;
  var stickyClass = 'is-sticky';
  var components=[];
  var stickyList=[];
  var runResize;

  function resizeFn() {
    $timeout.cancel(runResize);
    runResize = $timeout(function () {
      components.forEach(function (v) {
          if(v.dummy && stickyList.indexOf(v)>-1){
            v.top = $(v.dummy).offset().top;
          }else{
            v.top = $(v.elem).offset().top;
          }
      });
      calculateValues();
      update();
      update();

    }, 250);
  }

 
  function bindEvents(){

     /*
  Trigger update function while scrolling
   */
    $timeout(function(){
      padding = parseFloat($('body').css('padding-top')) || 0;

      angular.element($window).bind('scroll.sticky', function() {
        update();
      });

      angular.element($window).bind('touchstart.sticky', function() {
        update();
      });

      angular.element($window).bind('touchmove.sticky', function() {
        update();
      });

      angular.element($window).bind('touchend.sticky', function() {
        update();
      });

      angular.element($window).bind('resize.sticky', resizeFn);

      calculateValues();
      update();

    }, 250);

  }
  bindEvents();
  function unbindEvents(){
    angular.element($window).unbind('scroll.sticky touchstart.sticky touchmove.sticky touchend.sticky resize.sticky');
  }

  ctrl.update = function(){
    resizeFn.call();
  };

  /*
  Loop through this while scrolling
   */
  function update(){
    padding = parseFloat($('body').css('padding-top')) || 0;
    var scrollTop = getScrollTop()+padding;
    //var lengthC = components.length;

    // Debug
    // $('#valueTop').html(scrollTop);

    // Go through list of all components
    // value = scrollTop of current object
    components.forEach(function(value) {

      function stickyCal(){
        var elemHeight = $(value.elem).outerHeight(true);
        if(stickyList.indexOf(value)>-1){
          elemHeight = $(value.dummy).outerHeight(true);
        }
        if(element.hasClass(stickyClass) && stickyList.length > 0){
          var lastIndex = stickyList.length-1;
          var v = stickyList[lastIndex];
            if((v.stop - elemHeight) < scrollTop) {
              var e = (v.stop-scrollTop);
              var diff = elemHeight - e;
              var diff2 = (padding+v.extra) - diff;
              $(v.elem).css('top', diff2+'px');
            }else{

            var topHeight = padding;
            if(value.extra){
              topHeight+= value.extra;
            }
            $(value.elem).css('top', topHeight+'px');

              $(v.elem).css('top', v.extra+padding+'px');
            }

          /*var topHeight = padding;
            if(value.extra){
              topHeight+= value.extra;
            }
            $(value.elem).css('top', topHeight+'px');*/
        }
      }

      // Compensation
      scrollTop += value.extra - value.trigger;

      // Check if we have a next/previous element
      //var next = key+1 < lengthC;
      //var prev = key-1 > -1;
      var element = $(value.elem); // current

      //if not in viewport, go to next element
      if(scrollTop > value.top+element.outerHeight(true) && scrollTop > value.stop){
        removeSticky(value);
        return;
      }

      /*
        Second attempt:
        - Monitor elements that are not sticky and see if their top is "in the zone".
       */
       stickyCal();

      if(scrollTop > value.top.toFixed(2) && (scrollTop < value.stop || value.stop === undefined)){
        addSticky(value);
      }else{
        removeSticky(value);
      }
      stickyCal();
    });
  }



  var highLevel = 0;
  /*
  Make element sticky
   */
  function addSticky(obj){
    if(obj && obj.elem){
      var elem = $(obj.elem);
      if(isSticky(obj)===-1){
        // elem.css('z-index', obj.zindex);
        var topHeight = padding;
        if(obj.extra){
          topHeight+= obj.extra;
        }
        obj.dummy = createDummy(elem);
        elem.after(obj.dummy);
        makeSticky(elem,topHeight,obj.level);
        stickyList.push(obj);
      }
    }
  }

  /*
  Remove sticky
   */
  function removeSticky(obj){
    if(obj && obj.elem){
      //var elem = $(obj.elem);
      var stickyIndex = isSticky(obj);
      if(stickyIndex > -1){

        var sticky = stickyList[stickyIndex];
        sticky.elem.css('z-index', '');
        sticky.dummy.remove();
        $(sticky.elem).removeClass(stickyClass);
        stickyList.splice(stickyIndex,1);
      }
    }
  }

  /*
  Dummy element to prevent content from 'jumping'
   */
  function createDummy(elem){
    elem = $(elem);
    elem = elem.clone();
    elem.css('opacity','0');
    return $(elem );
  }

  /*
  Runs on startup to calculate all necessary values
  To do: make it also run on viewport resize
   */
  function calculateValues(){
    var lengthC = components.length;
    components.forEach(function(value,key){
      var next = key+1 < lengthC;
      value.extra = 0;
      value.trigger = undefined;

      // console.log($(value.elem).get(0).id);

      // Loop through previous components in order to define 'extra' (var extra = top coordinate where block sits when sticky)
      for(var j=key; j>0; j--){

        var pre = components[j-1];

        if(value.trigger === undefined){
          value.trigger = pre.extra;
        }
        if(pre && pre.level < value.level){
          value.extra = pre.extra + $(pre.elem).outerHeight(true);
          break;
        } else if(pre && pre.level === value.level) {
          value.extra = pre.extra;
          break;
        }
        // console.log(value.extra);
      }
      // console.log("--------");
      if(next){
        for(var i=key+1;i<lengthC;i++){
          var nextv = components[i];
          if(value.level >= nextv.level){
            value.stop = nextv.top;
            break;
          }
        }
        if(value.stop === undefined){
          //value.stop = $(document).height() - $(window).height();
        }if(value.trigger === undefined){
          value.trigger = 0;
        }
      }else{
        //value.stop = $(document).height() - $(window).height();
      }
      value.zindex = (highLevel+1) - value.level;
      if(value.trigger === undefined){
        value.trigger = 0;
      }
    });
  }

  /*
  Checks if element is sticky and if yes, at which position
   */
  function isSticky(obj){
    var index = -1;
    for (var i = stickyList.length; i--;) {
      var objNext = stickyList[i];
       if($(obj.elem).get(0) === $(objNext.elem).get(0)){
        index=i;
        break;
      }
    }
    return index;
  }

  /*
  Helper function to get scrollTop
   */
  function getScrollTop() {
    var prop = 'pageYOffset',
      method = 'scrollTop';
    return $window ? (prop in $window) ? $window[ prop ] :
      $window.document.documentElement[ method ] :
      $window.document.body[ method ];
  }

  /*
  Help function make sticky
   */
  function makeSticky(elem,top,level){
    elem = $(elem);
    elem.addClass(stickyClass);
    var maxZIndex = elem.css('z-index'); // Read from Tink core
    elem.css('z-index', maxZIndex - (level - 1)); // Higher level means lower z-index
    // console.log(elem.css('z-index'));
    elem.css('top', top+'px');
  }

  ctrl.unRegister = function (element, level) {
      for (var i = 0; i < components.length; i++) {
          if (components[i].elem.get(0) === element.get(0)) {
              components.splice(i, 1);
              i = 99;
          }
      }
      if(components.length === 0){
        unbindEvents();
      }
  }

  ctrl.register= function(element,level){
    $timeout(function(){
      if(highLevel < level){
        highLevel = level;
      }
      //var nakedEl = $(element).get(0);
        components.push({elem: $(element),top:$(element).offset().top,level:level});
        components = components.sort(function(a, b){
            a = parseFloat(a.top);
            b = parseFloat(b.top);
            return a - b;
        });
        if(components.length === 1){
          bindEvents();
        }
        calculateValues();
        update();
    },250);
  };

  return ctrl;

}]);
})();
;