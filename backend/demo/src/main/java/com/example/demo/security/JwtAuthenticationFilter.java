package com.example.demo.security;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    private String resolveToken(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = resolveToken(request);
            System.out.println("JWT Filter - Request path: " + request.getRequestURI());
            System.out.println("JWT Filter - Token received: " + (token != null ? "yes" : "no"));
            
            if (token != null) {
                String userId = jwtUtil.getSubject(token);
                System.out.println("JWT Filter - User ID from token: " + userId);
                
                if (userId != null) {
                    Optional<User> ou = userRepository.findById(userId);
                    System.out.println("JWT Filter - User found in DB: " + ou.isPresent());
                    
                    if (ou.isPresent()) {
                        User u = ou.get();
                        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(u.getRole()));
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(u.getId(), null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        System.out.println("JWT Filter - Authentication set for user: " + u.getId() + " with role: " + u.getRole());
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("JWT Filter - Authentication error: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}
