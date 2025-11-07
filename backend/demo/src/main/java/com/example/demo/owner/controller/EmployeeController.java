package com.example.demo.owner.controller;

import com.example.demo.model.User;
import com.example.demo.owner.dto.EmployeeRequest;
import com.example.demo.owner.dto.EmployeeResponse;
import com.example.demo.owner.dto.OwnerIncomeResponse;
import com.example.demo.owner.service.EmployeeService;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173") // Allow your React app
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService employeeService;
    private final UserRepository userRepository;

    public EmployeeController(EmployeeService employeeService, UserRepository userRepository) {
        this.employeeService = employeeService;
        this.userRepository = userRepository;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String userId = auth.getPrincipal().toString();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return user.getEmail();
        }
        throw new RuntimeException("User not authenticated");
    }

    private void checkOwnerAccess(String email) {
        if (!"owner@gmail.com".equalsIgnoreCase(email)) {
            throw new RuntimeException("Access denied: Only owner can access this section");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEmployees() {
        try {
            String userEmail = getCurrentUserEmail();
            checkOwnerAccess(userEmail);
            List<EmployeeResponse> employees = employeeService.getAllEmployeesByEmail(userEmail);
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody EmployeeRequest request) {
        try {
            String userEmail = getCurrentUserEmail();
            checkOwnerAccess(userEmail);
            EmployeeResponse employee = employeeService.createEmployee(request, userEmail);
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @RequestBody EmployeeRequest request) {
        try {
            String userEmail = getCurrentUserEmail();
            checkOwnerAccess(userEmail);
            EmployeeResponse employee = employeeService.updateEmployee(id, request, userEmail);
            return ResponseEntity.ok(employee);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        try {
            String userEmail = getCurrentUserEmail();
            checkOwnerAccess(userEmail);
            employeeService.deleteEmployee(id, userEmail);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/income")
    public ResponseEntity<?> getOwnerIncome() {
        try {
            String userEmail = getCurrentUserEmail();
            checkOwnerAccess(userEmail);
            OwnerIncomeResponse income = employeeService.getOwnerIncome(userEmail);
            return ResponseEntity.ok(income);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }
}

