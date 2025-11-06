package com.example.demo.products.service;
import org.springframework.util.StringUtils;

import com.example.demo.products.model.Product;
import com.example.demo.products.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;


@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;

    public ProductServiceImpl(ProductRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    @Override
    public List<Product> getAllProductsByEmail(String email) {
        return repo.findByEmail(email);
    }

    @Override
    public Product getProductById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public Product getProductByIdAndEmail(String id, String email) {
        Product product = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getEmail() == null || !product.getEmail().equals(email)) {
            throw new RuntimeException("Product not found or access denied");
        }
        return product;
    }

    @Override
    public Product createProduct(String email, String name, String description, Integer qty, MultipartFile image) throws IOException {
        String base64 = toBase64(image);
        Product p = new Product(email, name, description, qty == null ? 0 : qty, base64);
        return repo.save(p);
    }

    @Override
    public Product updateProduct(String id, String email, String name, String description, Integer qty, MultipartFile image) throws IOException {
        Product p = getProductByIdAndEmail(id, email);
        if (name != null) p.setName(name);
        if (description != null) p.setDescription(description);
        if (qty != null) p.setQty(qty);
        if (image != null) p.setImageBase64(toBase64(image));
        return repo.save(p);
    }

    @Override
    public void deleteProduct(String id) {
        repo.deleteById(id);
    }

    @Override
    public void deleteProduct(String id, String email) {
        // Verify ownership before deleting
        getProductByIdAndEmail(id, email);
        repo.deleteById(id);
    }

    @Override
    public Product changeQty(String id, int delta) throws Exception {
        Product p = getProductById(id);
        int newQty = Math.max(0, p.getQty() + delta);
        p.setQty(newQty);
        return repo.save(p);
    }

    @Override
    public Product changeQty(String id, String email, int delta) throws Exception {
        Product p = getProductByIdAndEmail(id, email);
        int newQty = Math.max(0, p.getQty() + delta);
        p.setQty(newQty);
        return repo.save(p);
    }

    private String toBase64(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        byte[] bytes = file.getBytes();
        return "data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(bytes);
    }

    @Override
    public List<Product> searchProducts(String q) {
        if (!StringUtils.hasText(q)) {
            return repo.findAll();
        }
        // This method is kept for backward compatibility but should not be used in production
        // Use searchProducts(email, q) instead for user-specific searches
        // For now, return empty list since we don't have a general search without email
        return List.of();
    }

    @Override
    public List<Product> searchProducts(String email, String q) {
        if (!StringUtils.hasText(q)) {
            return repo.findByEmail(email);
        }
        String term = q.trim();
        return repo.findByEmailAndNameContainingIgnoreCaseOrEmailAndDescriptionContainingIgnoreCase(
            email, term, email, term);
    }
}
