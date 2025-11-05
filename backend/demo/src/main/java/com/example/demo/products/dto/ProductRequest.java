package com.example.demo.products.dto;

import org.springframework.web.multipart.MultipartFile;

public class ProductRequest {
    private String name;
    private String description;
    private Integer qty;
    private MultipartFile image;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}
