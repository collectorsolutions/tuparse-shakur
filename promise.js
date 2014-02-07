define(function () {
  "use strict";

  return function (/*Deferred*/dfd) {
    // summary:
    //    Bridges the gap between jQuery.Deferred and dojo/promise/Promise by
    //    normalizing the jQuery Deferred object signature to match
    //    the dojo/promise/Promise signature.
    return {
      then: function (/*Function*/success, /*Function?*/error, /*Function?*/progress) {
        // summary:
        //    Attaches functions to done, fail, and notify callbacks of jQuery.Deferred.
        // success: Function
        // error: [optional] Function
        // progress: [optional] Function
        // returns:
        //    Deferred.promise
        if (dfd) {
          (dfd.done || dfd.then)(success, error, progress);
        }

        return this;
      },
      otherwise: function (/*Function*/fn) {
        // summary:
        //    Attaches a function to the fail callback of jQuery.Deferred.
        // fn: Function
        // returns:
        //    Deferred.promise
        if (dfd) {
          dfd.fail(fn);
        }

        return this;
      },
      always: function (/*Function*/fn) {
        // summary:
        //    Attaches a function to the always callback of jQuery.Deferred.
        // returns:
        //    Deferred.promise
        if (dfd) {
          dfd.always(fn);
        }

        return this;
      },
      cancel: function () {
        // summary:
        //    Maps to the reject callback of jQuery.Deferred.
        // returns:
        //    Deferred.promise
        if (dfd) {
          dfd.reject.apply(dfd, arguments);
        }

        return this;
      },
      resolve: function () {
        // summary:
        //    Maps to the resolve callback of jQuery.Deferred.
        // returns:
        //    Deferred.promise
        if (dfd) {
          dfd.resolve.apply(dfd, arguments);
        }
      },
      isResolved: function () {
        return dfd.isResolved();
      }
    };
  };
});