package com.example.demo.products.repository;

import com.example.demo.products.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    // You can add custom finders like:
    // List<Product> findByNameContainingIgnoreCase(String name);
}
