package com.resume.builder.repository;

import com.resume.builder.entity.CoverLetter;
import com.resume.builder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {
    List<CoverLetter> findByUser(User user);
    Optional<CoverLetter> findByIdAndUser(Long id, User user);
}
