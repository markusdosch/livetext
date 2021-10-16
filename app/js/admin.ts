import io from "socket.io-client";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { language } from "@codemirror/language";
import { markdownLanguage } from "@codemirror/lang-markdown";
import { ViewUpdate } from "@codemirror/view";
import { throttle } from "lodash";

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

  const onUpdate = (update: ViewUpdate) => {
    socket.emit("text", getText(update));
  };
  const throttledOnUpdate = throttle(onUpdate, 500);
  const updateListenerExtension = EditorView.updateListener.of((update) => {
    if (!update.docChanged) {
      return;
    }
    throttledOnUpdate(update);
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

  new EditorView({
    state: startState,
    parent: document.querySelector("#editor"),
  });
}

function getText(update: ViewUpdate) {
  const text = [];
  const iter = update.view.state.doc.iterLines();
  while (!iter.done) {
    text.push(iter.value);
    iter.next();
  }
  const finalText = text.join("\n");
  return finalText;
}

main();
