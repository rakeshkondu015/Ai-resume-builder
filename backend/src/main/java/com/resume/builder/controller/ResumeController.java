package com.resume.builder.controller;

import com.resume.builder.dto.ResumeDto;
import com.resume.builder.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    public ResponseEntity<ResumeDto> createResume(@RequestBody ResumeDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(resumeService.createResume(dto, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeDto> updateResume(@PathVariable Long id, @RequestBody ResumeDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(resumeService.updateResume(id, dto, auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDto> getResume(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(resumeService.getResume(id, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ResumeDto>> getAllResumes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(resumeService.getAllResumes(auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        resumeService.deleteResume(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
