package com.example.demo.products.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "products") // Collection name in MongoDB
public class Product {

    @Id
    private String id; // MongoDB _id field (String type by default)
    private String name;
    private String description;
    private Integer qty;
    private String imageBase64; // base64 image or URL
    private Instant createdAt = Instant.now();

    // --- Constructors ---
    public Product() {}

    public Product(String name, String description, Integer qty, String imageBase64) {
        this.name = name;
        this.description = description;
        this.qty = qty;
        this.imageBase64 = imageBase64;
        this.createdAt = Instant.now();
    }

    // --- Getters & Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
