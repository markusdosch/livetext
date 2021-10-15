import io from "socket.io-client";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { language } from "@codemirror/language";
import { markdownLanguage } from "@codemirror/lang-markdown";

import "../css/mvp.css";

function main() {
  const params = new URL(document.location as any).searchParams;
  const room = params.get("room");

  if (!room) {
    console.error("No room specified.");
    return;
  }

  document
    .querySelector("#watch-link")
    .setAttribute("href", `watch.html?room=${room}`);

  const socket = io(`/${room}`);

  const updateListenerExtension = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      let text = [];

      let iter = update.view.state.doc.iterLines();
      while (!iter.done) {
        text.push(iter.value);
        iter.next();
      }

      socket.emit("text", text.join("\n"));
    }
  });

  const startState = EditorState.create({
    doc: "",
    extensions: [
      basicSetup,
      updateListenerExtension,
      EditorView.lineWrapping,
      language.of(markdownLanguage),
    ],
  });

  const view = new EditorView({
    state: startState,
    parent: document.querySelector("#editor"),
  });
}

main();
