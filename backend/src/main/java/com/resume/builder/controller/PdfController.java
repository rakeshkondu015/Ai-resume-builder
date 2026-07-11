package com.resume.builder.controller;

import com.resume.builder.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(@RequestBody Map<String, String> payload) {
        String htmlContent = payload.get("html");
        if (htmlContent == null || htmlContent.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("HTML content is required".getBytes());
        }

        // Clean up or wrap HTML to ensure well-formed XML for Flying Saucer
        String wellFormedHtml = prepareHtmlForPdf(htmlContent);

        byte[] pdfBytes = pdfService.generatePdfFromHtml(wellFormedHtml);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "resume.pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    private String prepareHtmlForPdf(String html) {
        // Flying Saucer requires well-formed XML.
        // Ensure standard HTML structure with closing tags if missing.
        // Also ensure XML declaration or correct HTML tags.
        String cleanHtml = html;
        if (!cleanHtml.contains("<html")) {
            cleanHtml = "<html><head><meta charset=\"UTF-8\" /><style>body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; }</style></head><body>" + cleanHtml + "</body></html>";
        }
        
        // Quick fixes for common non-XML features (like unclosed meta/br tags)
        cleanHtml = cleanHtml.replaceAll("<br>", "<br/>");
        cleanHtml = cleanHtml.replaceAll("<hr>", "<hr/>");
        cleanHtml = cleanHtml.replaceAll("<img>", "<img/>");
        
        return cleanHtml;
    }
}
