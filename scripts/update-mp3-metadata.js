#!/usr/bin/env node

/**
 * Script to update MP3 metadata (ID3 tags) from episode markdown files.
 *
 * Usage: node scripts/update-mp3-metadata.js [episode-file.md]
 *
 * Requirements:
 *   - ffmpeg must be installed (brew install ffmpeg)
 *
 * This script reads the frontmatter from the markdown file and:
 *   1. Converts audio to V0 quality (VBR ~245kbps)
 *   2. Updates ID3 tags (title, artist)
 *   3. Adds chapter markers (ID3v2 CHAP frames)
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('No frontmatter found');

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];

  for (const line of lines) {
    if (line.match(/^\s*-\s+/)) {
      // Array item
      if (inArray) {
        const item = {};
        const itemMatch = line.match(/^\s*-\s+(.*)/);
        if (itemMatch) {
          // Check if it's a simple value or object start
          const keyVal = itemMatch[1].match(/^(\w+):\s*(.*)$/);
          if (keyVal) {
            item[keyVal[1]] = parseValue(keyVal[2]);
          }
        }
        arrayItems.push(item);
      }
    } else if (line.match(/^\s+\w+:/)) {
      // Nested property in array item
      if (inArray && arrayItems.length > 0) {
        const keyVal = line.match(/^\s+(\w+):\s*(.*)$/);
        if (keyVal) {
          arrayItems[arrayItems.length - 1][keyVal[1]] = parseValue(keyVal[2]);
        }
      }
    } else if (line.match(/^(\w+):/)) {
      // Save previous array if any
      if (inArray && currentKey) {
        frontmatter[currentKey] = arrayItems;
        arrayItems = [];
        inArray = false;
      }

      const keyVal = line.match(/^(\w+):\s*(.*)$/);
      if (keyVal) {
        currentKey = keyVal[1];
        const value = keyVal[2].trim();
        if (value === '') {
          // Could be start of array or empty
          inArray = true;
          arrayItems = [];
        } else {
          frontmatter[currentKey] = parseValue(value);
        }
      }
    }
  }

  // Save final array if any
  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayItems;
  }

  return frontmatter;
}

function parseValue(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function generateChapterMetadata(chapters, duration) {
  let metadata = `;FFMETADATA1
title=${chapters[0]?.title || 'Episode'}
`;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const startMs = chapter.start * 1000;
    const endMs = chapter.end ? chapter.end * 1000 : (chapters[i + 1]?.start * 1000 || duration * 1000);

    metadata += `
[CHAPTER]
TIMEBASE=1/1000
START=${startMs}
END=${endMs}
title=${chapter.title}
`;
  }

  return metadata;
}

async function updateMp3Metadata(mdPath) {
  // Read and parse markdown
  const content = readFileSync(mdPath, 'utf-8');
  const frontmatter = parseFrontmatter(content);

  console.log('Parsed frontmatter:', JSON.stringify(frontmatter, null, 2));

  // Validate required fields
  const required = ['title', 'audio', 'chapters'];
  const missing = required.filter(f => !frontmatter[f]);
  if (missing.length > 0) {
    console.error(`Missing required fields: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Resolve audio path
  const audioPath = join(projectRoot, 'static', frontmatter.audio);
  if (!existsSync(audioPath)) {
    console.error(`Audio file not found: ${audioPath}`);
    process.exit(1);
  }

  console.log(`\nUpdating: ${audioPath}`);
  console.log(`Title: ${frontmatter.title}`);
  console.log(`Artist: ${frontmatter.artist || 'Unknown'}`);
  console.log(`Chapters: ${frontmatter.chapters.length}`);

  // Generate chapter metadata file
  const metadataContent = generateChapterMetadata(frontmatter.chapters, frontmatter.duration);
  const metadataPath = join(projectRoot, 'scripts', '.temp-metadata.txt');
  writeFileSync(metadataPath, metadataContent);

  console.log('\nGenerated metadata:');
  console.log(metadataContent);

  // Create output path
  const outputPath = audioPath.replace('.mp3', '.temp.mp3');

  // Build ffmpeg command with V0 encoding (libmp3lame -q:a 0 = highest VBR quality ~245kbps)
  const ffmpegArgs = [
    '-i', `"${audioPath}"`,
    '-i', `"${metadataPath}"`,
    '-map_metadata', '1',
    '-map_chapters', '1',
    '-map', '0:a',
    '-c:a', 'libmp3lame',
    '-q:a', '0',
    '-id3v2_version', '3',
    '-metadata', `title="${frontmatter.title}"`,
    '-metadata', `artist="${frontmatter.artist || ''}"`,
    '-metadata', `album="From The Internet"`,
    `"${outputPath}"`
  ];

  console.log('\nEncoding to V0 quality (VBR ~245kbps)...');

  const cmd = `ffmpeg -y ${ffmpegArgs.join(' ')}`;
  console.log('\nRunning:', cmd);

  try {
    execSync(cmd, { stdio: 'inherit' });

    // Replace original with updated file
    unlinkSync(audioPath);
    execSync(`mv "${outputPath}" "${audioPath}"`);

    // Clean up metadata file
    unlinkSync(metadataPath);

    // Get new file size
    const { statSync } = await import('fs');
    const newSize = statSync(audioPath).size;
    console.log(`\nSuccess! MP3 encoded to V0 with chapters and metadata.`);
    console.log(`New file size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('Error running ffmpeg:', error.message);
    console.error('\nMake sure ffmpeg is installed: brew install ffmpeg');
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/update-mp3-metadata.js <episode.md>');
  console.log('Example: node scripts/update-mp3-metadata.js src/content/episodes/01-episode-1.md');
  process.exit(1);
}

const mdPath = args[0].startsWith('/') ? args[0] : join(process.cwd(), args[0]);
updateMp3Metadata(mdPath);
