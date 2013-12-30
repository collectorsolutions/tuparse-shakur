define(function () {
  return {
    success: function (event) {
      console.log("Success button clicked");
    },
    success2: function (event) {
      console.log("Second event on success button");
    },
    delegated: function (event) {
      console.log("Delegated event");
    }
  };
});