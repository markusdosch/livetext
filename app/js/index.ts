import "../css/mvp.css";
import "../css/styles.css";

const DEFAULT_ROOMNAMES = [
  "tech-talk",
  "hello-world",
  "meeting-notes",
  "coding-session",
  "random-meeting",
  "world-congress",
  "live-coding",
  "live-hacking",
];

window.setTimeout(suggestRoomname, 2500);

function suggestRoomname() {
  const input = document.querySelector("#room") as HTMLInputElement;

  if (document.activeElement === input) {
    window.setTimeout(suggestRoomname, 2500);
    return;
  }

  const random = Math.floor(Math.random() * DEFAULT_ROOMNAMES.length);
  input.value = DEFAULT_ROOMNAMES[random];
  window.setTimeout(suggestRoomname, 2500);
}
