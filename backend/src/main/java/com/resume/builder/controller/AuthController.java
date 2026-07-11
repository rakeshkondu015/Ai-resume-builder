package com.resume.builder.controller;

import com.resume.builder.dto.AuthRequest;
import com.resume.builder.dto.AuthResponse;
import com.resume.builder.dto.RegisterRequest;
import com.resume.builder.entity.User;
import com.resume.builder.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/subscription")
    public ResponseEntity<String> updateSubscription(@RequestParam String plan) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        authService.updateSubscription(auth.getName(), plan);
        return ResponseEntity.ok("Subscription updated to " + plan);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(new AuthResponse(
                null, // Don't re-send token on status check unless refreshed
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getSubscription()
        ));
    }
}
