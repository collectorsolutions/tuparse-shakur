define([
  "./promise"
], function (promise) {
  "use strict";

  return function () {
    // summary:
    //    Bridge the gap between jQuery promise structure and Dojo promise structure
    //    by normalizing the signature of the Deferred object.
    //    This is not all-inclusive, but will bridge the gap enough for TPS to use
    //    a consistent promise structure.
    // returns:
    //    Deferred
    var $ = jQuery === undefined ? function () {} : jQuery,
      dfd = $.Deferred && $.Deferred() || null;

    return {
      promise: promise(dfd)
    };
  };
});