// helpers/pdfWatermark.js
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

export async function addPdfWatermark(inputPdfPath : string, outputPdfPath : string, watermarkText : string): Promise<void> {
  const existingPdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();

    const fontSize = 36;
    const xSpacing = 150;
    const ySpacing = 100;

    for (let x = -width; x < width * 2; x += xSpacing) {
      for (let y = -height; y < height * 2; y += ySpacing) {
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          color: rgb(0.8, 0.8, 0.8),
          rotate: degrees(45),
          opacity: 0.3,
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
}