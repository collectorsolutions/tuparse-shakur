define(function () {
  "use strict";

  return {
    handler: function (/*Node*/node, /*String*/type, /*String?*/selector, /*Function*/handle) {
      // summary:
      //    Uses jQuery for event handling.
      // node: Node
      // type: String
      // selector: [optional] String
      //    Selector to be used for event delegation.
      // handle: Function
      // returns:
      //    jQuery(node) or null if jQuery is `undefined`
      var $ = typeof jQuery === "undefined" ? function () {} : jQuery,
        args = handle ? [type, selector, handle] : [type, selector],
        element = $(node);

      return $ ? element.on.apply(element, args) : null;
    }
  };
});