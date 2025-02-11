const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const { CognitiveServicesCredentials } = require("@azure/ms-rest-js");

const { TranslatorTextClient } = require("@azure/cognitiveservices-translatortext");

// Replace with your Azure subscription keys and region
const subscriptionKey = "acd1964c4db54b139b779090eb741c11";
const serviceRegion = "southeastasia";
const translatorKey = "103b6768372f40c1959ee3919a0bcd68";
const translatorEndpoint = "https://api.cognitive.microsofttranslator.com/";

// Input: Path to your Japanese audio file
const audioFile = "output_audio_converted.wav";





// Replace with your Azure subscription keys and regions
const speechSubscriptionKey = "acd1964c4db54b139b779090eb741c11";
const speechServiceRegion = "southeastasia"; // e.g., "eastus"
const translatorRegion = "southeastasia"; // e.g., "eastus"


// Create speech configuration
const speechConfig = sdk.SpeechConfig.fromSubscription(speechSubscriptionKey, speechServiceRegion);
speechConfig.speechRecognitionLanguage = "ja-JP"; // Japanese

// Enable speaker diarization
speechConfig.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestWordLevelTimestamps, "true");
speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EnableSpeakerDiarization, "true");
// Optionally, set the expected number of speakers
speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_SpeakerDiarizationMaxSpeakers, "2"); // Adjust as needed

// Create a PushAudioInputStream to read the audio file
const pushStream = sdk.AudioInputStream.createPushStream();

// Read the audio file and push its content to the PushAudioInputStream
fs.createReadStream(audioFile)
  .on("data", function (arrayBuffer) {
    pushStream.write(arrayBuffer.slice());
  })
  .on("end", function () {
    pushStream.close();
  });

// Create an AudioConfig object from the stream
const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

// Create the speech recognizer
const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

// Variable to collect the full transcribed and translated text with speaker labels
let fullTranscription = "";

// Function to translate text using the Translator Text API
async function translateText(text) {
  try {
    const response = await axios({
      baseURL: translatorEndpoint,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': translatorKey,
        'Ocp-Apim-Subscription-Region': translatorRegion,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString(),
      },
      params: {
        'api-version': '3.0',
        from: 'ja',
        to: ['en'],
      },
      data: [
        {
          text: text
        }
      ],
      responseType: 'json'
    });

    const translatedText = response.data[0].translations[0].text;
    return translatedText;

  } catch (err) {
    console.error('Error during translation:', err);
    return null;
  }
}

// Subscribe to events to receive recognition results
recognizer.recognized = async (sender, event) => {
  if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
    // Parse the JSON result to extract speaker information
    const jsonResult = JSON.parse(event.result.json);
    const nBest = jsonResult.NBest && jsonResult.NBest[0];
    const speakerId = nBest && nBest.SpeakerId !== undefined ? nBest.SpeakerId : 'Unknown';
    const text = event.result.text;

    // Translate the text to English
    const translatedText = await translateText(text);

    if (translatedText) {
      console.log(`Speaker ${speakerId}: ${translatedText}`);
      fullTranscription += `Speaker ${speakerId}: ${translatedText}\n`;
    } else {
      console.log(`Speaker ${speakerId}: Translation failed.`);
    }

  } else if (event.result.reason === sdk.ResultReason.NoMatch) {
    console.log("No speech could be recognized.");
  }
};

recognizer.canceled = (sender, event) => {
  console.error(`CANCELED: Reason=${event.reason}`);

  if (event.reason === sdk.CancellationReason.Error) {
    console.error(`CANCELED: ErrorCode=${event.errorCode}`);
    console.error(`CANCELED: ErrorDetails=${event.errorDetails}`);
    console.error("CANCELED: Did you update the subscription info?");
  }

  recognizer.stopContinuousRecognitionAsync();
};

recognizer.sessionStopped = (sender, event) => {
  console.log("\nSession stopped.");
  console.log("Final Transcribed and Translated Text with Speaker Diarization:\n", fullTranscription.trim());
  recognizer.stopContinuousRecognitionAsync();
};

// Start continuous recognition
recognizer.startContinuousRecognitionAsync(
  () => {
    console.log("Recognition started.");
  },
  (err) => {
    console.trace("Error starting recognition: " + err);
  }
);
