const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Function to convert .mp4 to .mp3
function convertMp4ToMp3(inputFile, outputFile) {
    ffmpeg(inputFile)
        .toFormat('mp3') // Specify mp3 format
        .on('end', () => {
            console.log(`Conversion complete: ${outputFile}`);
        })
        .on('error', (err) => {
            console.error('Error during conversion: ', err);
        })
        .save(outputFile); // Save to the output file path
}

// Function to convert .mp4 to .wav
function convertMp4ToWav(inputFile, outputFile) {
    ffmpeg(inputFile)
        .toFormat('wav') // Specify wav format
        .on('end', () => {
            console.log(`Conversion complete: ${outputFile}`);
        })
        .on('error', (err) => {
            console.error('Error during conversion: ', err);
        })
        .save(outputFile); // Save to the output file path
}

// Example usage
const inputFile = path.resolve(__dirname, 'japanese_recording.mp4'); // Path to your .mp4 file
const mp3Output = path.resolve(__dirname, 'output_audio.mp3'); // Output .mp3 file path
const wavOutput = path.resolve(__dirname, 'output_audio.wav'); // Output .wav file path

// Convert to .mp3
convertMp4ToMp3(inputFile, mp3Output);

// Convert to .wav
convertMp4ToWav(inputFile, wavOutput);
