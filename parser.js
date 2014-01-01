define([
  "./dom",
  "./css"
], function (dom, css){
  return {
    parse: function (/*TPS.structure*/structure, /*Object?*/opts) {
      // summary:
      //    Parses a TuparseShakur structure into its dom and css representations.
      // structure: TuparseShakur.structure
      // opts: [optional] Object
      // returns:
      //    Object containing parsed css and dom if they were provided.
      var values = {},
        options = opts || {};

      if (structure.dom) {
        values.dom = dom.parse(structure.dom, options.dom);
      }

      if (structure.css) {
        values.css = css.parse(structure.css, options.css);
      }

      return values;
    }
  };
});