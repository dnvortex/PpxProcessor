import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { isImageFile, extractTextFromImage } from './ocr';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Import pdf-parse with a dynamic import to avoid the test file requirement
const pdfParsePromise = import('pdf-parse').catch(err => {
  console.error('Error importing pdf-parse:', err);
  return { default: null };
});

// Function to extract text from DOCX files
export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

// Function to extract text from PDF files
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Get the pdf-parse module
    const pdfParseModule = await pdfParsePromise;
    
    if (!pdfParseModule || !pdfParseModule.default) {
      console.warn('PDF parsing module not available, returning placeholder text');
      return `PDF content from: ${path.basename(filePath)}`;
    }
    
    const pdfParse = pdfParseModule.default;
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Provide a fallback approach if pdf-parse fails
    return `PDF content from: ${path.basename(filePath)} (extraction failed)`;
  }
}

// Function to extract text from PPT files (through PPTX.js or similar)
export async function extractTextFromPpt(filePath: string): Promise<string> {
  // This would typically use a library like PPTX.js or similar
  // For now, implement a basic placeholder
  try {
    // This is a placeholder - in a real implementation, you'd use a proper PPT parsing library
    return "PPT extraction would happen here with a proper PPT parsing library";
  } catch (error) {
    console.error('Error extracting text from PPT:', error);
    throw new Error('Failed to extract text from PPT file');
  }
}

// Function to read plain text files
export async function readTextFile(filePath: string): Promise<string> {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error('Failed to read text file');
  }
}

// Function to process any type of file and extract text
export async function processFile(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return await extractTextFromPdf(filePath);
    case '.docx':
    case '.doc':
      return await extractTextFromDocx(filePath);
    case '.pptx':
    case '.ppt':
    case '.ppx':
      return await extractTextFromPpt(filePath);
    case '.txt':
      return await readTextFile(filePath);
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.bmp':
      return await extractTextFromImage(filePath);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

// Function to create a PDF from text content
export async function createPdfFromText(text: string, title: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  const titleFontSize = 20;
  const fontSize = 12;
  const lineHeight = 1.2 * fontSize;
  
  // Add title
  page.drawText(title, {
    x: margin,
    y: height - margin - titleFontSize,
    size: titleFontSize,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Add content
  const contentLines = [];
  let currentLine = '';
  const maxLineWidth = width - 2 * margin;
  const words = text.split(' ');
  
  for (const word of words) {
    const potentialLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
    const lineWidth = timesRomanFont.widthOfTextAtSize(potentialLine, fontSize);
    
    if (lineWidth <= maxLineWidth) {
      currentLine = potentialLine;
    } else {
      contentLines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    contentLines.push(currentLine);
  }
  
  for (let i = 0; i < contentLines.length; i++) {
    const y = height - margin - titleFontSize - 20 - i * lineHeight;
    
    if (y < margin) {
      // Add a new page when we reach the bottom margin
      const newPage = pdfDoc.addPage();
      for (let j = i; j < contentLines.length; j++) {
        const newY = height - margin - (j - i) * lineHeight;
        
        if (newY < margin) {
          // Continue on yet another page
          i = j - 1;
          break;
        }
        
        newPage.drawText(contentLines[j], {
          x: margin,
          y: newY,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        
        if (j === contentLines.length - 1) {
          i = contentLines.length;
        }
      }
    } else {
      page.drawText(contentLines[i], {
        x: margin,
        y,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
    }
  }
  
  return await pdfDoc.save();
}
