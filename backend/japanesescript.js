const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");

// Replace with your Azure Speech service subscription key and region
const subscriptionKey = "acd1964c4db54b139b779090eb741c11";
const serviceRegion = "southeastasia";

// Input: Path to your Japanese audio file (e.g., a .wav file in the correct format)
const audioFile = "output_audio_converted.wav";

// Create speech configuration using your subscription key and region
const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(subscriptionKey, serviceRegion);

// Set input language (Japanese) and target language (English)
speechConfig.speechRecognitionLanguage = "ja-JP"; // Japanese
speechConfig.addTargetLanguage("en"); // Translate to English

// Create a PushAudioInputStream to read the audio file
const pushStream = sdk.AudioInputStream.createPushStream();

// Read the audio file and push its content to the PushAudioInputStream
fs.createReadStream(audioFile)
  .on('data', function (arrayBuffer) {
    pushStream.write(arrayBuffer);
  })
  .on('end', function () {
    pushStream.close();
  });

// Create an AudioConfig object from the stream
const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

// Create the translation recognizer
const recognizer = new sdk.TranslationRecognizer(speechConfig, audioConfig);

// Variable to collect the full translated text
let fullTranslation = "";

// Subscribe to events to receive recognition results
recognizer.recognized = (sender, event) => {
  if (event.result.reason === sdk.ResultReason.TranslatedSpeech) {
    const translatedText = event.result.translations.get("en");
    console.log(`Translated Text: ${translatedText}`);
    fullTranslation += translatedText + " ";
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
  console.log("Final Translated Text:", fullTranslation.trim());
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


// //////////////////////////////////////////////////////////
// const sdk = require("microsoft-cognitiveservices-speech-sdk");
// const fs = require("fs");

// // Replace with your Azure Speech service subscription key and region
// const subscriptionKey = "acd1964c4db54b139b779090eb741c11";
// const serviceRegion = "southeastasia";

// // Input: Path to your Japanese audio file (e.g., a .wav file)
// const audioFile = "output_audio.wav";

// // Create speech configuration using your subscription key and region
// const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(subscriptionKey, serviceRegion);

// // Set input language (Japanese) and target language (English)
// speechConfig.speechRecognitionLanguage = "ja-JP"; // Japanese
// speechConfig.addTargetLanguage("en"); // Translate to English

// // Create audio configuration from the audio file
// const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audioFile));

// // Create the speech recognizer and translator
// const recognizer = new sdk.TranslationRecognizer(speechConfig, audioConfig);

// // Perform speech recognition and translation
// recognizer.recognizeOnceAsync((result) => {
//     console.log("result>>>>", result);
//     if (result.reason === sdk.ResultReason.TranslatedSpeech) {
//         console.log(`Recognized Japanese Text: ${result.text}`);
//         console.log(`Translated English Text: ${result.translations.get("en")}`);
//     } else {
//         console.error("Error recognizing speech or translating: ", result.errorDetails);
//     }

//     recognizer.close();
// });
