define([
  "./vars"
], function (vars) {
  "use strict";

  var addStyles = function (/*String*/text, /*String|Node?*/id) {
    // summary:
    //    Creates a style element and adds it to the document head.
    // text: String
    // id: [optional] String|Node
    //    Id to be used on the style node or the node to which the styles should be added.
    var styles = document.createElement("style"),
      existingStyles;

    if (id) {
      if (typeof id === "string") {
        existingStyles = document.getElementById(id);

        if (existingStyles) {
          document.head.removeChild(existingStyles);
        }

        styles.setAttribute("id", id);
      } else {
        styles = id;
        document.head.removeChild(styles);
        styles.innerHTML = "";
      }
    }

    styles.innerHTML = text;

    document.head.appendChild(styles);
  };

  return {
    addStyles: addStyles,
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
            rules.push(property.replace("_", "-") + ":" + (typeof value === "string" ? value.replace(/\@[^\s]+/g, function (match) {
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
              modifiedSelector, qualifiedSelector;

            if (prefix === ":") {
              qualifiedSelector = parent ? parent.getQualifiedSelector() + selector : selector;
            } else if (prefix === "&") {
              modifiedSelector = selector.substring(1, selector.length);
              qualifiedSelector = parent ? parent.getQualifiedSelector() + modifiedSelector : modifiedSelector;
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

      if (options.appendWhenDone) {
        addStyles(text, options.stylesId || options.stylesNode);
      }

      return text;
    }
  };
});