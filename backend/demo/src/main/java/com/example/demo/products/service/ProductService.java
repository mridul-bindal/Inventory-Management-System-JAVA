package com.example.demo.products.service;

import com.example.demo.products.model.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    List<Product> getAllProductsByEmail(String email);
    Product getProductById(String id);
    Product getProductByIdAndEmail(String id, String email);
    Product createProduct(String email, String productId, String name, String description, Integer qty, java.math.BigDecimal buyingCost, MultipartFile image) throws Exception;
    Product updateProduct(String id, String email, String name, String description, Integer qty, String productId, java.math.BigDecimal buyingCost, MultipartFile image) throws Exception;
    Product getProductByProductId(String productId, String email);
    void deleteProduct(String id);
    void deleteProduct(String id, String email);
    Product changeQty(String id, int delta) throws Exception;
    Product changeQty(String id, String email, int delta) throws Exception;
    Product updateProductQuantity(String productId, String email, int newQuantity) throws Exception;
    List<Product> searchProducts(String q);
    List<Product> searchProducts(String email, String q);
}
