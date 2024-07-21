const express = require('express');
const app = express();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const helper = require('./helper');
const restHelper = require('./rest_helper');
const userConfigHelper = require('./user_config_helper');

// Constants
const SPEECH_TRANSCRIPTION_PATH = "/speechtotext/v3.0/transcriptions";
const SENTIMENT_ANALYSIS_PATH = "/language/:analyze-text";
const SENTIMENT_ANALYSIS_QUERY = "?api-version=2022-05-01";
const CONVERSATION_ANALYSIS_PATH = "/language/analyze-conversations/jobs";
const CONVERSATION_ANALYSIS_QUERY = "?api-version=2022-05-15-preview";
const CONVERSATION_SUMMARY_MODEL_VERSION = "2022-05-15-preview";
const WAIT_SECONDS = 10;

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.use(express.json());

class TranscriptionPhrase {
    constructor(id, text, itn, lexical, speakerNumber, offset, offsetInTicks) {
        this.id = id;
        this.text = text;
        this.itn = itn;
        this.lexical = lexical;
        this.speakerNumber = speakerNumber;
        this.offset = offset;
        this.offsetInTicks = offsetInTicks;
    }
}

class SentimentAnalysisResult {
    constructor(speakerNumber, offsetInTicks, document) {
        this.speakerNumber = speakerNumber;
        this.offsetInTicks = offsetInTicks;
        this.document = document;
    }
}

class ConversationAnalysisSummaryItem {
    constructor(aspect, summary) {
        this.aspect = aspect;
        this.summary = summary;
    }
}

class ConversationAnalysisPiiItem {
    constructor(category, text) {
        this.category = category;
        this.text = text;
    }
}

class ConversationAnalysisForSimpleOutput {
    constructor(summary, piiAnalysis) {
        this.summary = summary;
        this.piiAnalysis = piiAnalysis;
    }
}

// Other helper functions
const getCombinedRedactedContent = (channel) => ({
    channel: channel,
    display: "",
    itn: "",
    lexical: ""
});

const createTranscription = async (userConfig) => {
    const uri = `https://${userConfig.speechEndpoint}${SPEECH_TRANSCRIPTION_PATH}`;
    const content = {
        contentUrls: [userConfig.inputAudioUrl],
        properties: {
            diarizationEnabled: !userConfig.useStereoAudio,
            timeToLive: "PT30M"
        },
        locale: userConfig.locale,
        displayName: `call_center_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
    };

    const response = await restHelper.sendPost({
        uri,
        content,
        key: userConfig.speechSubscriptionKey,
        expectedStatusCodes: [201] // HTTPStatus.CREATED
    });

    const transcriptionUri = response.data.self;
    const transcriptionId = transcriptionUri.split('/').pop();
    if (!uuidv4(transcriptionId)) {
        throw new Error(`Unable to parse response from Create Transcription API: ${response.data}`);
    }
    return transcriptionId;
};

const getTranscriptionStatus = async (transcriptionId, userConfig) => {
    const uri = `https://${userConfig.speechEndpoint}${SPEECH_TRANSCRIPTION_PATH}/${transcriptionId}`;
    const response = await restHelper.sendGet({
        uri,
        key: userConfig.speechSubscriptionKey,
        expectedStatusCodes: [200] // HTTPStatus.OK
    });

    if (response.data.status.toLowerCase() === 'failed') {
        throw new Error(`Unable to transcribe audio input. Response: ${response.data}`);
    }
    return response.data.status.toLowerCase() === 'succeeded';
};

const waitForTranscription = async (transcriptionId, userConfig) => {
    let done = false;
    while (!done) {
        console.log(`Waiting ${WAIT_SECONDS} seconds for transcription to complete.`);
        await sleep(WAIT_SECONDS * 1000);
        done = await getTranscriptionStatus(transcriptionId, userConfig);
    }
};

const getTranscriptionFiles = async (transcriptionId, userConfig) => {
    const uri = `https://${userConfig.speechEndpoint}${SPEECH_TRANSCRIPTION_PATH}/${transcriptionId}/files`;
    const response = await restHelper.sendGet({
        uri,
        key: userConfig.speechSubscriptionKey,
        expectedStatusCodes: [200] // HTTPStatus.OK
    });
    return response.data;
};

const getTranscriptionUri = (transcriptionFiles, userConfig) => {
    const value = transcriptionFiles.values.find(value => value.kind.toLowerCase() === 'transcription');
    if (!value) {
        throw new Error(`Unable to parse response from Get Transcription Files API: ${transcriptionFiles}`);
    }
    return value.links.contentUrl;
};

const getTranscription = async (transcriptionUri) => {
    const response = await restHelper.sendGet({
        uri: transcriptionUri,
        key: '',
        expectedStatusCodes: [200] // HTTPStatus.OK
    });
    return response.data;
};

const getTranscriptionPhrases = (transcription, userConfig) => {
    const helper = ([id, phrase]) => {
        const best = phrase.nBest[0];
        let speakerNumber;
        if ('speaker' in phrase) {
            speakerNumber = phrase.speaker - 1;
        } else if ('channel' in phrase) {
            speakerNumber = phrase.channel;
        } else {
            throw new Error(`nBest item contains neither channel nor speaker attribute. ${best}`);
        }
        return new TranscriptionPhrase(id, best.display, best.itn, best.lexical, speakerNumber, phrase.offset, phrase.offsetInTicks);
    };
    return transcription.recognizedPhrases.map(helper);
};

// Continue implementing other helper functions similarly

// Express route
app.post('/transcribe', async (req, res) => {
    try {
        const userConfig = req.body;
        let transcription, transcriptionId;

        if (userConfig.inputFilePath) {
            transcription = require(userConfig.inputFilePath);
        } else if (userConfig.inputAudioUrl) {
            transcriptionId = await createTranscription(userConfig);
            await waitForTranscription(transcriptionId, userConfig);
            const transcriptionFiles = await getTranscriptionFiles(transcriptionId, userConfig);
            const transcriptionUri = getTranscriptionUri(transcriptionFiles, userConfig);
            transcription = await getTranscription(transcriptionUri);
        } else {
            throw new Error('Missing input audio URL.');
        }

        transcription.recognizedPhrases.sort((a, b) => a.offsetInTicks - b.offsetInTicks);
        const phrases = getTranscriptionPhrases(transcription, userConfig);

        // Implement and call further processing functions similar to the Python script

        res.status(200).send({ message: 'Transcription completed successfully.', phrases });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
