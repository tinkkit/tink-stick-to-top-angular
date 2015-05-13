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

    // Go through list of all components
    // value = scrollTop of current object
    components.forEach(function(value,key){
      if(value.extra){
        scrollTop += value.extra;
      }

      // Check if we have a next/previous element
      var next = key+1 < lengthC;
      var prev = key-1 > -1;
      var element = $(value.elem); // current

      // If not in viewport, go to next element
      if(scrollTop > value.top+element.outerHeight(true) && scrollTop>value.stop){
        //removeSticky(value);
        return;
      }

      // If there's a previous component of the same level:
      // Add ((Height of prev element) - (height of elements on a higher level)) to current scrollTop
      if(prev && components[key-1].level === value.level){
        scrollTop+=$(components[key-1].elem).outerHeight(true)-components[key-1].extra;
     }

      // If (viewport + sticky elements on same level) > scrollTop >= current element's top
      // Make sticky (or remove sticky)
      if(scrollTop>= value.top && scrollTop < value.stop){
        if(isSticky(value)===-1){
          if(prev){
            var prevOutherHeight = $(components[key-1].elem).outerHeight(true);
            if(components[key-1].level !== value.level){
              addSticky(value);
            }else if(scrollTop>=value.top && scrollTop<= value.top+prevOutherHeight){console.log(element.get(0).style.background)
              // console.log(element.get(0).style.background,scrollTop,value.top)
              var diff = value.top-scrollTop;

              $(components[key-1].elem).css('top',components[key-1].extra+prevOutherHeight+diff+'px');
              $(components[key-1].elem).css('z-index',0)
            }else{
              removeSticky(components[key-1]);
              addSticky(value);
            }
          }else{
            addSticky(value);
          }

        }        
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
      var element = $(value.elem);
      if(next){
        for(var i=key+1;i<lengthC;i++){
          var nextElement = $(components[i].elem);
          if(components[i].level === value.level){
            value.stop = components[i].top-element.outerHeight(true);
            break;
          }else if(components[i].level < value.level && value.stop === undefined){
            value.stop = components[i].top;
          }
        }
        //console.log($window.innerHeight,$window,($(document).height() - $(window).height()))
        if(value.stop === undefined){
          value.stop = $(document).height() - $(window).height();
        }
      }
      for(var j=key;j>=0;j--){
              if(components[j].level < value.level){
                value.extra = $(components[j].elem).outerHeight(true);
                break;
              }
              value.prevHeigths = 0;
              if(components[j].level < value.level){
                value.prevHeigths += $(components[j].elem).outerHeight(true);
              }
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
