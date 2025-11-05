package com.example.demo.products.service;

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
    public Product getProductById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public Product createProduct(String name, String description, Integer qty, MultipartFile image) throws IOException {
        String base64 = toBase64(image);
        Product p = new Product(name, description, qty == null ? 0 : qty, base64);
        return repo.save(p);
    }

    @Override
    public Product updateProduct(String id, String name, String description, Integer qty, MultipartFile image) throws IOException {
        Product p = getProductById(id);
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
    public Product changeQty(String id, int delta) throws Exception {
        Product p = getProductById(id);
        int newQty = Math.max(0, p.getQty() + delta);
        p.setQty(newQty);
        return repo.save(p);
    }

    private String toBase64(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;
        byte[] bytes = file.getBytes();
        return "data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(bytes);
    }
}
