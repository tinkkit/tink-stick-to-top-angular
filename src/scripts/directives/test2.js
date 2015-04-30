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
    console.log('sticky')
      	sticky($(element));
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
