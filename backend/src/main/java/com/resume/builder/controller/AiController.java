package com.resume.builder.controller;

import com.resume.builder.dto.AiRequest;
import com.resume.builder.dto.AiResponse;
import com.resume.builder.dto.CoverLetterRequest;
import com.resume.builder.entity.CoverLetter;
import com.resume.builder.entity.User;
import com.resume.builder.repository.CoverLetterRepository;
import com.resume.builder.repository.UserRepository;
import com.resume.builder.service.MistralAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final MistralAiService aiService;
    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;

    public AiController(MistralAiService aiService,
                        CoverLetterRepository coverLetterRepository,
                        UserRepository userRepository) {
        this.aiService = aiService;
        this.coverLetterRepository = coverLetterRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/suggest")
    public ResponseEntity<AiResponse> suggest(@Valid @RequestBody AiRequest request) {
        String result = aiService.generateAiSuggestion(request.getType(), request.getText(), request.getJobTitle());
        return ResponseEntity.ok(new AiResponse(result));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<CoverLetter> generateCoverLetter(@Valid @RequestBody CoverLetterRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String letterContent = aiService.generateCoverLetter(request.getJobDescription(), request.getResumeContent());

        CoverLetter coverLetter = new CoverLetter(
                request.getTitle(),
                request.getJobDescription(),
                letterContent,
                user
        );

        coverLetter = coverLetterRepository.save(coverLetter);
        return ResponseEntity.ok(coverLetter);
    }

    @GetMapping("/cover-letters")
    public ResponseEntity<List<CoverLetter>> getCoverLetters() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(coverLetterRepository.findByUser(user));
    }

    @DeleteMapping("/cover-letters/{id}")
    public ResponseEntity<Void> deleteCoverLetter(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CoverLetter coverLetter = coverLetterRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Cover letter not found or access denied"));

        coverLetterRepository.delete(coverLetter);
        return ResponseEntity.noContent().build();
    }
}
