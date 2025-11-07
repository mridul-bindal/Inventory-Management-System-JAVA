package com.example.demo.owner.dto;

import java.math.BigDecimal;

public class EmployeeRequest {
    private String name;
    private BigDecimal salary;
    private String position;

    public EmployeeRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
}

