define([
  "put-selector/put",
  "./vars",
  "./event",
  "require"
], function (put, vars, event, require) {
  "use strict";

  var createSelector = function (/*Node*/node, /*Node*/replacement) {
    // summary:
    //    Creates a CSS selector for the provided node.
    // node: Node
    // replacement: Node
    //    Node whose tag name will replace the original node's tag name.
    // returns:
    //    String
    var classes = node.className.split(/\s/g).join(".");

    return (replacement ? replacement : node).tagName.toLowerCase() + (classes.length ? "." + classes : "");
  };

  return {
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
          "data-hr-event-map": true
        },
        deduper = 0,
        serialize, parseEvents, structure;

      parseEvents = function (/*Node*/node, /*Object*/part) {
        // summary:
        //    Parses event data off of node and adds it to the node part.
        // node: Node
        // part: Object
        var map = node.getAttribute("data-hr-event-map"),
          i, total, event, events, type, selector;

        if (map) {
          if (!part.events) {
            part.events = events = {};
          }

          map = map.split(",");

          for (i = 0, total = map.length; i < total; i++) {
            type = node.getAttribute("data-hr-event-type-" + map[i]);
            event = {};
            event.mid = node.getAttribute("data-hr-event-mid-" + map[i]);
            event.method = node.getAttribute("data-hr-event-method-" + map[i]);
            selector = node.getAttribute("data-hr-event-selector-" + map[i]);

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

      serialize = function (/*Node*/node, /*Object*/parentPart) {
        // summary:
        //    Serializes a node and appends the appropriate metadata
        //    onto its parent part.
        // node: Node
        // parentPart: Object
        var part = {},
          selectors = {},
          tagName, i, child, selector, attribute;

        if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
          tagName = node.tagName.toLowerCase();

          if (invalidNodes[tagName]) {
            return;
          }

          selector = createSelector(node, tagName === "body" ? put("div") : null);

          if (parentPart) {
            // If the selector is already taken, we dedupe it to ensure
            // that each item will properly show up on the parent.
            if (parentPart[selector] || selectors[selector]) {
              parentPart[selector + ".hr-item-" + deduper++] = parentPart[selector];
              delete parentPart[selector];
              selectors[selector] = true;
              parentPart[selector + ".hr-item-" + deduper++] = part;
            } else {
              parentPart[selector] = part;
            }
          } else {
            structure = part;
          }

          for (i = 0; (child = node.attributes[i]); ++i) {
            serialize(child, part);
          }

          for (i = 0; (child = node.childNodes[i]); ++i) {
            serialize(child, part);
          }

          parseEvents(node, part);
        } else if (node.nodeType === 2 /* Node.ATTRIBUTE_NODE */) {
          attribute = node.nodeName;

          if (!invalidNodes[attribute] && !/data\-hr\-event/.test(attribute)) {
            parentPart[attribute] = node.nodeValue;
          }
        } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
          parentPart.text = node.nodeValue;
        }
      };

      serialize(root);

      return {
        root: structure
      };
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
        root = structure.root,
        deduper = 0,
        parent = put("div"),
        options = opts || {},
        eventHandler = options.handler,
        handler = eventHandler && typeof eventHandler === "function" ? eventHandler : event.handler,
        parse, rootNode, attachEvents;

      attachEvents = function (/*Node*/node, /*Object*/events) {
        // summary:
        //    Attaches events to a node.
        // node: Node
        // events: Object
        var eventMap = [],
          number = 0,
          done = 0,
          type, event, mid, module, eventType, createFactory;

        createFactory = function (/*Object*/event, /*Number*/number) {
          // summary:
          //    Creates the factory for require.
          // event: Object
          //    Object containing event data.
          // number: Number
          //    Number used to determine which factory number
          //    this is to compare to the number that have been processed.
          return function (module) {
            var selector = event.selector,
              method = event.method,
              guid = deduper++,
              args, handle;

            eventMap.push(guid);

            handle = function (e) {
              module[method].call(this, e);
            };

            eventType = type.replace(cleanEvent, "");

            node.setAttribute("data-hr-event-type-" + guid, eventType);
            node.setAttribute("data-hr-event-mid-" + guid, mid);
            node.setAttribute("data-hr-event-method-" + guid, method);

            // A selector will be present if the user wishes to use event delegation.
            // Replace any characters that isn't a-z to allow the user to create multiple events of the same time
            // with unique identifiers, e.g. click-1, click-2
            if (selector) {
              node.setAttribute("data-hr-event-selector-" + guid, selector);
            }

            handler(node, eventType, selector, handle);
            done++;

            // Since require is done asynchronously, we need to keep track of number of events found
            // and the number of events processed.  When those numbers match, we're done parsing events.
            if (done === number) {
              node.setAttribute("data-hr-event-map", eventMap.join(","));
            }
          };
        };

        for (type in events) {
          if (events.hasOwnProperty(type)) {
            event = events[type];
            mid = event.mid;

            require([mid], createFactory(event, ++number));
          }
        }
      };

      parse = function (/*TPS.node*/structure, /*Node*/parentNode, /*Boolean?*/isRoot) {
        // summary:
        //    Parse a node and its children.
        // structure: TuparseShakur.node
        // node: Node
        // isRoot: [optional] Boolean
        var invalidTags = {
            title: true
          },
          selector, tag, childNode, creationSelector;

        for (selector in structure) {
          if (structure.hasOwnProperty(selector)) {
            tag = selector.replace(tagSelector, "");

            if (tag === "") {
              creationSelector = "div" + selector;
              tag = "div";
            } else {
              creationSelector = selector;
            }

            if (tags[tag] && !invalidTags[tag]) {
              childNode = put(creationSelector);
              parentNode.appendChild(childNode);
              parse(structure[selector], childNode);
            } else if (tag === "events") {
              attachEvents(parentNode, structure[selector]);
            } else if (!isRoot) {
              if (selector === "text") {
                parentNode.appendChild(document.createTextNode(structure[selector]));
              } else {
                parentNode.setAttribute(selector, structure[selector]);
              }
            }
          }
        }
      };

      rootNode = document.createDocumentFragment();
      parse(root, rootNode, true);
      parent.appendChild(rootNode);

      return parent;
    }
  };
});