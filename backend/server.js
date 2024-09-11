const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const subscriptionKey = 'acd1964c4db54b139b779090eb741c11';
const languageResourceKey = 'b73a225bd10947ee8fc93916a73cb7a7';
const serviceRegion = 'southeastasia';

// Get token from Azure
const getToken = async () => {
  try {
    const response = await axios.post(
      `https://${serviceRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log("token >>>>>>>", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw new Error('Error fetching token');
  }
};

// Use the Conversation Transcription API for speaker diarization and PII identification
const speechToText = async (filePath, token) => {
  try {
    const audioFile = fs.readFileSync(filePath);

    const response = await axios.post(
      `https://${serviceRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed&profanity=masked&diarizationEnabled=true&piiRedaction=true`,
      audioFile,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'audio/wav',
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
      }
    );

    console.log("speech to text response >>>>>>>>>", response.data);
    return response.data;
  } catch (error) {
    console.error('Error during speech recognition:', error.response ? error.response.data : error.message);
    throw new Error('Error during speech recognition');
  }
};

// Use Azure Text Analytics API for PII identification
const PIIdentification = async (text) => {
  console.log("text to analyze for PII", text);
  const endpoint = `https://${serviceRegion}.api.cognitive.microsoft.com/text/analytics/v3.1-preview.1/entities/recognition/pii`;

  try {
      const response = await axios.post(
          endpoint,
          {
              documents: [
                  {
                      language: 'en',
                      id: '1',
                      text: text
                  }
              ]
          },
          {
              headers: {
                  'Ocp-Apim-Subscription-Key': languageResourceKey,
                  'Content-Type': 'application/json'
              }
          }
      );

      console.log("response from PII analysis >>>>>>>>>>>>>>>>>>>>>>>", response.data);
      return response.data;
  } catch (error) {
      console.error('Error during PII analysis:', error.response ? error.response.data : error.message);
      throw new Error('Error during PII analysis');
  }
};


// Use Azure Text Analytics API for sentiment analysis and PII identification
const analyzeText = async (text) => {
  console.log("text to analyze", text);
  let endpoint = `https://${serviceRegion}.api.cognitive.microsoft.com/language/:analyze-text?api-version=2022-05-01`;
//   https://<your-custom-subdomain>.cognitiveservices.azure.com/text/analytics/<version>/<feature>
let backup = "https://${serviceRegion}.api.cognitive.microsoft.com/text/analytics/v3.1-preview.1/entities/recognition/pii";
  try {
    const response = await axios.post(
      `${endpoint}`,
      {
        "kind": "SentimentAnalysis",
        "parameters": {
            "modelVersion": "latest"
        },
        "analysisInput":{
            "documents":[
                {
                    "id":"1",
                    "language": "en",
                    "text": text
                }
            ]
        }
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': languageResourceKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("response from analyze>>>>>>>>>>>>>>>>>>>>>>>", response.data.results);
    return response.data.results;
  } catch (error) {
    console.error('Error during text analysis:', error.response ? error.response.data : error.message);
    throw new Error('Error during text analysis');
  }
};

// Use Azure Text Analytics API for keyphrases analysis and PII identification
const textKeyPhrases = async (text) => {
    console.log("text to analyze", text);
    let endpoint = `https://${serviceRegion}.api.cognitive.microsoft.com/language/:analyze-text?api-version=2022-05-01`;
    //https://<your-custom-subdomain>.cognitiveservices.azure.com/text/analytics/<version>/<feature>
    let backup = "https://${serviceRegion}.api.cognitive.microsoft.com/text/analytics/v3.1-preview.1/entities/recognition/pii";
    try {
      const response = await axios.post(
        `${endpoint}`,
        {
            "kind": "KeyPhraseExtraction",
            "parameters": {
                "modelVersion": "latest"
            },
            "analysisInput":{
                "documents":[
                    {
                        "id":"1",
                        "language": "en",
                        "text": text
                    }
                ]
            }
        },        
        {
          headers: {
            'Ocp-Apim-Subscription-Key': languageResourceKey,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log("response from keyphrases>>>>>>>>>>>>>>>>>>>>>>>", response.data.results);
      return response.data.results;
    } catch (error) {
      console.error('Error during text analysis:', error.response ? error.response.data : error.message);
      throw new Error('Error during text analysis');
    }
  };

// Endpoint to handle file upload and speech to text conversion
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const token = await getToken();
    const speechResult = await speechToText(file.path, token);

    const transcript = speechResult.DisplayText; // Adjust based on the API response structure
    const piiResult = await analyzeText(transcript);
    const phrases = await textKeyPhrases(transcript);
    //const pii = await PIIdentification(transcript);


    res.json({ transcript, pii: piiResult, keyphrases :phrases });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing audio file');
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

