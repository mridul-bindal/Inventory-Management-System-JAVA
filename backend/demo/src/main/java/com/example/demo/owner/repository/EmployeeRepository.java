package com.example.demo.owner.repository;

import com.example.demo.owner.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    // Find all employees for a specific owner by email
    List<Employee> findByEmail(String email);
}

