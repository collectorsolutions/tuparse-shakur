define([
  "./promise"
], function (promise) {
  "use strict";

  return function (/*Deferred.promise[]*/promises) {
    // summary:
    //    Normalizes jQuery.when to match dojo/when.
    // promises: Deferred.promise[]
    // returns:
    //    Deferred.promise
    var $ = jQuery === undefined ? function () {} : jQuery,
      when = $.when || function () { return null; };

    return promise(when(promises));
  };
});