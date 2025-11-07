package com.example.demo.owner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "employees")
public class Employee {
    @Id
    private String id;
    private String email; // Email of the owner who created this employee
    private String name;
    private BigDecimal salary; // Monthly salary
    private String position; // Optional: job position/role
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Employee() {}

    public Employee(String email, String name, BigDecimal salary, String position) {
        this.email = email;
        this.name = name;
        this.salary = salary;
        this.position = position;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

