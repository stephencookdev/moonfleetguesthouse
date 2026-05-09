const React = require("react");

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    React.createElement("title", { key: "title" }, "Moonfleet"),
    React.createElement("link", {
      key: "font-preconnect",
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    }),
    React.createElement("link", {
      key: "font-stylesheet",
      href: "https://fonts.googleapis.com/css?family=Cardo:400,700|Josefin+Sans:300,400&display=swap",
      rel: "stylesheet",
    }),
  ]);
};
