package com.example.demo.owner.service;

import com.example.demo.owner.dto.EmployeeRequest;
import com.example.demo.owner.dto.EmployeeResponse;
import com.example.demo.owner.dto.OwnerIncomeResponse;
import com.example.demo.owner.model.Employee;
import com.example.demo.owner.repository.EmployeeRepository;
import com.example.demo.order.model.Order;
import com.example.demo.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final OrderRepository orderRepository;

    public EmployeeService(EmployeeRepository employeeRepository, OrderRepository orderRepository) {
        this.employeeRepository = employeeRepository;
        this.orderRepository = orderRepository;
    }

    public List<EmployeeResponse> getAllEmployeesByEmail(String email) {
        return employeeRepository.findByEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse createEmployee(EmployeeRequest request, String email) {
        Employee employee = new Employee();
        employee.setEmail(email);
        employee.setName(request.getName());
        employee.setSalary(request.getSalary() != null ? request.getSalary() : BigDecimal.ZERO);
        employee.setPosition(request.getPosition());
        employee.setCreatedAt(Instant.now());
        employee.setUpdatedAt(Instant.now());

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    public EmployeeResponse updateEmployee(String id, EmployeeRequest request, String email) {
        Optional<Employee> optional = employeeRepository.findById(id);
        if (optional.isEmpty()) {
            throw new IllegalArgumentException("Employee not found");
        }

        Employee employee = optional.get();
        // Verify ownership
        if (!employee.getEmail().equals(email)) {
            throw new RuntimeException("Access denied: Employee belongs to another owner");
        }

        if (request.getName() != null) employee.setName(request.getName());
        if (request.getSalary() != null) employee.setSalary(request.getSalary());
        if (request.getPosition() != null) employee.setPosition(request.getPosition());
        employee.setUpdatedAt(Instant.now());

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    public void deleteEmployee(String id, String email) {
        Optional<Employee> optional = employeeRepository.findById(id);
        if (optional.isEmpty()) {
            throw new IllegalArgumentException("Employee not found");
        }

        Employee employee = optional.get();
        // Verify ownership
        if (!employee.getEmail().equals(email)) {
            throw new RuntimeException("Access denied: Employee belongs to another owner");
        }

        employeeRepository.deleteById(id);
    }

    public OwnerIncomeResponse getOwnerIncome(String email) {
        // Get total profit from all orders
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalProfit = allOrders.stream()
                .map(order -> order.getTotalProfit() != null ? order.getTotalProfit() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get total salaries for this owner's employees
        List<Employee> employees = employeeRepository.findByEmail(email);
        BigDecimal totalSalaries = employees.stream()
                .map(emp -> emp.getSalary() != null ? emp.getSalary() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate owner income: totalProfit - totalSalaries
        BigDecimal ownerIncome = totalProfit.subtract(totalSalaries);

        return new OwnerIncomeResponse(totalProfit, totalSalaries, ownerIncome);
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setName(employee.getName());
        response.setSalary(employee.getSalary());
        response.setPosition(employee.getPosition());
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());
        return response;
    }
}

