const EN = /^en-/i;

/* caller api
 * call(string)
 * getVoices() returns array of voices {name, index}
 * setVoice()
 */
class SpeechSynthesisAdapter {
  constructor() {
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
    speechSynthesis.speak(utterance);
  }

  /*
   * returns an array of voices the caller can use
   * @return - an array of voices with { name, index }
   */
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

  /*
   * sets the voice to be used by the caller
   * @param name - the name of the voice to be used
   */
  setVoice(name) {
    this._voice = speechSynthesis.getVoices().find(el => el.name === name);
  }
}

export default SpeechSynthesisAdapter;
