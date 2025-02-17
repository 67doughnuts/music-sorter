import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getMetadata, createDirectory, moveFile, readDirectory, fileExists } from '../../src/services/fileService';
import { AppError } from '../../src/errors/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('fileService', () => {
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(__dirname, 'test-audio.flac');

    before(() => {
        // Setup test directory
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }
    });

    after(() => {
        // Cleanup test directory
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true });
        }
    });

    describe('getMetadata', () => {
        it('should extract metadata from a valid audio file', async () => {
            const metadata = await getMetadata(testFile);
            expect(metadata).to.have.property('albumartist').that.is.a('string');
            expect(metadata).to.have.property('album').that.is.a('string');
        });

        it('should throw AppError for non-existent file', async () => {
            try {
                await getMetadata('nonexistent.mp3');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                if (error instanceof AppError) {
                    expect(error.message).to.include('File not found');
                }
            }
        });
    });

    describe('createDirectory', () => {
        it('should create a new directory', () => {
            const newDir = path.join(testDir, 'new-dir');
            createDirectory(newDir);
            expect(fs.existsSync(newDir)).to.be.true;
        });

        it('should not throw error if directory already exists', () => {
            const existingDir = path.join(testDir, 'existing-dir');
            fs.mkdirSync(existingDir);
            expect(() => createDirectory(existingDir)).to.not.throw();
        });
    });

    describe('readDirectory', () => {
        it('should read contents of a directory', () => {
            const testSubDir = path.join(testDir, 'test-subdir');
            fs.mkdirSync(testSubDir);
            fs.writeFileSync(path.join(testSubDir, 'test.txt'), 'test');

            const contents = readDirectory(testSubDir);
            expect(contents).to.be.an('array');
            expect(contents).to.include('test.txt');
        });

        it('should throw AppError for non-existent directory', () => {
            expect(() => readDirectory('/nonexistent/path'))
                .to.throw(AppError)
                .with.property('message')
                .that.includes('Unable to read directory');
        });
    });

    describe('fileExists', () => {
        it('should return true for existing file', () => {
            const testFilePath = path.join(testDir, 'exists.txt');
            fs.writeFileSync(testFilePath, 'test');
            expect(fileExists(testFilePath)).to.be.true;
        });

        it('should return false for non-existent file', () => {
            expect(fileExists('/nonexistent/file.mp3')).to.be.false;
        });
    });

    describe('moveFile', () => {
        it('should move file to new location', () => {
            // Create a test file
            const sourceFile = path.join(testDir, 'source.txt');
            const targetFile = path.join(testDir, 'moved.txt');
            fs.writeFileSync(sourceFile, 'test content');

            moveFile(sourceFile, targetFile);

            expect(fileExists(targetFile)).to.be.true;
            expect(fileExists(sourceFile)).to.be.false;
            expect(fs.readFileSync(targetFile, 'utf-8')).to.equal('test content');
        });

        it('should throw AppError when source file does not exist', () => {
            expect(() => moveFile('/nonexistent/source.txt', path.join(testDir, 'target.txt')))
                .to.throw(AppError)
                .with.property('message')
                .that.includes('Unable to move file');
        });
    });
});
