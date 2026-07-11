package com.resume.builder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MistralAiService {

    @Value("${mistral.api.key}")
    private String apiKey;

    @Value("${mistral.api.url}")
    private String apiUrl;

    @Value("${mistral.model}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateAiSuggestion(String type, String text, String jobTitle) {
        if (!StringUtils.hasText(apiKey) || apiKey.equals("YOUR_MISTRAL_API_KEY")) {
            return getSimulatedSuggestion(type, text, jobTitle);
        }

        String prompt = buildPrompt(type, text, jobTitle);
        try {
            return callMistralApi(prompt);
        } catch (Exception e) {
            System.err.println("Mistral AI Call failed, using simulated response. Error: " + e.getMessage());
            return getSimulatedSuggestion(type, text, jobTitle);
        }
    }

    public String generateCoverLetter(String jobDescription, String resumeContent) {
        if (!StringUtils.hasText(apiKey) || apiKey.equals("YOUR_MISTRAL_API_KEY")) {
            return getSimulatedCoverLetter(jobDescription, resumeContent);
        }

        String prompt = "Write a highly professional and tailored cover letter based on the following job description and candidate information.\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Candidate Information (Resume):\n" + (StringUtils.hasText(resumeContent) ? resumeContent : "Not provided.") + "\n\n" +
                "Make it engaging, structured, and emphasize matching skills and achievements. Return ONLY the cover letter text.";
        try {
            return callMistralApi(prompt);
        } catch (Exception e) {
            System.err.println("Mistral AI Call failed, using simulated cover letter. Error: " + e.getMessage());
            return getSimulatedCoverLetter(jobDescription, resumeContent);
        }
    }

    private String callMistralApi(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("temperature", 0.7);

        String jsonRequest = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("choices").get(0).path("message").path("content").asText().trim();
    }

    private String buildPrompt(String type, String text, String jobTitle) {
        switch (type.toLowerCase()) {
            case "summary":
                return "Write a premium 3-4 sentence professional summary/profile for a resume based on these achievements/skills: '" + text + "'" +
                        (StringUtils.hasText(jobTitle) ? " targeted for the role of: " + jobTitle : "") + ". Make it punchy and impactful.";
            case "improve":
                return "Optimize this resume work experience bullet point to use strong action verbs, quantify achievements, and sound highly professional: '" + text + "'." +
                        (StringUtils.hasText(jobTitle) ? " targeted for: " + jobTitle : "") + ". Return only the improved bullet point.";
            case "ats":
                return "Analyze this text: '" + text + "' and return a comma-separated list of the top 10 relevant professional skills and ATS keywords to include on a resume" +
                        (StringUtils.hasText(jobTitle) ? " targeted for: " + jobTitle : "") + ". Return ONLY the comma-separated list.";
            default:
                return "Refine the following text to sound more professional: '" + text + "'";
        }
    }

    // Simulated responses when API Key is not set or errors occur
    private String getSimulatedSuggestion(String type, String text, String jobTitle) {
        String role = StringUtils.hasText(jobTitle) ? jobTitle : "Software Engineer";
        switch (type.toLowerCase()) {
            case "summary":
                return "Dynamic and results-driven " + role + " with a proven track record of designing, building, and deploying highly scalable software solutions. Expert in full-stack architecture, performance optimization, and implementing automated workflows to maximize efficiency. Adept at collaborating across cross-functional teams to align technology initiatives with business objectives.";
            case "improve":
                return "Spearheaded the development and optimization of core software modules, resulting in a 35% reduction in latency and a 20% increase in database query performance.";
            case "ats":
                return "Full Stack Development, Microservices Architecture, Cloud Computing (AWS), RESTful APIs, Database Design, System Integration, CI/CD Pipelines, Agile Methodologies, Automated Testing, Technical Leadership";
            default:
                return "Enhanced: " + text + " with professional terms.";
        }
    }

    private String getSimulatedCoverLetter(String jobDescription, String resumeContent) {
        return "[Your Name]\n" +
                "[Your Address]\n" +
                "[Your Phone Number] | [Your Email]\n\n" +
                "Dear Hiring Manager,\n\n" +
                "I am writing to express my strong interest in the open position details mentioned in your job description. With my strong background in software development and technical architecture, I am confident in my ability to make an immediate impact on your engineering team.\n\n" +
                "Throughout my career, I have specialized in building robust, scalable web applications and designing efficient database systems. In my previous roles, I have demonstrated a consistent ability to work under tight schedules and collaborate with diverse teams to ship high-quality products. Your requirements match perfectly with my expertise, including API development, Cloud infrastructure management, and technical troubleshooting.\n\n" +
                "I am particularly drawn to your organization's commitment to building state-of-the-art software products, and I would love the opportunity to contribute my skills to your ongoing success. Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications with you in more detail.\n\n" +
                "Sincerely,\n\n" +
                "Candidate Name";
    }
}
