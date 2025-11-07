package com.example.demo.products.dto;

import java.time.Instant;

public class ProductResponse {
    private String id;
    private String productId;
    private String name;
    private String description;
    private Integer qty;
    private java.math.BigDecimal buyingCost;
    private String imageBase64;
    private Instant createdAt;

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public java.math.BigDecimal getBuyingCost() { return buyingCost; }
    public void setBuyingCost(java.math.BigDecimal buyingCost) { this.buyingCost = buyingCost; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
