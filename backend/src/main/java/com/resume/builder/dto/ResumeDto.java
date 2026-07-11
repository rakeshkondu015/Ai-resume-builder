package com.resume.builder.dto;

import java.time.LocalDateTime;

public class ResumeDto {
    private Long id;
    private String title;
    private String templateId;
    private String content; // JSON String
    private LocalDateTime updatedAt;

    public ResumeDto() {
    }

    public ResumeDto(Long id, String title, String templateId, String content, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.templateId = templateId;
        this.content = content;
        this.updatedAt = updatedAt;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
