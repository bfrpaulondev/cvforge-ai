"use client";

import { useState, useCallback } from "react";

/**
 * Hook para fazer parse de arquivos de CV (PDF, DOCX, TXT)
 * no client-side.
 */
export function useFileUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      const fileName = file.name.toLowerCase();
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        throw new Error("File too large. Maximum size is 5MB.");
      }

      let text = "";

      if (fileName.endsWith(".txt")) {
        // TXT: ler diretamente
        text = await file.text();
      } else if (fileName.endsWith(".pdf")) {
        // PDF: usar pdfjs-dist
        text = await parsePDF(file);
      } else if (fileName.endsWith(".docx")) {
        // DOCX: usar mammoth
        text = await parseDOCX(file);
      } else if (fileName.endsWith(".doc")) {
        // .doc (legacy) — não suportado pelo mammoth no browser
        throw new Error(
          "Legacy .doc files are not supported. Please save as .docx or .pdf and try again."
        );
      } else {
        throw new Error(
          "Unsupported file format. Please upload PDF, DOCX, or TXT files."
        );
      }

      if (!text || text.trim().length < 20) {
        throw new Error(
          "Could not extract text from file. The file may be empty or scanned (image-based PDFs are not supported)."
        );
      }

      return text.trim();
    } catch (err: any) {
      setError(err.message || "Failed to process file");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processFile, isProcessing, error, setError };
}

async function parsePDF(file: File): Promise<string> {
  try {
    // Configurar worker via CDN (mais compatível com Vercel/serverless)
    const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
    
    // Usar CDN worker URL (funciona em qualquer ambiente)
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  } catch (err: any) {
    // Fallback: tentar sem worker (main thread)
    try {
      const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "";
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }
      return fullText;
    } catch (err2: any) {
      throw new Error(`Failed to parse PDF: ${err2.message}. Try saving as .docx or .txt instead.`);
    }
  }
}

async function parseDOCX(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth/mammoth.browser");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (err: any) {
    throw new Error(`Failed to parse DOCX: ${err.message}`);
  }
}
