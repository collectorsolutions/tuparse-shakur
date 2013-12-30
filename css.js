define([
  "./vars"
], function (vars) {
  "use strict";

  return {
    addStyles: function (/*String*/text, /*String?*/id) {
      // summary:
      //    Creates a style element and adds it to the document head.
      // text: String
      // id: [optional] String
      //    Id to be used on the style node.
      var styles = document.createElement("style");

      if (id) {
        styles.setAttribute("id", id);
      }

      styles.innerHTML = text;

      document.head.appendChild(styles);
    },
    parse: function (/*TPS.css*/structure, /*Object?*/opts) {
      // summary:
      //    Parse a css structure into CSS text.
      // structure: TuparseShakur.css
      // options: [optional] Object
      // returns:
      //    CSS text
      var variables = structure.variables,
        styles = structure.styles,
        tags = vars.tags,
        selectorParse = /(\&)?(\>\s*\w+([\w\d]+)?)?(\:\w+([\w\d]+)?)?(\.\w+([\w\d]+)?((\-[\w\d]+)+)?)?(\[([^\]=]+)=?['"]?([^\]'"]*)['"]?\])?/g,
        text = "",
        options = opts || {},
        createSelector, parse, selectors, i, total;

      createSelector = function (/*String*/selector) {
        // summary:
        //    Creates a selector container class instance.
        //    This allows delayed adding of rules and children to the
        //    selector prior to needing to perform the final build.
        // returns:
        //    CSS text.
        var rules = [],
          children = [],
          parent = null;

        return {
          build: function () {
            // summary:
            //    Builds selector into corresponding css text.
            // returns:
            //    CSS text.
            var text = "",
              i, total;

            if (rules.length) {
              text += this.getQualifiedSelector() + "{" + rules.join("") + "}\n";
            }

            for (i = 0, total = children.length; i < total; i++) {
              text += children[i].build();
            }

            return text;
          },
          addRule: function (/*String*/property, /*String*/value) {
            // summary:
            //    Add a rule to the selector.
            // property: String
            // value: String
            rules.push(property + ":" + (typeof value === "string" ? value.replace(/\@[^\s]+/g, function (match) {
              var value = variables[match];

              return value || match;
            }) : value) + ";");
          },
          addChild: function (/*Selector*/child) {
            // summary:
            //    Add a child to the selector.
            // child: Selector
            child.addParent(this);
            children.push(child);
          },
          addParent: function (/*Selector*/parentSelector) {
            // summary:
            //    Add a parent to the selector.
            parent = parentSelector;
          },
          getQualifiedSelector: function () {
            // summary:
            //    Get the Selector's full selector.  Includes all parent selectors.
            // returns:
            //    Fully qualified selector.
            var prefix = selector.substring(0, 1),
              qualifiedSelector;

            if (prefix === ":") {
              qualifiedSelector = parent ? parent.getQualifiedSelector() + selector : selector;
            } else if (prefix === "&") {
              qualifiedSelector = parent ? parent.getQualifiedSelector() + selector.substring(1, selector.length) : modifiedSelector;
            } else {
              qualifiedSelector = parent ? parent.getQualifiedSelector() + " " + selector : selector;
            }

            return qualifiedSelector;
          }
        };
      };

      parse = function (/*TPS.selector*/structure, /*Selector*/parentSelector) {
        // summary:
        //    Parse a Selector and its rules/children.
        // structure: TPS.selector
        // parentSelector: Selector
        // returns:
        //    Selector[]
        var selectors = [],
          tag, selector, property;

        for (property in structure) {
          if (structure.hasOwnProperty(property)) {
            tag = property.replace(selectorParse, "");

            if (tag !== "" && !tags[tag]) {
              parentSelector.addRule(property, structure[property]);
            } else {
              selector = createSelector(property);
              selectors.push(selector);
              if (parentSelector) {
                parentSelector.addChild(selector);
              }

              parse(structure[property], selector);
            }
          }
        }

        return selectors;
      };

      selectors = parse(styles);
      for (i = 0, total = selectors.length; i < total; i++) {
        text += selectors[i].build();
      }

      if (options.addStyles) {
        this.addStyles(text, options.id);
      }

      return text;
    }
  };
});