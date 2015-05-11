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
  var currentSticky=[];

  function update(){
    var scrollTop = getScrollTop();
    $('#valueTop').html(scrollTop);
    $('#elementPos').html(components[0].top);
    var lengthC = components.length;

    if(currentSticky.dummy){
      if(scrollTop+padding <= currentSticky.dummy.position().top){
        removeSticky();
      }
    }

    components.forEach(function(value,key){
      var next = key+1 < lengthC;
      var element = $(value.elem);
      //Next level present
      if(next){
        var nextElement = $(components[key+1].elem);
        //Next obj
        var nextObj = components[key+1];
        //IF the same level
        if(nextObj.level === value.level){
          //If next and value is between this and next
          if(scrollTop >= value.top && scrollTop < value.stop){
            //if next is between top and this height
            if((nextElement.position().top - scrollTop) <= element.outerHeight(true)+padding){
              var verschil = (nextElement.position().top-padding-scrollTop);
              var secondTop = (padding+verschil); // top van rode blok
              var firstTop = (padding+verschil-element.outerHeight(true)); // top van gele blok
              setSticky(value,firstTop); 
              element.css('top',(firstTop)+'px');
            }else{
              setSticky(value,padding);
              element.css('top',padding+'px');  
            }
          }
        }else if(nextObj.level>value.level){


        }

      }else if(!next && scrollTop >= value.top){
            setSticky(value,padding);  
          }
      
    });

  }

  function insideCurrent(obj){
    var newObj = currentSticky.filter(function(value){
      if($(value.original).get(0) === $(obj).get(0)){
        return true;
      }else{
        return false;
      }
    })
    if(newObj.length > 0){
      return true;
    }
    return false;
  }
  function setSticky(obj,margin){
    if((currentSticky.length > 0 && insideCurrent($(obj.elem).get(0)) === false) || currentSticky.length === 0){
      var newObj = {};
      var element = $(obj.elem);
      newObj.dummy = $( '<div>' ).height(element.outerHeight(true));
      element.after(currentSticky.dummy);
      element.addClass('sticky');
      element.css('top',margin+'px');
      newObj.original = obj;
      currentSticky.push(newObj);
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
  ctrl.register= function(element,level){
    var nakedEl = $(element).get(0);
      components.push({elem: $(element),top:$(element).position().top,level:level});
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
