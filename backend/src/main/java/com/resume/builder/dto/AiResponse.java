package com.resume.builder.dto;

public class AiResponse {
    private String result;

    public AiResponse() {
    }

    public AiResponse(String result) {
        this.result = result;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}
