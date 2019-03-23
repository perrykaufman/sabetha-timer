/* Caller API
 * call(string)
 * getVoices() returns array of voices {name, index}
 * setVoice()
 */

const EN = /^en-/i;

class SpeechSynthesisAdapter {
  constructor() {
    this._voice = null;
  }

  call(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    if (this._voice) utterance.voice = this._voice;
    utterance.rate = 1.25;
    speechSynthesis.speak(utterance);
  }

  static getVoices() {
    return speechSynthesis
      .getVoices()
      .filter(({ lang }) => {
        return EN.test(lang);
      })
      .map(({ name }, index) => {
        return { name, index };
      });
  }

  setVoice(name) {
    this._voice = speechSynthesis.getVoices().find(el => el.name === name);
  }
}

export default SpeechSynthesisAdapter;
