const EN = /^en-/i;

/* caller interface
 * call(string)
 * getVoices() returns array of voices {name, index}
 * setVoice()
 * cancel()
 */
class SpeechSynthesisAdapter {
  constructor() {
    this.synth = window.speechSynthesis;
    this._voice = null;
  }

  /*
   * calls out the given text
   * @param text - a string of text
   */
  call(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    if (this._voice) utterance.voice = this._voice;
    utterance.rate = 1.25;
    window.speechSynthesis.speak(utterance);
  }

  /*
   * cancel all ongoing and pending calls
   */
  cancel() {
    window.speechSynthesis.cancel();
  }

  /*
   * returns an array of voices the caller can use
   * @return - an array of voices with { name, index }
   */
  static getVoices() {
    return window.speechSynthesis
      .getVoices()
      .filter(({ lang }) => {
        return EN.test(lang);
      })
      .map(({ name }, index) => {
        return { name, index };
      });
  }

  /*
   * sets the voice to be used by the caller
   * @param name - the name of the voice to be used
   */
  setVoice(name) {
    this._voice = window.speechSynthesis
      .getVoices()
      .find(el => el.name === name);
  }
}

export default SpeechSynthesisAdapter;
