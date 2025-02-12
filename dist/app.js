"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = __importStar(require("path"));
const mm = __importStar(require("music-metadata"));
// Define your source directory (unsorted music) and destination directory (sorted files)
const sourceDir = '/data/data/com.termux/files/home/storage/shared/Music/Telegram'; // Make sure this folder exists and contains your music files.
const destDir = '/data/data/com.termux/files/home/storage/shared/Music/Telegram/sorted-music'; // Files will be moved here organized by album artist and album.
// Helper function to recursively gather all music files from the source directory.
function getMusicFiles(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = [];
        const dirents = yield fs_1.promises.readdir(dir, { withFileTypes: true });
        for (const dirent of dirents) {
            const fullPath = path.join(dir, dirent.name);
            if (dirent.isDirectory()) {
                files = files.concat(yield getMusicFiles(fullPath));
            }
            else if (/\.(mp3|flac|m4a|aac)$/i.test(dirent.name)) {
                files.push(fullPath);
            }
        }
        return files;
    });
}
// Sanitize strings for safe folder/file names by removing illegal characters.
function sanitize(input) {
    return input.replace(/[\/\\?%*:|"<>]/g, '-');
}
// Main function that processes each music file.
function sortMusicFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield getMusicFiles(sourceDir);
            for (const file of files) {
                console.log(`Processing file: ${file}`);
                try {
                    // Parse the file's metadata.
                    const metadata = yield mm.parseFile(file);
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
                    yield fs_1.promises.mkdir(targetDir, { recursive: true });
                    // Construct the destination file path.
                    const destPath = path.join(targetDir, path.basename(file));
                    // Move the file to the new location.
                    yield fs_1.promises.rename(file, destPath);
                    console.log(`Moved file to: ${destPath}`);
                }
                catch (err) {
                    console.error(`Error processing file ${file}:`, err);
                }
            }
        }
        catch (err) {
            console.error('Error reading music files:', err);
        }
    });
}
// Start the sorting process.
sortMusicFiles();
//# sourceMappingURL=app.js.map