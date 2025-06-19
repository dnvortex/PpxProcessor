import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

// Function to extract text from an image using OCR
export async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      filePath,
      'eng', // Use English language
      {
        logger: m => {
          if (process.env.NODE_ENV !== 'production') {
            console.log(m);
          }
        }
      }
    );

    return result.data.text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to extract text from image');
  }
}

// Function to process multiple images in a directory
export async function processImagesInDirectory(directoryPath: string): Promise<string[]> {
  try {
    const files = fs.readdirSync(directoryPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    const textPromises = imageFiles.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      return await extractTextFromImage(filePath);
    });

    return await Promise.all(textPromises);
  } catch (error) {
    console.error('Error processing images directory:', error);
    throw new Error('Failed to process images directory');
  }
}

// Function to check if a file is an image
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}
