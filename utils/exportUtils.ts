import { TranscriptionResult } from '../types';
import { jsPDF } from 'jspdf';

/**
 * Helper to trigger download of a Blob
 */
export const downloadBlob = (content: Blob, filename: string) => {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports transcription to a TXT file
 */
export const exportToTXT = (data: TranscriptionResult, filename: string) => {
  const blob = new Blob([data.text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
};

/**
 * Exports transcription to a fake DOC file (HTML)
 * This is a common web-only workaround for DOCX without heavy libraries
 */
export const exportToDOCX = (data: TranscriptionResult, filename: string) => {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; }
        p { margin-bottom: 10pt; }
      </style>
    </head>
    <body>
      ${data.text.replace(/\n/g, '<p>')}
    </body>
    </html>`;
  
  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  downloadBlob(blob, `${filename}.doc`);
};

/**
 * Exports transcription to SRT subtitle format
 */
export const exportToSRT = (data: TranscriptionResult, filename: string) => {
  if (!data.segments || data.segments.length === 0) {
    alert("Dados de tempo não disponíveis para exportação SRT. A transcrição não possui segmentos temporais.");
    return;
  }
  
  let srtContent = '';
  
  // Helper to ensure time format is HH:MM:SS,mmm
  const formatTimestamp = (timeStr: string) => {
    if (!timeStr) return "00:00:00,000";
    // Assuming format might be MM:SS or HH:MM:SS or with dot
    let clean = timeStr.replace('.', ',');
    if (!clean.includes(',')) clean += ',000';
    // Basic padding check (simplistic)
    return clean;
  };

  data.segments.forEach((seg, index) => {
    srtContent += `${index + 1}\n`;
    srtContent += `${formatTimestamp(seg.startTime)} --> ${formatTimestamp(seg.endTime)}\n`;
    srtContent += `${seg.text}\n\n`;
  });

  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.srt`);
};

/**
 * Exports transcription to PDF using jsPDF
 */
export const exportToPDF = (data: TranscriptionResult, filename: string) => {
  try {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Transcrição", margin, margin);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em ${new Date().toLocaleDateString()} via Audio Scribe AI`, margin, margin + 8);
    
    doc.setTextColor(0);
    doc.setFontSize(12);
    
    // Split text to fit page width
    const splitText = doc.splitTextToSize(data.text, maxLineWidth);
    
    // Add text with pagination
    let cursorY = margin + 20;
    const lineHeight = 7;
    
    for (let i = 0; i < splitText.length; i++) {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(splitText[i], margin, cursorY);
      cursorY += lineHeight;
    }
    
    doc.save(`${filename}.pdf`);
  } catch (e) {
    console.error("PDF generation error", e);
    alert("Erro ao gerar PDF.");
  }
};