import SabethaTimer from "@lib/sabetha-timer";
import SpeechSynthesisAdapter from "@lib/speech-synthesis-adapter";

import milligram from "milligram/src/milligram.sass";
import main from "@styles/main.sass";

const caller = new SpeechSynthesisAdapter();
const sabtimer = new SabethaTimer(caller);

// Containers
const timer = document.querySelector(".sabtimer");
const timeElement = timer.querySelector(".sabtimer-display>.time");
const controls = timer.querySelector(".sabtimer-controls");

// Timer Buttons
const startButton = controls.elements.main.elements.start;
const resetButton = controls.elements.main.elements.reset;

// Configuration Input
const voiceSelect = controls.elements.config.elements.voice;
const countdownSelect = controls.elements.config.elements.countdown;
const canonSelect = controls.elements.config.elements.canons;
const canonInputs = [
  controls.elements.config.elements.canon1,
  controls.elements.config.elements.canon2,
  controls.elements.config.elements.canon3,
  controls.elements.config.elements.canon4
];

function setTime({ minutes = 0, seconds = 0 } = {}) {
  const min = (minutes < 10 ? "0" : "") + String(minutes);
  const sec = (seconds < 10 ? "0" : "") + String(seconds);

  timeElement.innerText = `${min}:${sec}`;
}

function startTime() {
  startButton.disabled = true;
  resetButton.disabled = false;
}

function resetTime() {
  setTime({ minutes: 0, seconds: 0 });
  startButton.disabled = false;
  resetButton.disabled = true;
}

function populateVoices() {
  // remove current voice options
  while (voiceSelect.hasChildNodes()) {
    voiceSelect.removeChild(voiceSelect.firstChild);
  }

  const voices = SpeechSynthesisAdapter.getVoices();

  // add voice options
  voices.forEach(voice => {
    const option = document.createElement("option");

    option.value = voice.name;
    option.innerText = voice.name;

    voiceSelect.appendChild(option);
  });
}

function changeCanonNames(event) {
  // select direction if called without event
  const option = !event ? "direction" : event.target.value;
  if (!event) canonSelect[0].selected = true;

  const isCustom = !(option in SabethaTimer.CANONS[0]);

  const names = !isCustom
    ? SabethaTimer.CANONS.map(el => el[option])
    : ["", "", "", ""];

  canonInputs.forEach((input, index) => {
    input.disabled = !isCustom;
    input.value = names[index];
  });

  if (isCustom) canonInputs[0].focus();
}

function getConfig() {
  const voice = voiceSelect.value;
  const countdown = countdownSelect.value === "countdown";
  const canons =
    canonSelect.value in SabethaTimer.CANONS[0]
      ? canonSelect.value
      : canonInputs.map(input => input.value);

  return {
    voice,
    countdown,
    canons
  };
}

// Initialize
(function initialize() {
  if (!window.speechSynthesis) {
    // open modal
    return;
  }

  resetTime();
  changeCanonNames();
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;

  resetButton.addEventListener("click", () => {
    sabtimer.reset();
  });

  startButton.addEventListener("click", event => {
    event.preventDefault();
    const { voice, countdown, canons } = getConfig();
    caller.setVoice(voice);
    sabtimer.start({ countdown, canons });
  });

  canonSelect.addEventListener("change", changeCanonNames);

  sabtimer.on("start", startTime);
  sabtimer.on("reset", resetTime);
  sabtimer.on("finish", resetTime);
  sabtimer.on("update", setTime);
})();
