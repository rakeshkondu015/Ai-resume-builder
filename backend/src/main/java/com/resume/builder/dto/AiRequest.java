package com.resume.builder.dto;

import jakarta.validation.constraints.NotBlank;

public class AiRequest {

    @NotBlank
    private String type; // e.g. "summary", "improve", "ats"

    @NotBlank
    private String text; // Context or raw text to be improved

    private String jobTitle; // Optional job title for target optimization

    public AiRequest() {
    }

    public AiRequest(String type, String text, String jobTitle) {
        this.type = type;
        this.text = text;
        this.jobTitle = jobTitle;
    }

    // Getters & Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
}
