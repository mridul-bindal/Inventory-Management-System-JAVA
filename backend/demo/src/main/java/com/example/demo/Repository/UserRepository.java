package com.example.demo.repository;

import com.example.demo.model.User;
import com.example.demo.products.model.Product;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
   
}

