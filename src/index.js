import timer from '@lib/sabetha-timer'
import style from '@styles/index.styl'

const t = new timer((str) => console.log(str))

t.start()