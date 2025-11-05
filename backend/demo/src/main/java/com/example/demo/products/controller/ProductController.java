package com.example.demo.products.controller;

import com.example.demo.products.dto.ProductResponse;
import com.example.demo.products.model.Product;
import com.example.demo.products.service.ProductService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173") // Allow your React app
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService svc;

    public ProductController(ProductService svc) {
        this.svc = svc;
    }

    private ProductResponse toDto(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setQty(p.getQty());
        r.setImageBase64(p.getImageBase64());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }

    @GetMapping("/q")
    public List<ProductResponse> getAll() {
        return svc.getAllProducts().stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProductResponse getOne(@PathVariable String id) {
        return toDto(svc.getProductById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ProductResponse create(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer qty,
            @RequestPart(required = false) MultipartFile image) throws Exception {
        return toDto(svc.createProduct(name, description, qty, image));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ProductResponse update(
            @PathVariable String id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer qty,
            @RequestPart(required = false) MultipartFile image) throws Exception {
        return toDto(svc.updateProduct(id, name, description, qty, image));
    }

    @PatchMapping("/{id}/qty")
    public ProductResponse changeQty(@PathVariable String id, @RequestParam int delta) throws Exception {
        return toDto(svc.changeQty(id, delta));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        svc.deleteProduct(id);
    }
}
