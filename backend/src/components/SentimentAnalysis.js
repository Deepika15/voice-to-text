import React from 'react';

function SentimentAnalysis({ sentiment }) {
  return (
    <div>
      <h2 className="text-xl font-bold">Sentiment Analysis</h2>
      <p>{`Overall Sentiment: ${sentiment}`}</p>
    </div>
  );
}

export default SentimentAnalysis;
