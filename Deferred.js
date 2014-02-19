define([
  "./promise"
], function (promise) {
  "use strict";

  return function (deferred) {
    // summary:
    //    Bridge the gap between jQuery promise structure and Dojo promise structure
    //    by normalizing the signature of the Deferred object.
    //    This is not all-inclusive, but will bridge the gap enough for TPS to use
    //    a consistent promise structure.
    // returns:
    //    Deferred
    var $ = typeof jQuery === "undefined" ? function () {
        return { Deferred: function () {} };
      } : jQuery,
      dfd = deferred || $.Deferred(),
      wrapper = promise(dfd);

    return {
      promise: wrapper,
      resolve: wrapper.resolve,
      reject: wrapper.reject,
      isResolved: dfd.isResolved,
      isRejected: dfd.isRejected,
      isFulfilled: dfd.isFulfilled,
      isCanceled: dfd.isCanceled,
      progress: wrapper.progress,
      then: wrapper.then
    };
  };
});