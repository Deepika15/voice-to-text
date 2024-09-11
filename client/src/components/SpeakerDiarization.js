import React from 'react';

function SpeakerDiarization({ transcript }) {
  return (
    <div>
      {transcript.map((entry, index) => (
        <div key={index} className="mb-4">
          <strong>{entry.speaker}:</strong> {entry.text}
        </div>
      ))}
    </div>
  );
}

export default SpeakerDiarization;
