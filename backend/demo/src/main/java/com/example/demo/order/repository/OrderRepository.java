package com.example.demo.order.repository;

import com.example.demo.order.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStatus(String status);
    List<Order> findByPayment(String payment);
    List<Order> findByCustomerNameContainingIgnoreCase(String q);
}
