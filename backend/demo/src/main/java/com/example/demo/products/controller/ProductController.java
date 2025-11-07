package com.example.demo.products.controller;

import com.example.demo.model.User;
import com.example.demo.products.dto.ProductResponse;
import com.example.demo.products.model.Product;
import com.example.demo.products.service.ProductService;
import com.example.demo.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173") // Allow your React app
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService svc;
    private final UserRepository userRepository;

    public ProductController(ProductService svc, UserRepository userRepository) {
        this.svc = svc;
        this.userRepository = userRepository;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null) {
            String userId = auth.getPrincipal().toString(); // This is the user ID from JWT
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            return user.getEmail();
        }
        throw new RuntimeException("User not authenticated");
    }

    private boolean isOwner(String email) {
        return "owner@gmail.com".equalsIgnoreCase(email);
    }

    private ProductResponse toDto(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setProductId(p.getProductId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setQty(p.getQty());
        r.setBuyingCost(p.getBuyingCost());
        r.setImageBase64(p.getImageBase64());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }

    // @GetMapping("/")
    // public List<ProductResponse> getAll() {
    //     return svc.getAllProducts().stream().map(this::toDto).collect(Collectors.toList());
    // }

    @GetMapping
    public List<ProductResponse> getAll(@RequestParam(required = false) String q) {
        String email = getCurrentUserEmail();
        // Owner can see all products, other users see only their own
        List<Product> products;
        if (isOwner(email)) {
            // Owner sees all products
            products = (q == null || q.isBlank()) 
                ? svc.getAllProducts() 
                : svc.searchProducts(q);
        } else {
            // Regular users see only their products
            products = (q == null || q.isBlank()) 
                ? svc.getAllProductsByEmail(email) 
                : svc.searchProducts(email, q);
        }
        return products.stream().map(this::toDto).collect(Collectors.toList());
    }


    @GetMapping("/{id}")
    public ProductResponse getOne(@PathVariable String id) {
        String email = getCurrentUserEmail();
        // Owner can access any product, other users only their own
        Product product = isOwner(email) 
            ? svc.getProductById(id) 
            : svc.getProductByIdAndEmail(id, email);
        return toDto(product);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ProductResponse create(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer qty,
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) java.math.BigDecimal buyingCost,
            @RequestPart(required = false) MultipartFile image) throws Exception {
        String email = getCurrentUserEmail();
        return toDto(svc.createProduct(email, productId, name, description, qty, buyingCost, image));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ProductResponse update(
            @PathVariable String id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer qty,
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) java.math.BigDecimal buyingCost,
            @RequestPart(required = false) MultipartFile image) throws Exception {
        String email = getCurrentUserEmail();
        // Owner can update any product, other users only their own (checked in service)
        return toDto(svc.updateProduct(id, email, name, description, qty, productId, buyingCost, image));
    }

    @PatchMapping("/{id}/qty")
    public ProductResponse changeQty(@PathVariable String id, @RequestParam int delta) throws Exception {
        String email = getCurrentUserEmail();
        // Owner can change quantity of any product, other users only their own (checked in service)
        return toDto(svc.changeQty(id, email, delta));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        String email = getCurrentUserEmail();
        // Owner can delete any product, other users only their own (checked in service)
        svc.deleteProduct(id, email);
    }
}
