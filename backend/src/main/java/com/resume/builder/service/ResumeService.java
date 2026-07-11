package com.resume.builder.service;

import com.resume.builder.dto.ResumeDto;
import com.resume.builder.entity.Resume;
import com.resume.builder.entity.User;
import com.resume.builder.repository.ResumeRepository;
import com.resume.builder.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResumeDto createResume(ResumeDto dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = new Resume(
                dto.getTitle(),
                dto.getTemplateId(),
                user,
                dto.getContent()
        );

        resume = resumeRepository.save(resume);
        return convertToDto(resume);
    }

    @Transactional
    public ResumeDto updateResume(Long id, ResumeDto dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Resume not found or access denied"));

        resume.setTitle(dto.getTitle());
        resume.setTemplateId(dto.getTemplateId());
        resume.setContent(dto.getContent());

        resume = resumeRepository.save(resume);
        return convertToDto(resume);
    }

    @Transactional(readOnly = true)
    public ResumeDto getResume(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Resume not found or access denied"));

        return convertToDto(resume);
    }

    @Transactional(readOnly = true)
    public List<ResumeDto> getAllResumes(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return resumeRepository.findByUser(user)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteResume(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Resume not found or access denied"));

        resumeRepository.delete(resume);
    }

    private ResumeDto convertToDto(Resume resume) {
        return new ResumeDto(
                resume.getId(),
                resume.getTitle(),
                resume.getTemplateId(),
                resume.getContent(),
                resume.getUpdatedAt()
        );
    }
}
