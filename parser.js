define([
  "./dom",
  "./css"
], function (dom, css){
  return {
    parse: function (/*TPS.structure*/structure, /*Object?*/options) {
      // summary:
      //    Parses a TuparseShakur structure into its dom and css representations.
      // structure: TuparseShakur.structure
      // options: [optional] Object
      // returns:
      //    Object containing parsed css and dom if they were provided.
      var values = {};

      if (structure.dom) {
        values.dom = dom.parse(structure.dom, options);
      }

      if (structure.css) {
        values.css = css.parse(structure.css, options);
      }

      return values;
    }
  };
});