import SabethaTimer from "@lib/sabetha-timer";
import SpeechSynthesisAdapter from "@lib/speech-synthesis-adapter";

import milligram from "milligram/src/milligram.sass";
import main from "@styles/main.sass";

// containers
const timer = document.querySelector(".sabtimer");
const timeElement = timer.querySelector(".sabtimer-display>.time");
const controls = timer.querySelector(".sabtimer-controls");

// modal
const modal = document.querySelector(".modal");
const mask = document.querySelector(".mask");

// timer buttons
const startButton = controls.elements.main.elements.start;
const resetButton = controls.elements.main.elements.reset;

// configuration input fields
const voiceSelect = controls.elements.config.elements.voice;
const countdownSelect = controls.elements.config.elements.countdown;
const canonSelect = controls.elements.config.elements.canons;
const canonInputs = [
  controls.elements.config.elements.canon1,
  controls.elements.config.elements.canon2,
  controls.elements.config.elements.canon3,
  controls.elements.config.elements.canon4
];

function openModal() {
  modal.style.display = "block";
  mask.style.display = "block";
}

/*
 * sets the time on the timer display
 */
function setTime({ minutes = 0, seconds = 0 } = {}) {
  const min = (minutes < 10 ? "0" : "") + String(minutes);
  const sec = (seconds < 10 ? "0" : "") + String(seconds);

  timeElement.innerText = `${min}:${sec}`;
}

/*
 * updates which buttons are available after the timer starts
 */
function startTime() {
  startButton.disabled = true;
  resetButton.disabled = false;
}

/*
 * resets the timer display and available buttons
 */
function resetTime() {
  setTime({ minutes: 0, seconds: 0 });
  startButton.disabled = false;
  resetButton.disabled = true;
}

/*
 * adds voice options to the voice select element
 */
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

/*
 * changes which canon names are displayed based on the selected option. If called without an event, initializes the canon name select and name fields.
 */
function changeCanonNames(event) {
  // initialize option and names if no event
  const option = !event ? "direction" : event.target.value;
  if (!event) canonSelect[0].selected = true;

  const isCustom = !(option in SabethaTimer.CANONS[0]);

  const names = !isCustom
    ? SabethaTimer.CANONS.map(el => el[option])
    : Array(4).fill("");

  canonInputs.forEach((input, index) => {
    input.disabled = !isCustom;
    input.value = names[index];
  });

  if (isCustom) canonInputs[0].focus();
}

/*
 * gets the configuration options from the form
 */
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

/*
 * initializes the form and listeners
 */
(function initialize() {
  const caller = new SpeechSynthesisAdapter();
  const sabtimer = new SabethaTimer(caller);
  if (!window.speechSynthesis) {
    // open modal
    openModal();
    return;
  }

  resetTime();
  changeCanonNames();
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices; // for chrome

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
