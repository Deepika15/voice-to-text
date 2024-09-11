import React, { useState } from 'react';
import AudioUpload from './components/AudioUpload';
import Tabs from './components/Tabs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [transcript, setTranscript] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [callSummary, setCallSummary] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  const handleUpload = (data, file) => {
    console.log(">>>>>>>>>>>", data);
    // Process data to extract speaker information
    const processedTranscript = data.transcript.split('.').map((sentence, index) => ({
      speaker: index % 2 === 0 ? 'Speaker 1' : 'Speaker 2',
      text: sentence.trim(),
    }));
    setTranscript(processedTranscript);
    setSentiment(data.pii.documents[0].sentiment);
    setCallSummary(data.keyphrases.documents[0].keyPhrases.join(', '));
    setAudioFile(file);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <div className="w-1/4 bg-indigo-100 p-4">
          <AudioUpload onUpload={handleUpload} />
        </div>
        <div className="w-3/4 bg-indigo-50 p-4">
          <Tabs transcript={transcript} sentiment={sentiment} callSummary={callSummary} audioFile={audioFile} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;


// import React, { useState } from 'react';
// import AudioUpload from './components/AudioUpload';
// import Tabs from './components/Tabs';

// function App() {
//   const [transcript, setTranscript] = useState([]);

//   const handleUpload = (data) => {
//     console.log("handleUpload data<<<>>><<", data);
//     // Process data to extract speaker information
//     // Assume the data contains recognized phrases with speaker labels and text
//     const processedTranscript = data.NBest[0].SpeakerLabels.map((label) => ({
//       speaker: label.speaker,
//       text: label.transcript,
//     }));
//     setTranscript(processedTranscript);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-center">Speech to Text POC</h1>
//       <AudioUpload onUpload={handleUpload} />
//       <Tabs transcript={transcript} />
//     </div>
//   );
// }

// export default App;
