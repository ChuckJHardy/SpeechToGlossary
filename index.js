const _ = require('lodash');
const record = require('node-record-lpcm16');

// Imports the Google Cloud client library
const Speech = require('@google-cloud/speech');

// Instantiates a client
const speech = Speech();

// The encoding of the audio file, e.g. 'LINEAR16'
const encoding = 'LINEAR16';

// The sample rate of the audio file in hertz, e.g. 16000
const sampleRateHertz = 16000;

// The BCP-47 language code to use, e.g. 'en-US'
const languageCode = 'en-US';

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    speechContexts: {
      phrases: [
        'Heroku'
      ]
    }
  },
  interimResults: false // If you want interim results, set this to true
};

const dictionary = {
  'New Relic': {
    'explain': 'Server Monitoring Tool',
    'url': 'https://newrelic.com/about',
    'mentions': 0
  },
  'AWS': {
    'explain': 'Hosting Platform',
    'url': 'https://aws.amazon.com/what-is-aws/',
    'mentions': 0
  },
  'Heroku': {
    'explain': 'Platform as a Service',
    'url': 'https://www.heroku.com/what',
    'mentions': 0
  }
}

const detector = (data) => {
  let results = data.results;
  _.mapKeys(dictionary, function(value, key) {
    if (results.indexOf(key) > -1) {
      let bingo = dictionary[key];
      let str = '-> ' + key + ': ' + bingo.explain + ' ' + bingo.url + '\n'
      process.stdout.write(str);
    }
  });
  // process.stdout.write(data.results);
}

// Create a recognize stream
const recognizeStream = speech.createRecognizeStream(request)
  .on('error', console.error)
  .on('data', detector);

// Start recording and send the microphone input to the Speech API
record
  .start({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '10.0'
  })
  .on('error', console.error)
  .pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');
