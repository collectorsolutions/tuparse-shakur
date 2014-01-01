define({
  dom: {
    ".modal-container": {
      role: "dialog",
      "div.header": {
        "h3.title": {
          _text: "Header"
        },
        "button.close.pull-right": {
          _text: "x",
          type: "button"
        }
      },
      "div.body": {
        "form": {
          "h4.title": {
            _text: "Please Enter Some Information"
          },
          "div.form-group.tps-item-0": {
            label: {
              "for": "name",
              _text: "Name"
            },
            "input.form-control": {
              id: "name",
              name: "name",
              type: "_text"
            }
          },
          "div.form-group.tps-item-1": {
            label: {
              "for": "email",
              _text: "Email"
            },
            "div.input-group": {
              "span.input-group-addon": {
                _text: "@"
              },
              "input.form-control": {
                id: "email",
                name: "email",
                type: "_text"
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
            _text: "OK",
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
            _text: "Cancel",
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
      ".tuparse-test-container": {
        ".modal-container": {
          width: "100%",
          margin: "0px auto",
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
});