package com.resume.builder.service;

import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public byte[] generatePdfFromHtml(String htmlContent) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            
            // Flying Saucer expects well-formed XML/HTML
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(os);
            
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error during PDF generation: " + e.getMessage(), e);
        }
    }
}
