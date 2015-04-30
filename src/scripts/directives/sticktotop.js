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
      fixedCont.addEl(element);
      var padding =0,
      $el = $( element );
      $timeout(function(){
        padding = parseInt($('body').css('padding-top'));
        $el.css('top',padding);
        update();
      },250);
      var originalPlace = null;

      var prev =0;

      function getScrollTop() {
        var prop = 'pageYOffset',
          method = 'scrollTop';
        return $window ? (prop in $window) ? $window[ prop ] :
          $window.document.documentElement[ method ] :
          $window.document.body[ method ];
      }
var valpr;
      function update(){
        var wTop  = getScrollTop() + padding;
        if((wTop > $el.position().top) || (originalPlace && wTop > originalPlace.position().top)){
          if( originalPlace === null) {
            originalPlace = $( '<div>' ).height( $el.outerHeight(true));
            $el.after(originalPlace );
          }
          
          $el.css('position','fixed');
          fixedCont.setel($el);valpr =wTop;prev=0;
        }
        if(originalPlace){
         // console.log( originalPlace.position().top,(wTop + $el.height()),wTop)
        }
        if($el.css('position') !== 'fixed' && fixedCont.getPos() > 0 &&   ($el.position().top-wTop) <= fixedCont.getPos()){
          var el = fixedCont.getel();
          var top = parseInt(el.css('top'));
          el.css('top',(top-(fixedCont.getPos()-($el.position().top-wTop))))
          prev = 1;valpr =wTop;
        }else if(originalPlace && wTop <= originalPlace.position().top){
            originalPlace.remove();
            originalPlace= null;
            fixedCont.setel(null);valpr =wTop;
           $el.css('position','static');   prev = 1;
        }else if(prev){
          var elo = fixedCont.getPrev($el)
          
          var nu  = wTop;
          console.log(nu,valpr);
         
          if(elo){
            elo = $(fixedCont.getPrev($el));
            var top = parseInt(elo.css('top'));
            var change = top+ (valpr-nu);
            if(change < padding){
              elo.css('top',change);
            }else{
              elo.css('top',padding);
              prev = 0;
            }         
   
          }
           valpr = nu;
        }
      }

      angular.element($window).bind("scroll.sticky", function() {
        update();
        scope.$apply();
      });
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
    console.log(count);
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
