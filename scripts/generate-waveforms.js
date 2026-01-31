#!/usr/bin/env node

/**
 * Generate waveform peaks data from audio files for wavesurfer.js.
 *
 * Requires: audiowaveform (brew install audiowaveform)
 *
 * Usage: node scripts/generate-waveforms.js
 *
 * Outputs JSON files with peaks data that wavesurfer.js can load directly,
 * avoiding the need to decode audio in the browser.
 */

import { execSync } from 'child_process';
import { readdirSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const AUDIO_DIR = 'static/audio';
const WAVEFORM_DIR = 'static/waveforms';

// Check for audiowaveform
try {
  execSync('which audiowaveform', { stdio: 'ignore' });
} catch {
  console.log('audiowaveform not found. Install with: brew install audiowaveform');
  console.log('Skipping waveform generation.');
  process.exit(0);
}

mkdirSync(WAVEFORM_DIR, { recursive: true });

const audioFiles = readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));

if (audioFiles.length === 0) {
  console.log('No MP3 files found in', AUDIO_DIR);
  process.exit(0);
}

console.log(`Found ${audioFiles.length} audio file(s)\n`);

for (const file of audioFiles) {
  const inputPath = join(AUDIO_DIR, file);
  const outputName = basename(file, '.mp3') + '.json';
  const outputPath = join(WAVEFORM_DIR, outputName);

  console.log(`Processing: ${file}`);

  try {
    // Generate waveform data as JSON
    // --pixels-per-second: resolution (higher = more detail, larger file)
    // --bits: 8-bit is sufficient for visualization
    // Output format is determined by file extension (.json)
    execSync(
      `audiowaveform -i "${inputPath}" -o "${outputPath}" --pixels-per-second 10 --bits 8`,
      { stdio: 'inherit' }
    );

    // Read the generated file and convert to wavesurfer.js format
    const rawData = JSON.parse(readFileSync(outputPath, 'utf-8'));

    // audiowaveform outputs { version, channels, sample_rate, samples_per_pixel, bits, length, data }
    // wavesurfer.js expects just an array of peaks (normalized -1 to 1)
    // The data array alternates min/max values, we'll normalize them
    const peaks = [];
    const maxVal = Math.pow(2, rawData.bits - 1); // 128 for 8-bit

    for (let i = 0; i < rawData.data.length; i += 2) {
      const min = rawData.data[i] / maxVal;
      const max = rawData.data[i + 1] / maxVal;
      // Use the max absolute value for each sample
      peaks.push(Math.abs(max) > Math.abs(min) ? max : min);
    }

    // Write wavesurfer-compatible format
    const wavesurferData = {
      duration: rawData.length / rawData.sample_rate * rawData.samples_per_pixel,
      peaks: [peaks]
    };

    writeFileSync(outputPath, JSON.stringify(wavesurferData));

    console.log(`  Output: ${outputPath} (${peaks.length} samples)\n`);
  } catch (error) {
    console.error(`  Error processing ${file}:`, error.message, '\n');
  }
}

console.log('Done!');
