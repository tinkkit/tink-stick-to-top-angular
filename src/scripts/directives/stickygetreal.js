'use strict';
(function(module) {
  try {
    module = angular.module('tink.sticktotop');
  } catch (e) {
    module = angular.module('tink.sticktotop', ['tink.navigation']);
  }
  module.directive('tinkSticky',['$timeout','$window','fixedCont',function ($timeout,$window,fixedCont) {
   return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var level = 1;
      if(attrs.tinkLevel){
        level = parseInt(attrs.tinkLevel);
      }
      fixedCont.register(element,level);
    }
  };


}]).factory('fixedCont',['$window','$timeout',function($window,$timeout){

  var padding;

  /*
  Trigger update function while scrolling
   */
  $timeout(function(){
    padding = parseInt($('body').css('padding-top'));

    angular.element($window).bind('scroll.sticky', function() {
      update();
    });

    angular.element($window).bind('touchstart.sticky', function() {
      update();
    });

    angular.element($window).bind('touchmove.sticky', function(event) {
      update();
    });

    update();
    calculateValues();
  },250);

  var components=[];
  var stickyList=[];

  /*
  Loop through this while scrolling
   */
  function update(){
    var scrollTop = getScrollTop();//console.log(scrollTop)
    var lengthC = components.length;

    $('#valueTop').html(scrollTop);

    // Go through list of all components
    // value = scrollTop of current object
    components.forEach(function(value,key){

      // Compensation
      scrollTop += value.extra - value.trigger;

      // Check if we have a next/previous element
      var next = key+1 < lengthC;
      var prev = key-1 > -1;
      var element = $(value.elem); // current

      //if not in viewport, go to next element
      if(scrollTop > value.top+element.outerHeight(true) && scrollTop>value.stop){
        removeSticky(value);
        return;
      }

      // If (viewport + sticky elements on same level) > scrollTop >= current element's top
      // Make sticky (or remove sticky)
      if(scrollTop> value.top && scrollTop < value.stop){
        addSticky(value);
      }else{
        removeSticky(value);
      }
    });
  }

  /*
  Make element sticky
   */
  function addSticky(obj){
    if(obj && obj.elem){
      var elem = $(obj.elem);
      if(isSticky(obj)===-1){
        var topHeight = padding;
        if(obj.extra){
          topHeight+= obj.extra;
        }
        obj.dummy = createDummy(elem);
        elem.after(obj.dummy);
        makeSticky(elem,topHeight);
        stickyList.push(obj);
      }
    }
  }

  /*
  Remove sticky
   */
  function removeSticky(obj){
    if(obj && obj.elem){
      var elem = $(obj.elem);
      var stickyIndex = isSticky(obj);
      if(stickyIndex > -1){

        var sticky = stickyList[stickyIndex];
        sticky.dummy.remove();
        $(sticky.elem).removeClass('sticky');
        stickyList.splice(stickyIndex,1);
     //   console.log(stickyIndex,obj,stickyList);
      }
    }
  }

  /*
  Dummy element to prevent content from 'jumping'
   */
  function createDummy(elem){
    elem = $(elem);
    return $( '<div>' ).height(elem.outerHeight(true));
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
          value.stop = $(document).height() - $(window).height();
        }if(value.trigger === undefined){
          value.trigger = 0;
        }
      }else{
        value.stop = $(document).height() - $(window).height();
      }

    });

    console.log(components);
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
    };
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
  function makeSticky(elem,top){
    elem = $(elem);
    elem.addClass('sticky');
    elem.css('top',top+'px');
  }


  // Create scope for factory
  var ctrl = {};

  ctrl.register= function(element,level){
    var nakedEl = $(element).get(0);
      components.push({elem: $(element),top:$(element).position().top,level:level});
      components = components.sort(function(a, b){
          a = parseInt(a.top);
          b = parseInt(b.top);
          return a - b;
      });
  }

  return ctrl;

}]);
})();
