import io from "socket.io-client";
import { AnnotationType, EditorState, Transaction } from "@codemirror/state";
import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { language } from "@codemirror/language";
import { markdownLanguage } from "@codemirror/lang-markdown";
import { ViewUpdate } from "@codemirror/view";
import { throttle } from "lodash";

import "../css/mvp.css";
import "../css/styles.css";
import "../css/admin.css";

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

  document
    .querySelector("#watch-link-input")
    .setAttribute("value", `${window.location.host}/watch.html?room=${room}`);

  document.querySelector("#copy-watch-link").addEventListener("click", () => {
    const input = document.querySelector(
      "#watch-link-input"
    ) as HTMLInputElement;

    // via https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
    input.select();
    input.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(input.value);

    const button = document.querySelector(
      "#copy-watch-link"
    ) as HTMLInputElement;
    const oldValue = button.value;
    button.value = "Copied 🎉";

    window.setTimeout(() => {
      button.value = oldValue;
    }, 1000);
  });

  const socket = io(`/${room}`);

  const onUpdate = (update: ViewUpdate) => {
    if (
      !update.transactions.every((transaction) =>
        transaction.annotation(Transaction.userEvent)
      )
    ) {
      // if not every transaction was a userEvent => update was triggered by receiving text via websocket => ignore (do not re-emit)
      return;
    }

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

  const view = new EditorView({
    state: startState,
    parent: document.querySelector("#editor"),
  });

  socket.on("text", (text) => {
    view.dispatch(
      view.state.update({
        changes: { from: 0, to: view.state.doc.length, insert: text },
      })
    );
  });

  document
    .querySelector("#load-example")
    .addEventListener("click", async () => {
      const response = await fetch(
        "https://raw.githubusercontent.com/markusdosch/livetext/main/README.md"
      );
      if (!response.ok) {
        const button = document.querySelector(
          "#load-example"
        ) as HTMLInputElement;
        const oldValue = button.value;
        button.value = "Something went wrong 😞";

        window.setTimeout(() => {
          button.value = oldValue;
        }, 1000);

        return;
      }

      const text = await response.text();

      view.dispatch(
        view.state.update({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: text,
          },
          userEvent: "input.paste",
        })
      );
    });
}

function getText(update: ViewUpdate) {
  const text = [];
  const iter = update.view.state.doc.iterLines();
  while (!iter.done) {
    text.push(iter.value);
    iter.next();
  }
  const finalText = text.join("\n").trim();
  return finalText;
}

main();
