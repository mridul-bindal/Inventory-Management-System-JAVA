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
    public Product createProduct(String email, String productId, String name, String description, Integer qty, java.math.BigDecimal buyingCost, MultipartFile image) throws IOException {
        String base64 = toBase64(image);
        Product p = new Product(email, productId, name, description, qty == null ? 0 : qty, buyingCost, base64);
        return repo.save(p);
    }

    @Override
    public Product updateProduct(String id, String email, String name, String description, Integer qty, String productId, java.math.BigDecimal buyingCost, MultipartFile image) throws Exception {
        // Check if owner - owner can update any product
        boolean isOwner = "owner@gmail.com".equalsIgnoreCase(email);
        Product p = isOwner ? getProductById(id) : getProductByIdAndEmail(id, email);
        if (name != null) p.setName(name);
        if (description != null) p.setDescription(description);
        if (qty != null) p.setQty(qty);
        if (productId != null) p.setProductId(productId);
        if (buyingCost != null) p.setBuyingCost(buyingCost);
        if (image != null) p.setImageBase64(toBase64(image));
        return repo.save(p);
    }

    @Override
    public Product updateProduct(String id, String email, String name, String description, Integer qty, String productId, java.math.BigDecimal buyingCost, MultipartFile image, boolean isOwner) throws Exception {
        Product p = isOwner ? getProductById(id) : getProductByIdAndEmail(id, email);
        if (name != null) p.setName(name);
        if (description != null) p.setDescription(description);
        if (qty != null) p.setQty(qty);
        if (productId != null) p.setProductId(productId);
        if (buyingCost != null) p.setBuyingCost(buyingCost);
        if (image != null) p.setImageBase64(toBase64(image));
        return repo.save(p);
    }

    @Override
    public Product getProductByProductId(String productId, String email) {
        // Check if owner - owner can access any product
        if ("owner@gmail.com".equalsIgnoreCase(email)) {
            return repo.findAll().stream()
                .filter(p -> productId != null && productId.equals(p.getProductId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found with productId: " + productId));
        }
        // Regular users can only access their own products
        return repo.findByEmail(email).stream()
            .filter(p -> productId != null && productId.equals(p.getProductId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Product not found with productId: " + productId));
    }

    @Override
    public void deleteProduct(String id) {
        repo.deleteById(id);
    }

    @Override
    public void deleteProduct(String id, String email) {
        // Check if owner - owner can delete any product
        boolean isOwner = "owner@gmail.com".equalsIgnoreCase(email);
        if (!isOwner) {
            getProductByIdAndEmail(id, email); // Verify ownership
        }
        repo.deleteById(id);
    }

    @Override
    public void deleteProduct(String id, String email, boolean isOwner) {
        // Owner can delete any product, other users only their own
        if (!isOwner) {
            getProductByIdAndEmail(id, email); // Verify ownership
        }
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
        // Check if owner - owner can change quantity of any product
        boolean isOwner = "owner@gmail.com".equalsIgnoreCase(email);
        Product p = isOwner ? getProductById(id) : getProductByIdAndEmail(id, email);
        int newQty = Math.max(0, p.getQty() + delta);
        p.setQty(newQty);
        return repo.save(p);
    }

    @Override
    public Product changeQty(String id, String email, int delta, boolean isOwner) throws Exception {
        Product p = isOwner ? getProductById(id) : getProductByIdAndEmail(id, email);
        int newQty = Math.max(0, p.getQty() + delta);
        p.setQty(newQty);
        return repo.save(p);
    }

    @Override
    public Product updateProductQuantity(String productId, String email, int newQuantity) throws Exception {
        // Check if owner - owner can update any product
        boolean isOwner = "owner@gmail.com".equalsIgnoreCase(email);
        return updateProductQuantity(productId, email, newQuantity, isOwner);
    }

    @Override
    public Product updateProductQuantity(String productId, String email, int newQuantity, boolean isOwner) throws Exception {
        Product product = getProductByProductId(productId, email);
        product.setQty(newQuantity);
        return repo.save(product);
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
        // Search all products (used by owner)
        String term = q.trim();
        return repo.findAll().stream()
            .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(term.toLowerCase())) ||
                        (p.getDescription() != null && p.getDescription().toLowerCase().contains(term.toLowerCase())))
            .collect(java.util.stream.Collectors.toList());
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
