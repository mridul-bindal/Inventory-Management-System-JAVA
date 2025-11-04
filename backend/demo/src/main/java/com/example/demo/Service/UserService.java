package com.example.demo.Service;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public User register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("email exists");

        User u = new User();
        u.setEmail(req.getEmail());
        u.setFullName(req.getName());
        u.setPhone(req.getPhone());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRole("ROLE_USER");
        u.setStatus("ACTIVE");
        return userRepo.save(u);
    }

    public Optional<Map<String,Object>> authenticate(String usernameOrEmail, String password) {
        Optional<User> maybe = userRepo.findByEmail(usernameOrEmail);
        if (maybe.isEmpty()) return Optional.empty();
        User u = maybe.get();
        if (!passwordEncoder.matches(password, u.getPasswordHash())) return Optional.empty();
        String token = jwtUtil.generateToken(u.getId());
        Map<String,Object> payload = Map.of(
                "accessToken", token,
                "tokenType", "Bearer",
                "user", Map.of("id", u.getId(), "username", u.getEmail(), "email", u.getEmail(), "fullName", u.getFullName(), "role", u.getRole())
        );
        return Optional.of(payload);
    }
}
