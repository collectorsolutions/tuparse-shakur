define([
  "put-selector/put",
  "./vars",
  "./event",
  "./Deferred",
  "./all",
  "require"
], function (put, vars, event, Deferred, all, require) {
  "use strict";

  var createSelector, appendNodes;

  createSelector = function (/*Node*/node, /*Node*/replacement) {
    // summary:
    //    Creates a CSS selector for the provided node.
    // node: Node
    // replacement: Node
    //    Node whose tag name will replace the original node's tag name.
    // returns:
    //    String
    var classes = node.className.split(/\s/g).join(".");

    return (replacement || node).tagName.toLowerCase() + (classes.length ? "." + classes : "");
  };

  appendNodes = function (/*Node[]*/nodes, /*Node*/parentNode) {
    // summary:
    //    Convenience method for appending all nodes to a parent node.
    // nodes: Node[]
    // parentNode: Node
    var i = 0,
      node;

    while (node = nodes[i++]) {
      parentNode.appendChild(node);
    }
  };

  return {
    appendNodes: appendNodes,
    serializeDom: function (/*Node?*/rootNode) {
      // summary:
      //    Turns the DOM into a TuparseShakur DOM structure, starting
      //    at the rootNode provided, or if no rootNode is provided,
      //    starting at the document body.
      // rootNode: [optional] Node
      // returns:
      //    TPS.dom
      var root = rootNode || document.body,
        invalidNodes = {
          "class": true,
          style: true,
          script: true,
          "data-tps-event-map": true
        },
        deduper = 0,
        structure = {},
        selectors = {},
        serialize, parseEvents, forEachChild, parseAttributes, parseNode;

      parseEvents = function (/*Node*/node, /*Object*/part) {
        // summary:
        //    Parses event data off of node and adds it to the node part.
        // node: Node
        // part: Object
        var map = node.getAttribute("data-tps-event-map"),
          i, total, event, events, type, selector;

        if (map) {
          if (!part.events) {
            part.events = events = {};
          }

          map = map.split(",");

          for (i = 0, total = map.length; i < total; i++) {
            type = node.getAttribute("data-tps-event-type-" + map[i]);
            event = {};
            event.mid = node.getAttribute("data-tps-event-mid-" + map[i]);
            event.method = node.getAttribute("data-tps-event-method-" + map[i]);
            selector = node.getAttribute("data-tps-event-selector-" + map[i]);

            if (selector) {
              event.selector = selector;
            }

            if (events[type]) {
              events[type + "-" + deduper++] = event;
            } else {
              events[type] = event;
            }
          }
        }
      };

      forEachChild = function (/*Node*/node, /*Function*/fn) {
        // summary:
        //    For every child node of a node, execute a function.
        // node: Node
        // fn: Function
        var i, childNodes, child;

        i = 0;
        childNodes = node.childNodes;
        while(child = childNodes[i++]) {
          fn(child);
        }
      };

      parseAttributes = function (/*Node*/node, /*Object*/part) {
        // summary:
        //    Parses a node's attributes and adds the attributes to the node's part.
        // node: Node
        // part: Object
        var i, attributes, attribute;

        i = 0;
        attributes = node.attributes;
        while (attribute = attributes[i++]) {
          serialize(attribute, part);
        }
      };

      parseNode = function (/*Node*/node, /*Object*/part, /*Object*/parentPart) {
        // summary:
        //    Parses a node, adding its selector and part to the parentPart.
        // node: Node
        // part: Object
        // parentPart: Object
        // returns:
        //    false if the parse fails.
        //    true if the parse is successful.
        var tagName = node.tagName.toLowerCase(),
          selector = createSelector(node, tagName === "body" ? put("div") : null);

        if (invalidNodes[tagName]) {
          return false;
        }

        // If the selector is already taken, we dedupe it to ensure
        // that each item will properly show up on the parent.
        if (parentPart[selector] || selectors[selector]) {
          parentPart[selector + ".tps-item-" + deduper++] = parentPart[selector];
          delete parentPart[selector];
          selectors[selector] = true;
          parentPart[selector + ".tps-item-" + deduper++] = part;
        } else {
          parentPart[selector] = part;
        }

        return true;
      };

      serialize = function (/*Node*/node, /*Object*/parentPart) {
        // summary:
        //    Serializes a node and appends the appropriate metadata
        //    onto its parent part.
        // node: Node
        // parentPart: Object
        var part = {},
          attribute;

        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
          if (!parseNode(node, part, parentPart)) {
            return;
          }

          forEachChild(node, function (child) {
            serialize(child, part);
          });

          parseAttributes(node, part);
          parseEvents(node, part);
        } else if (node.nodeType === 2 /* Node.ATTRIBUTE_NODE */) {
          attribute = node.nodeName;

          if (!invalidNodes[attribute] && !/data\-tps\-event/.test(attribute)) {
            parentPart[attribute] = node.nodeValue;
          }
        } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
          parentPart.text = node.nodeValue;
        }
      };

      forEachChild(root, function (child) {
        serialize(child, structure);
      });

      return structure;
    },
    parse: function (/*TPS.dom*/structure, /*Function?*/opts) {
      // summary:
      //    Parse a dom structure into its corresponding nodes.
      // structure: TuparseShakur.dom
      // parentNode: Node
      // options: [optional] Object
      // returns:
      //    Root node containing structure as child.
      var tags = vars.tags,
        tagSelector = /(\.\w+\d*((\-[\w\d]+)+)?)?(\[([^\]=]+)=?['"]?([^\]'"]*)['"]?\])?/g,
        cleanEvent = /\-[\w\d\-]*/g,
        deduper = 0,
        options = opts || {},
        eventHandler = options.handler,
        handler = eventHandler && typeof eventHandler === "function" ? eventHandler : event.handler,
        nodes = [],
        allPromises = options.all || all,
        providedDeferred = typeof options.Deferred !== "undefined",
        createDeferred = function () {
          return new Deferred(providedDeferred ? options.Deferred() : null);
        },
        dfd = createDeferred(),
        promises = [],
        createNode, appendIfNode, isNode, appendWhenDone,
        childNode, node, parse, rootNode, attachEvents;

      attachEvents = function (/*Node*/node, /*Object*/events) {
        // summary:
        //    Attaches events to a node.
        // node: Node
        // events: Object
        var eventMap = [],
          promises = [],
          attachDfd = createDeferred(),
          type, updateEventMap, requireAndAttach,
          createFactory;

        updateEventMap = function () {
          node.setAttribute("data-tps-event-map", eventMap.join(","));
        };

        createFactory = function (/*Object*/event, /*String*/type, /*Deferred.promise*/promise) {
          // summary:
          //    Creates the factory for require.
          // event: Object
          //    Object containing event data.
          // type: String
          // promise: Deferred.promise
          // returns:
          //    Factory function.
          return function (/*Object*/module) {
            // summary:
            //    Factory function, which will take a module, and use it for
            //    the event listener.
            // module: Object
            var selector = event.selector,
              mid = event.mid,
              method = event.method,
              guid = deduper++,
              eventType;

            eventMap.push(guid);

            eventType = type.replace(cleanEvent, "");

            node.setAttribute("data-tps-event-type-" + guid, eventType);
            node.setAttribute("data-tps-event-mid-" + guid, mid);
            node.setAttribute("data-tps-event-method-" + guid, method);

            // A selector will be present if the user wishes to use event delegation.
            // Replace any characters that isn't a-z to allow the user to create multiple events of the same time
            // with unique identifiers, e.g. click-1, click-2
            if (selector) {
              node.setAttribute("data-tps-event-selector-" + guid, selector);
            }

            if (eventType !== "_created") {
              handler(node, eventType, selector, function (e) {
                module[method].call(this, e);
              });
            } else {
              module[method](node);
            }

            updateEventMap();
            promise.resolve();
          };
        };

        requireAndAttach = function (/*Object*/event) {
          // summary:
          //    Require a module and attach the event.
          // event: Object
          var mid = event.mid,
            dfd = createDeferred(),
            promise = dfd.promise;

          require([mid], createFactory(event, type, promise));

          return promise;
        };

        for (type in events) {
          if (events.hasOwnProperty(type)) {
            promises.push(requireAndAttach(events[type]));
          }
        }

        allPromises(promises).then(function () {
          attachDfd.promise.resolve();
        });

        return attachDfd.promise;
      };

      createNode = function (/*String*/selector) {
        // summary:
        //    Creates a node based on a selector if it is a valid CSS3
        //    node selector.
        // selector: String
        // returns:
        //    Node if the selector is a valid CSS3 node selector.
        //    Parsed selector if it is not.
        var tag = selector.replace(tagSelector, ""),
          invalidTags = {
            title: true
          },
          creationSelector;

        if (tag === "") {
          creationSelector = "div" + selector;
          tag = "div";
        } else {
          creationSelector = selector;
        }

        if (tags[tag] && !invalidTags[tag]) {
          return put(creationSelector);
        }

        return tag;
      };

      isNode = function (/*Object*/object) {
        // summary:
        //    Determines if an object is a node.
        // object: Object
        // returns:
        //    true if the object is a node.
        //    false if the object is not a node.
        return typeof Node === "object" ? object instanceof Node : object && typeof object.nodeType === "number" && typeof object.nodeName === "string";
      };

      appendIfNode = function (/*Object*/node, /*Node*/parentNode) {
        // summary:
        //    Appends an object to a parent node if it is a node.
        // node: Object
        // parentNode: node
        // returns:
        //    true if it is a node.
        //    false if it is not a node.
        if (isNode(node)) {
          parentNode.appendChild(node);
          return true;
        }

        return false;
      };

      parse = function (/*TPS.node*/structure, /*Node*/parentNode) {
        // summary:
        //    Parse a node and its children.
        // structure: TuparseShakur.node
        // node: Node
        // returns:
        //    Deferred.promise
        var parseDfd = createDeferred(),
          promises = [],
          selector, childNode;

        for (selector in structure) {
          if (structure.hasOwnProperty(selector)) {
            childNode = createNode(selector);

            if (!appendIfNode(childNode, parentNode)) {
              if (childNode === "events") {
                promises.push(attachEvents(parentNode, structure[selector]));
              } else {
                if (selector === "_text") {
                  parentNode.appendChild(document.createTextNode(structure[selector]));
                } else {
                  parentNode.setAttribute(selector, structure[selector]);
                }
              }
            } else {
              parse(structure[selector], childNode);
            }
          }
        }

        if (promises.length) {
          allPromises(promises).then(function () {
            parseDfd.promise.resolve();
          });
        } else {
          parseDfd.promise.resolve();
        }

        return parseDfd.promise;
      };

      for (node in structure) {
        if (structure.hasOwnProperty(node)) {
          rootNode = document.createDocumentFragment();
          childNode = createNode(node);
          appendIfNode(childNode, rootNode);
          promises.push(parse(structure[node], childNode));
          nodes.push(rootNode);
        }
      }

      allPromises(promises).then(function () {
        dfd.promise.resolve(nodes);
      });

      appendWhenDone = function (/*Node*/parentNode) {
        // summary:
        //    Append the nodes to a parent node when the parsing has been completed.
        // parentNode: Node
        dfd.promise.then(function (nodes) {
          appendNodes(nodes, parentNode || document.body);
        });
      };

      if (options.appendWhenDone) {
        appendWhenDone(options.parentNode || document.body);
      }

      return {
        then: dfd.promise.then,
        appendAll: function (/*Node*/parentNode) {
          // summary:
          //    Append all the nodes to a parent node.
          // parentNode: Node
          appendWhenDone(parentNode);
        }
      };
    }
  };
});