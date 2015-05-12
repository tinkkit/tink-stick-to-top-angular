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
    calculateValues();
  },250);

  function getScrollTop() {
    var prop = 'pageYOffset',
      method = 'scrollTop';
    return $window ? (prop in $window) ? $window[ prop ] :
      $window.document.documentElement[ method ] :
      $window.document.body[ method ];
  }



  var components=[];
  var stickyList=[];
  var currentSticky={dummy:null,original:null};

  function updateOld(){
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
      if(next && scrollTop >= value.top && scrollTop < value.stop){

        var nextElement = $(components[key+1].elem);
        if((nextElement.position().top - scrollTop) <= element.outerHeight(true)+padding){
          var verschil = (nextElement.position().top-padding-scrollTop);
          // console.log(element.outerHeight(true)); 40
          var secondTop = (padding+verschil); // top van rode blok
          var firstTop = (padding+verschil-element.outerHeight(true)); // top van gele blok
          // console.log(verschil+element.outerHeight(true));
          setSticky(value,firstTop); 
          element.css('top',(firstTop)+'px');
        }else{
          setSticky(value,padding);
          element.css('top',padding+'px');  
        }
        //
      }else if(!next && scrollTop >= value.top){
        setSticky(value,padding);  
      }
    });

  }

  function update(){
     var scrollTop = getScrollTop();console.log(scrollTop)
     var lengthC = components.length;
    components.forEach(function(value,key){
      if(value.extra){
        scrollTop += value.extra;
      }
       //We have a next element.
      var next = key+1 < lengthC;
      var prev = key-1 > -1;
      var element = $(value.elem);

      //If not in viewport, next element.
      if(scrollTop > value.top+element.outerHeight(true) && scrollTop>value.stop){
        removeSticky(value);
        return;
      }

     

      //If we have a next element and the next element is on the SAME level.
      //if(next){

        /*
          Hier moeten we enkel de hoogte van het huidige element weten als we het sticky zetten en die hoogte in het dummy element steken.
          Die extra hoogte is ook belangrijk in combinatie met de positie van het volgende element (van hetzelfde level).
        */
        if(prev && components[key-1].level === value.level){
          scrollTop+=$(components[key-1].elem).outerHeight(true)-components[key-1].extra;
       //console.log('prev',$(value.elem).get(0).style.background)
        }

        if(next && components[key+1].level === value.level){
          //console.log('next',$(value.elem).get(0).style.background)
          //value.stop -=6;
        }
        /*
          Hier moeten we ook de hoogte weten van de elementen van een hoger level die reeds sticky staan (kunnen meerdere levels zijn).
          Voor de rest hebben die dezelfde behaviour als het eerste level
        */
       // console.log(scrollTop,value.top,value.stop,value.elem,scrollTop >= value.top && scrollTop < value.stop)
       //console.log('top:'+value.top,'extra:'+value.extra,'stop:'+value.stop,'scroll:'+scrollTop,$(value.elem).get(0).style.background,scrollTop >= value.top && scrollTop < value.stop)
        if(scrollTop >= value.top && scrollTop < value.stop){

          addSticky(value,(prev && components[key-1].level === value.level)|| (next && components[key+1].level > value.level));
        }else{
          removeSticky(value);
        }

      //Set the element sticky if it reached the top
     // } else {
        //last element
     // }
    });
  }

  function addSticky(obj,bool){
    if(obj && obj.elem){
      var elem = $(obj.elem);
      if(isSticky(obj)===-1){
        var topHeight = padding;
        if(obj.extra){
          topHeight+= obj.extra;
        }
        obj.dummy = createDummy(elem);
        if(!bool){
          elem.after(obj.dummy);
        }        
        makeSticky(elem,topHeight);
        stickyList.push(obj);
      }
    }
  }

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

  function createDummy(elem){
    elem = $(elem);
    return $( '<div>' ).height(elem.outerHeight(true));
  }

  function makeSticky(elem,top){
    elem = $(elem);
    elem.addClass('sticky');
    elem.css('top',top+'px');
  }

  function setSticky(obj,margin){
    if((currentSticky.dummy && $(currentSticky.original.elem).get(0) !== $(obj.elem).get(0)) || !currentSticky.dummy){
      removeSticky();
      var element = $(obj.elem);
      currentSticky.dummy = $( '<div>' ).height(element.outerHeight(true));
      element.after(currentSticky.dummy);
      element.addClass('sticky');
      element.css('top',margin+'px');
      currentSticky.original = obj;
    }    
  }

  /*function removeSticky(){
    if(currentSticky.dummy){
      currentSticky.dummy.remove();
      $(currentSticky.original.elem).removeClass('sticky');
      currentSticky = {};
    }
  }*/

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
            }
    });
  }

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
