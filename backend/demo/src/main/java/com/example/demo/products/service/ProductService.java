package com.example.demo.products.service;

import com.example.demo.products.model.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(String id);
    Product createProduct(String name, String description, Integer qty, MultipartFile image) throws Exception;
    Product updateProduct(String id, String name, String description, Integer qty, MultipartFile image) throws Exception;
    void deleteProduct(String id);
    Product changeQty(String id, int delta) throws Exception;
}
