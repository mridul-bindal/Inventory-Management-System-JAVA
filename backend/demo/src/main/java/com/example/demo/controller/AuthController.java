package com.example.demo.controller;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.model.User;
import com.example.demo.Service.UserService;
import com.example.demo.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    public AuthController(UserService userService, JwtUtil jwtUtil) { this.userService = userService; this.jwtUtil = jwtUtil; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            System.out.println("Received registration request: " + req.getEmail());
            User u = userService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    java.util.Map.of(
                        "id", u.getId(), 
                        "email", u.getEmail(), 
                        "name", u.getFullName(),
                        "token", jwtUtil.generateToken(u.getId())
                    )
            );
        } catch (Exception ex) {
            System.err.println("Registration error: " + ex.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        return userService.authenticate(req.getEmail(), req.getPassword())
                .map(payload -> ResponseEntity.ok(payload))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error","invalid credentials")));
    }
}
