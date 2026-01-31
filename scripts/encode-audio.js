#!/usr/bin/env node

/**
 * Encode audio files to MP3 format optimized for web streaming.
 *
 * Usage: node scripts/encode-audio.js <input.wav> <output-name>
 * Example: node scripts/encode-audio.js "Episode 1.wav" 01-episode-1
 *
 * Settings:
 * - 256kbps CBR for consistent quality
 * - Xing header for accurate seeking
 * - 44.1kHz stereo
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const input = process.argv[2];
const outputName = process.argv[3];

if (!input || !outputName) {
  console.log('Usage: node scripts/encode-audio.js <input.wav> <output-name>');
  console.log('Example: node scripts/encode-audio.js "Episode 1.wav" 01-episode-1');
  process.exit(1);
}

if (!existsSync(input)) {
  console.error(`Input file not found: ${input}`);
  process.exit(1);
}

const output = `static/audio/${outputName}.mp3`;

console.log(`Encoding: ${input} -> ${output}`);
console.log('Settings: 256kbps, 44.1kHz, stereo, Xing header for seeking\n');

try {
  execSync(
    `ffmpeg -y -i "${input}" -c:a libmp3lame -b:a 256k -ar 44100 -ac 2 -write_xing 1 "${output}"`,
    { stdio: 'inherit' }
  );
  console.log(`\nDone: ${output}`);
} catch (error) {
  console.error('Encoding failed:', error.message);
  process.exit(1);
}
