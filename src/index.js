import SabethaTimer from '@lib/sabetha-timer.js'
import SpeechSynthesisAdapter from '@lib/speech-synthesis-adapter.js'
import style from '@styles/index.styl'

const caller = new SpeechSynthesisAdapter()
const timer = new SabethaTimer(caller)

timer.start()