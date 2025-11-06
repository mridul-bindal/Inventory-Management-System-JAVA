package com.example.demo.products.repository;

import com.example.demo.products.model.Product;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    // Find all products for a specific user by email
    List<Product> findByEmail(String email);
    
    // Find products by user email and search term
    List<Product> findByEmailAndNameContainingIgnoreCase(String email, String name);
    List<Product> findByEmailAndDescriptionContainingIgnoreCase(String email, String description);
    // Search in name or description for a specific user by email
    List<Product> findByEmailAndNameContainingIgnoreCaseOrEmailAndDescriptionContainingIgnoreCase(
        String email, String name, String email2, String description);
}
