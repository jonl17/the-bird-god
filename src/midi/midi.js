import easymidi from 'easymidi'
import fetch from 'node-fetch'
import prompt from 'prompt'
import { voice1, voice2, voice3, voice4 } from '../instruments.js'

const midiOutput = new easymidi.Output('MIDI Output Bird-God', true)

const playNote = ({ sustain, note, velocity, channel }) => {
  midiOutput.send('noteon', { note, velocity, channel })
  console.log(sustain, note, velocity, channel)
  setTimeout(() => {
    midiOutput.send('noteoff', { note, velocity, channel })
  }, sustain)
}

let idx = 1
const START = 2000

const randomChannel = (channels = []) => {
  return channels[Math.floor(Math.random() * channels.length)]
}

const findRandomInRange = (range) => {
  const max = range.high
  const min = range.low
  return Math.random() * (max - min) + min
}

const findVelocity = (number) => {
  const maxVel = 127
  const FOLLOWER_MAX = 30000
  const range = number / FOLLOWER_MAX
  const velocity = range * maxVel
  const minVel = 10
  return velocity > minVel ? velocity : minVel
}

const findSustain = (number, min, max) => {
  const range = number / max
  return 5000 * range
}

// midi channels that are in use in audio workstation program
const CHANNELS = [0, 1, 2, 3]

const startNote = (tweet, endtime) => {
  const timing = tweet.startingTime
  const sustain = findSustain(tweet.textLength, 5, 280)
  const velocity = findVelocity(tweet.followersCount)
  const channel = randomChannel(CHANNELS)

  // channels determine the instrument
  setTimeout(() => {
    if (channel === 0) {
      // bass instrument
      const note = findRandomInRange(voice1.range)
      playNote({ sustain, note, velocity, channel })
    } else if (channel === 1) {
      // tenor instrument
      const note = findRandomInRange(voice2.range)
      playNote({ sustain, note, velocity, channel })
    } else if (channel === 2) {
      // sopran instrument
      const note = findRandomInRange(voice3.range)
      playNote({ sustain, note, velocity, channel })
    } else if (channel === 3) {
      const note = findRandomInRange(voice4.range)
      playNote({ sustain, note, velocity, channel })
    }

    if (timing === endtime) {
      midiOutput.close()
    }
  }, timing)
}

const start = async () => {
  prompt.start()

  prompt.get(['keyword'], (err, result) => {
    if (result.keyword) {
      try {
        play(result.keyword)
      } catch (error) {
        throw new Error(error)
      }
    }
  })

  const play = async (keyword) => {
    const response = await fetch(
      `http://localhost:3333/all-tweets/${keyword}_tweets.json`
    )
    const tweets = await response.json()

    if (tweets.length) {
      const startDate = tweets[0].createdAt.formatted
      const endDate = tweets[tweets.length - 1].createdAt.formatted
      const endtime = tweets[tweets.length - 1].startingTime

      console.log(
        '\n',
        'Playing piece:',
        keyword,
        '\n',
        'from:',
        startDate,
        '\n',
        'to:',
        endDate,
        'number of tweets:',
        tweets.length,
        '\n',
        'Total playing time approx:',
        Math.ceil(endtime / 60000),
        'min.'
      )

      tweets.forEach((tweet) => startNote(tweet, endtime))
    }
  }
}

start()
