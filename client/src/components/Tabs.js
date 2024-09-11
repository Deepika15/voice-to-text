import React, { useState } from 'react';
import SpeakerDiarization from './SpeakerDiarization';
import SentimentAnalysis from './SentimentAnalysis';
import CallSummary from './CallSummary';

const tabComponents = {
  'Speaker Diarization': SpeakerDiarization,
  'Call Summarization': CallSummary,
  'Agent Notebook': () => <div>Agent Notebook Content</div>,
  'PII Identification': () => <div>PII Identification Content</div>,
  'Sentiment Analysis': SentimentAnalysis,
};

function Tabs({ transcript, sentiment, callSummary, audioFile }) {
  const [activeTab, setActiveTab] = useState('Speaker Diarization');

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div>
      <div></div>
      <div className="flex border-b mb-4">
        {Object.keys(tabComponents).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-4 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 border rounded">
       {audioFile && (
          <audio controls className="mt-2 w-full mb-8">
            <source src={audioFile} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        )}
        <ActiveComponent transcript={transcript} sentiment={sentiment} callSummary={callSummary} />
      </div>
    </div>
  );
}

export default Tabs;

// import React, { useState } from 'react';
// import SpeakerDiarization from './SpeakerDiarization';
// import SentimentAnalysis from './SentimentAnalysis';
// import CallSummary from './CallSummary';

// const tabComponents = {
//   'Speaker Diarization': SpeakerDiarization,
//   'Call Summarization': CallSummary,
//   'Agent Notebook': () => <div>Agent Notebook Content</div>,
//   'PII Identification': () => <div>PII Identification Content</div>,
//   'Sentiment Analysis': SentimentAnalysis,
// };

// function Tabs({ transcript, sentiment, callSummary }) {
//   const [activeTab, setActiveTab] = useState('Speaker Diarization');

//   const ActiveComponent = tabComponents[activeTab];

//   return (
//     <div>
//       <div className="flex border-b mb-4">
//         {Object.keys(tabComponents).map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`p-4 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>
//       <div className="p-4 border rounded">
//         <ActiveComponent transcript={transcript} sentiment={sentiment} callSummary={callSummary} />
//       </div>
//     </div>
//   );
// }

// export default Tabs;

// import React, { useState } from 'react';
// import SpeakerDiarization from './SpeakerDiarization';

// const tabComponents = {
//   'Speaker Diarization': SpeakerDiarization,
//   'Call Summarization': () => <div>Call Summarization Content</div>,
//   'Agent Notebook': () => <div>Agent Notebook Content</div>,
//   'PII Identification': () => <div>PII Identification Content</div>,
//   'Sentiment Analysis': () => <div>Sentiment Analysis Content</div>,
// };

// function Tabs({ transcript }) {
//   const [activeTab, setActiveTab] = useState('Speaker Diarization');

//   const ActiveComponent = tabComponents[activeTab];

//   return (
//     <div>
//       <div className="flex border-b mb-4">
//         {Object.keys(tabComponents).map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`p-4 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>
//       <div className="p-4 border rounded">
//         <ActiveComponent transcript={transcript} />
//       </div>
//     </div>
//   );
// }

// export default Tabs;
