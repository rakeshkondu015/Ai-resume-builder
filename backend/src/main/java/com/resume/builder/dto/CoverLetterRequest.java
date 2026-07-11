package com.resume.builder.dto;

import jakarta.validation.constraints.NotBlank;

public class CoverLetterRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String jobDescription;

    private String resumeContent; // Optional resume content to align Cover Letter

    public CoverLetterRequest() {
    }

    public CoverLetterRequest(String title, String jobDescription, String resumeContent) {
        this.title = title;
        this.jobDescription = jobDescription;
        this.resumeContent = resumeContent;
    }

    // Getters & Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getResumeContent() {
        return resumeContent;
    }

    public void setResumeContent(String resumeContent) {
        this.resumeContent = resumeContent;
    }
}
