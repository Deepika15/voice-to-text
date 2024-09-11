import React, { useState } from 'react';

function AudioUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setLoading(false);
    onUpload(data, URL.createObjectURL(file));
  };

  return (
    <div className="mb-8">
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 rounded w-full mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        disabled={!file || loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div className="bg-blue-500 h-4 rounded-full animate-progress"></div>
        </div>
      )}
    </div>
  );
}

export default AudioUpload;
