import easymidi from 'easymidi';
import fetch from 'node-fetch';
import prompt from 'prompt';

const newOutput = new easymidi.Output('MIDI Output Bird-God', true);
const newInput = new easymidi.Input('MIDI Input Bird-God', true);

const allOutputs = easymidi.getOutputs();

const MIDI_CLOCK_PER_QUARTER_NOTE = 24; // From MIDI specification:
const MASTER_TEMPO = 40; // BPM = number of quarter notes per minute

const CHANNELS = [0, 1, 2];
const playNote = (sustain = 100, note = 70, velocity = 50) => {
  const channel = randomChannel(CHANNELS);
  newOutput.send('noteon', { note, velocity, channel });
  setTimeout(() => {
    newOutput.send('noteoff', { note, velocity: 0, channel });
  }, sustain);
};

let idx = 1;
const START = 2000;

const randomChannel = (channels = []) => {
  return channels[Math.floor(Math.random() * channels.length)];
};

const findFrequency = () => {
  const max = 108;
  const min = 21;
  const randomInRange = Math.random() * (max - min) + min;
  return randomInRange;
};

const findVelocity = (number) => {
  const max = 127;
  const RETWEET_CAP = 10000;
  const range = number / RETWEET_CAP;
  return range * max;
};

const findSustain = (number) => {
  const max = 5000;
  const min = 50;
  const randomInRange = Math.random() * (max - min) + min;
  return randomInRange;
};

const startNote = (sustain, note, timing, velocity) => {
  setTimeout(() => {
    playNote(sustain, note, velocity);
  }, timing);
};

const start = async () => {
  prompt.start();

  prompt.get(['keyword'], (err, result) => {
    if (result.keyword) {
      play(result.keyword);
    }
  });

  const play = async (keyword) => {
    const response = await fetch(
      `http://localhost:3333/all-tweets/${keyword}_tweets.json`
    );
    const tweets = await response.json();

    if (tweets.length) {
      const startDate = tweets[0].createdAt.formatted;
      const endDate = tweets[tweets.length - 1].createdAt.formatted;

      console.log(
        'Playing piece:',
        keyword,
        '\n',
        'from:',
        startDate,
        '\n',
        'to:',
        endDate,
        'number of tweets:',
        tweets.length
      );
      tweets.forEach((tweet) => {
        startNote(
          findSustain(),
          findFrequency(),
          tweet.startingTime,
          findVelocity(tweet.retweets)
        );
      });
    }
  };
};

start();
