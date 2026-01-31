#!/usr/bin/env node

/**
 * Generate waveform peaks from audio files for fast WaveSurfer.js rendering.
 *
 * Usage: node scripts/generate-peaks.js
 *
 * Outputs JSON files to static/peaks/ directory.
 * Skips gracefully if ffmpeg is not installed (for Vercel deploys).
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';

// Check if ffmpeg is available
try {
  execSync('which ffmpeg', { stdio: 'ignore' });
} catch {
  console.log('ffmpeg not found, skipping peak generation (using committed files)');
  process.exit(0);
}

const AUDIO_DIR = 'static/audio';
const PEAKS_DIR = 'static/peaks';
const SAMPLES_PER_SECOND = 10; // How many peak samples per second of audio

// Ensure peaks directory exists
mkdirSync(PEAKS_DIR, { recursive: true });

// Get all MP3 files
const audioFiles = readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));

if (audioFiles.length === 0) {
  console.log('No MP3 files found in', AUDIO_DIR);
  process.exit(0);
}

console.log(`Found ${audioFiles.length} audio file(s)\n`);

for (const file of audioFiles) {
  const inputPath = join(AUDIO_DIR, file);
  const outputName = basename(file, '.mp3') + '.json';
  const outputPath = join(PEAKS_DIR, outputName);

  console.log(`Processing: ${file}`);

  try {
    // Use ffmpeg to extract raw PCM data and compute peaks
    // -i: input file
    // -ac 1: convert to mono
    // -ar 8000: sample at 8kHz (enough for visualization)
    // -f f32le: output as 32-bit floats, little endian
    // -: output to stdout
    const rawData = execSync(
      `ffmpeg -i "${inputPath}" -ac 1 -ar 8000 -f f32le - 2>/dev/null`,
      { maxBuffer: 100 * 1024 * 1024 } // 100MB buffer
    );

    // Convert buffer to Float32Array
    const samples = new Float32Array(rawData.buffer, rawData.byteOffset, rawData.length / 4);

    // Calculate how many samples per peak
    const samplesPerPeak = Math.floor(8000 / SAMPLES_PER_SECOND);
    const numPeaks = Math.ceil(samples.length / samplesPerPeak);

    // Extract peaks (max absolute value in each chunk)
    const peaks = [];
    for (let i = 0; i < numPeaks; i++) {
      const start = i * samplesPerPeak;
      const end = Math.min(start + samplesPerPeak, samples.length);

      let max = 0;
      for (let j = start; j < end; j++) {
        const abs = Math.abs(samples[j]);
        if (abs > max) max = abs;
      }

      // Round to 3 decimal places to save space
      peaks.push(Math.round(max * 1000) / 1000);
    }

    // Normalize peaks to 0-1 range
    const maxPeak = Math.max(...peaks);
    const normalizedPeaks = peaks.map(p => Math.round((p / maxPeak) * 1000) / 1000);

    // Write peaks file
    writeFileSync(outputPath, JSON.stringify(normalizedPeaks));

    const duration = samples.length / 8000;
    console.log(`  Duration: ${Math.round(duration)}s`);
    console.log(`  Peaks: ${normalizedPeaks.length}`);
    console.log(`  Output: ${outputPath}\n`);

  } catch (error) {
    console.error(`  Error processing ${file}:`, error.message);
    console.error('  Make sure ffmpeg is installed: brew install ffmpeg\n');
  }
}

console.log('Done!');
