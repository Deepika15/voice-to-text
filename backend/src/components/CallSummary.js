import React from 'react';

function CallSummary({ callSummary }) {
  return (
    <div>
      <h2 className="text-xl font-bold">Call Summary</h2>
      <p>{callSummary}</p>
    </div>
  );
}

export default CallSummary;
