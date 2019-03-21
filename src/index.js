import SabethaTimer from "@lib/sabetha-timer";
import SpeechSynthesisAdapter from "@lib/speech-synthesis-adapter";

import style from "@styles/index.styl";

const caller = new SpeechSynthesisAdapter();
const sabtimer = new SabethaTimer(caller);

const timer = document.querySelector(".sabtimer");

const displayTime = timer.querySelector(".display>.time");

const startButton = timer.querySelector(".start");
const resetButton = timer.querySelector(".reset");

function formatTime({ minutes, seconds }) {
  const min = (minutes < 10 ? "0" : "") + String(minutes);
  const sec = (seconds < 10 ? "0" : "") + String(seconds);

  return `${min}:${sec}`;
}

function init() {
  displayTime.innerText = formatTime({ minutes: 0, seconds: 0 });
}

resetButton.disabled = true;

resetButton.addEventListener("click", event => {
  sabtimer.reset();
});

startButton.addEventListener("click", event => {
  sabtimer.start();
});

sabtimer.on("start", () => {
  startButton.disabled = true;
  resetButton.disabled = false;
});

sabtimer.on("reset", () => {
  displayTime.innerText = formatTime({ minutes: 0, seconds: 0 });
  startButton.disabled = false;
  resetButton.disabled = true;
});

sabtimer.on("finish", () => {
  displayTime.innerText = formatTime({ minutes: 0, seconds: 0 });
  startButton.disabled = false;
  resetButton.disabled = true;
});

sabtimer.on("update", time => {
  displayTime.innerText = formatTime(time);
});

init();
