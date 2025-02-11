const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// In your recognized event handler
recognizer.recognized = async (sender, event) => {
  if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
    const jsonResult = JSON.parse(event.result.json);
    const speakerId = jsonResult.NBest[0].SpeakerId;
    const text = event.result.text;

    // Translate the text to English using REST API
    try {
      const response = await axios({
        baseURL: translatorEndpoint,
        url: '/translate',
        method: 'post',
        headers: {
          'Ocp-Apim-Subscription-Key': translatorKey,
          'Ocp-Apim-Subscription-Region': speechServiceRegion,
          'Content-type': 'application/json',
          'X-ClientTraceId': uuidv4().toString(),
        },
        params: {
          'api-version': '3.0',
          from: 'ja',
          to: ['en'],
        },
        data: [{ text }],
        responseType: 'json',
      });

      const translatedText = response.data[0].translations[0].text;

      console.log(`Speaker ${speakerId}: ${translatedText}`);
      fullTranscription += `Speaker ${speakerId}: ${translatedText}\n`;
    } catch (err) {
      console.error('Error during translation:', err);
    }
  } else if (event.result.reason === sdk.ResultReason.NoMatch) {
    console.log("No speech could be recognized.");
  }
};

