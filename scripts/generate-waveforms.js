#!/usr/bin/env node

/**
 * Generate waveform images from audio files.
 *
 * Requires: ffmpeg and audiowaveform (brew install audiowaveform)
 *
 * Usage: node scripts/generate-waveforms.js
 */

import { execSync } from 'child_process';
import { readdirSync, mkdirSync } from 'fs';
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
  const outputName = basename(file, '.mp3') + '.png';
  const outputPath = join(WAVEFORM_DIR, outputName);

  console.log(`Processing: ${file}`);

  try {
    // Generate waveform image
    // --width: image width
    // --height: image height
    // --colors: waveform color
    // --background-color: transparent
    // --no-axis-labels: cleaner look
    execSync(
      `audiowaveform -i "${inputPath}" -o "${outputPath}" --width 1200 --height 120 --colors audacity --background-color 00000000 --waveform-color 888888 --no-axis-labels`,
      { stdio: 'inherit' }
    );

    console.log(`  Output: ${outputPath}\n`);
  } catch (error) {
    console.error(`  Error processing ${file}:`, error.message, '\n');
  }
}

console.log('Done!');
