import { promises as fs } from 'fs';
import * as path from 'path';
import * as mm from 'music-metadata';

// Define your source directory (unsorted music) and destination directory (sorted files)
const sourceDir = '/data/data/com.termux/files/home/storage/shared/Music/Telegram';       // Make sure this folder exists and contains your music files.
const destDir = '/data/data/com.termux/files/home/storage/shared/Music/Telegram/sorted-music';  // Files will be moved here organized by album artist and album.

// Helper function to recursively gather all music files from the source directory.
async function getMusicFiles(dir: string): Promise<string[]> {
  let files: string[] = [];
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files = files.concat(await getMusicFiles(fullPath));
    } else if (/\.(mp3|flac|m4a|aac)$/i.test(dirent.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Sanitize strings for safe folder/file names by removing illegal characters.
function sanitize(input: string): string {
  return input.replace(/[\/\\?%*:|"<>]/g, '-');
}

// Main function that processes each music file.
async function sortMusicFiles() {
  try {
    const files = await getMusicFiles(sourceDir);
    for (const file of files) {
      console.log(`Processing file: ${file}`);
      try {
        // Parse the file's metadata.
        const metadata = await mm.parseFile(file);
        const common = metadata.common;
        
        // Determine album artist; if missing, fallback to artist or 'Unknown Artist'.
        let albumArtist = common.albumartist || common.artist || 'Unknown Artist';
        if (Array.isArray(albumArtist)) {
          albumArtist = albumArtist.join(', ');
        }
        
        // Determine album name; default to 'Unknown Album' if not available.
        const albumName = common.album || 'Unknown Album';
        
        // Create the target directory based on album artist and album name.
        const targetDir = path.join(destDir, sanitize(albumArtist), sanitize(albumName));
        await fs.mkdir(targetDir, { recursive: true });
        
        // Construct the destination file path.
        const destPath = path.join(targetDir, path.basename(file));
        
        // Move the file to the new location.
        await fs.rename(file, destPath);
        console.log(`Moved file to: ${destPath}`);
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }
  } catch (err) {
    console.error('Error reading music files:', err);
  }
}

// Start the sorting process.
sortMusicFiles();

