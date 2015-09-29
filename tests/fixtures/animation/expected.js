angular.module('foo', [])
  .animation('.repeated-item', ['data', function(data) {
    return {
      enter : function(element, done) {
        element.css('opacity',0);
        jQuery(element).animate({
          opacity: 1
        }, done);
      }
    }
  }]);
