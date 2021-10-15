import io from "socket.io-client";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "../../node_modules/highlight.js/styles/default.css";

import "../css/mvp.css";

const md = MarkdownIt({
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return ""; // use external default escaping
  },
});

function main() {
  const params = new URL(document.location as any).searchParams;
  const room = params.get("room");

  if (!room) {
    console.error("No room specified.");
    return;
  }

  const socket = io(`/${room}`);
  socket.on("text", (text) => {
    document.querySelector("#content").innerHTML = md.render(text);
  });
}

main();
