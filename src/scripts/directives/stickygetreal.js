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
      fixedCont.register(element);
    }
  };


}]).factory('fixedCont',['$window','$timeout',function($window,$timeout){

  var padding;
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
  },250);

  function getScrollTop() {
    var prop = 'pageYOffset',
      method = 'scrollTop';
    return $window ? (prop in $window) ? $window[ prop ] :
      $window.document.documentElement[ method ] :
      $window.document.body[ method ];
  }



  var components=[];
  var currentSticky={dummy:null,original:null};

  function update(){
    var scrollTop = getScrollTop();
    var lengthC = components.length;

    if(currentSticky.dummy){
      if(scrollTop+padding <= currentSticky.dummy.position().top){
        removeSticky();
      }
    }

    components.forEach(function(value,key){
      var next = key+1 < lengthC;
      var element = $(value.elem);
      if(next && scrollTop >= value.top && scrollTop < value.stop){
        setSticky(value,padding);    
      }else if(!next && scrollTop >= value.top){
        setSticky(value,padding);  
      }
    });

  }

  function setSticky(obj,margin){
    if((currentSticky.dummy && $(currentSticky.original.elem).get(0) !== $(obj.elem).get(0)) || !currentSticky.dummy){
      removeSticky();
      var element = $(obj.elem);
      currentSticky.dummy = $( '<div>' ).height(element.outerHeight(true));
     // element.after(currentSticky.dummy);
      element.addClass('sticky');
      element.css('top',margin+'px');
      currentSticky.original = obj;
    }    
  }

  function removeSticky(){
    if(currentSticky.dummy){
      currentSticky.dummy.remove();
      $(currentSticky.original.elem).removeClass('sticky');
      currentSticky = {};
    }
  }

  function calculateValues(){
    var lengthC = components.length;
    components.forEach(function(value,key){
      var next = key+1 < lengthC;
      var element = $(value.elem);
      if(next){
        var nextElement = $(components[key+1].elem);
        value.stop = nextElement.position().top;
      }
    });
  }

  var ctrl = {};
  ctrl.register= function(element){
    var nakedEl = $(element).get(0);
      components.push({elem: $(element),top:$(element).position().top});
      calculateValues();
      components = components.sort(function(a, b){
          a = parseInt(a.top);
          b = parseInt(b.top);
          return a - b;
      });
      //$(element).addClass('sticky');

  }
  
  return ctrl;
}]);
})();
