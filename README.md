tuparse-shakur
==============

JSON parsing/serializing tool used to create DOM elements and CSS rules.

### Dependencies

* [requirejs](https://github.com/jrburke/requirejs)
* [put-selector](https://github.com/kriszyp/put-selector)

### Modules
#### parser
##### Methods
###### `parse(/*TPS.structure*/structure, /*Object?*/options)`
Takes a TuparseShakur.structure object and optional options object, and parses it into its proper DOM nodes and CSS text.  options object is passed to the parsers.  Returns an object.  returnObject.dom will contain the DOM nodes.  returnObject.css will contain the CSS text.

#### dom
##### Methods
###### `parse(/*TPS.dom*/structure, /*Object?*/options)`
Takes a TuparseShakur.dom object and optional options object, and parses it into its proper DOM nodes.  Returns root dom node.
###### `serializeDom(/*Node?*/rootNode)`
Takes an optional root node.  Serializes the root node and its children into a TPS.dom object.  Returns TPS.dom.

#### css
##### Methods
###### `parse(/*TPS.css*/structure, /*Object?*/options)`
Takes a TuparseShakur.css object and optional options object, and parses it into its proper CSS text.  Returns CSS text.
###### `addStyles(/*String*/text, /*String?*/id)`
Convenience method for adding a style node to the document.head containing the provided CSS.  If the id parameter is passed, the id of the style node will be set to that value.

#### event
##### Methods
###### `handler(/*Node*/node, /*String*/type, /*String?*/selector, /*Function*/handle)`
Used for default event handling with the dom module.

### Example TPS.structure (run test for example output)
```
  {
    dom: {
      ".modal-container": {
        role: "dialog",
        "div.header": {
          "h3.title": {
            text: "Header"
          },
          "button.close.pull-right": {
            text: "x",
            type: "button"
          }
        },
        "div.body": {
          "form": {
            "h4.title": {
              text: "Please Enter Some Information"
            },
            "div.form-group.hr-item-0": {
              label: {
                "for": "name",
                text: "Name"
              },
              "input.form-control": {
                id: "name",
                name: "name",
                type: "text"
              }
            },
            "div.form-group.hr-item-1": {
              label: {
                "for": "email",
                text: "Email"
              },
              "div.input-group": {
                "span.input-group-addon": {
                  text: "@"
                },
                "input.form-control": {
                  id: "email",
                  name: "email",
                  type: "text"
                }
              }
            }
          }
        },
        "div.footer": {
          "div.form-group.pull-right": {
            events: {
              "click": {
                selector: "button",
                mid: "tuparse-shakur/tests/handles",
                method: "delegated"
              }
            },
            "button.btn.btn-success": {
              text: "OK",
              type: "button",
              events: {
                "click": {
                  mid: "tuparse-shakur/tests/handles",
                  method: "success"
                },
                "click-1": {
                  mid: "tuparse-shakur/tests/handles",
                  method: "success2"
                }
              }
            },
            "button.btn.btn-default": {
              text: "Cancel",
              type: "button"
            }
          }
        }
      }
    },
    css: {
      variables: {
        "@black": "#333",
        "@gray": "#888"
      },
      styles: {
        ".modal-container": {
          width: "1170px",
          margin: "0px auto",
          "margin-top": "20px",
          border: "1px solid @black",
          padding: "10px",
          ".header": {
            ".title": {
              margin: 0,
              padding: 0,
              display: "inline-block"
            },
            "border-bottom": "1px solid @black"
          },
          ".body": {
            ".form-group": {
              label: {
                color: "@gray"
              }
            }
          },
          ".footer": {
            overflow: "auto",
            "padding-top": "10px",
            "border-top": "1px solid @black",
            ".form-group": {
              margin: 0,
              padding: 0,
              ".btn": {
                margin: "5px",
                width: "100px",
                "&.btn-default": {
                  ":hover": {
                    "background-color": "#E74C3C"
                  }
                }
              }
            }
          }
        },
        ".title": {
          "font-family": "'Comic Sans MS', cursive, sans-serif"
        }
      }
    }
  }
```
