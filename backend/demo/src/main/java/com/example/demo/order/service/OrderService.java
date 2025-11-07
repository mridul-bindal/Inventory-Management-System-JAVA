package com.example.demo.order.service;

import com.example.demo.order.dto.CreateOrderRequest;
import com.example.demo.order.model.Order;
import com.example.demo.order.model.OrderItem;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.products.model.Product;
import com.example.demo.products.service.ProductService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository repo;
    private final ProductService productService;

    public OrderService(OrderRepository repo, ProductService productService) {
        this.repo = repo;
        this.productService = productService;
    }

    private String generateOrderCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

    public Order createOrder(CreateOrderRequest req, String createdByUserId, String userEmail) {
        Order o = new Order();
        o.setOrderCode(generateOrderCode());
        o.setDate(Instant.now());
        o.setCreatedByUserId(createdByUserId);
        o.setCustomerName(req.getCustomerName());
        o.setChannel(req.getChannel());
        o.setDestination(req.getDestination());
        o.setPayment(req.getPayment() == null ? "Cash" : req.getPayment());
        o.setStatus(req.getStatus() == null ? "Pending" : req.getStatus());

        List<OrderItem> items = (req.getItems() == null) ? List.of() : req.getItems().stream().map(it -> {
            OrderItem oi = new OrderItem();
            oi.setProductId(it.getProductId());
            oi.setProductName(it.getProductName());
            oi.setQty(it.getQty() == null ? 0 : it.getQty());
            oi.setUnitPrice(it.getUnitPrice() == null ? BigDecimal.ZERO : it.getUnitPrice());
            
            // Validate quantity and get buying cost from product
            BigDecimal buyingCost = BigDecimal.ZERO;
            if (it.getProductId() != null && !it.getProductId().trim().isEmpty()) {
                try {
                    Product product = productService.getProductByProductId(it.getProductId(), userEmail);
                    Integer orderQty = it.getQty() == null ? 0 : it.getQty();
                    
                    // Validate quantity - order quantity must be <= available quantity
                    if (orderQty > 0 && orderQty > product.getQty()) {
                        throw new RuntimeException("Insufficient quantity for product " + it.getProductId() + 
                            ". Available: " + product.getQty() + ", Requested: " + orderQty);
                    }
                    
                    // Get buying cost from product - this is critical for profit calculation
                    // Get this BEFORE updating quantity to ensure we have the correct value
                    buyingCost = product.getBuyingCost() != null ? product.getBuyingCost() : BigDecimal.ZERO;
                    oi.setBuyingCost(buyingCost);
                    
                    // Decrease product quantity after validation - this is critical for inventory management
                    if (orderQty > 0) {
                        int currentQty = product.getQty() != null ? product.getQty() : 0;
                        int newQty = currentQty - orderQty;
                        
                        // Ensure quantity doesn't go negative (shouldn't happen due to validation above, but safety check)
                        if (newQty < 0) {
                            throw new RuntimeException("Cannot reduce quantity below zero for product " + it.getProductId());
                        }
                        
                        // Update product quantity in database using the dedicated method
                        // This ensures the product page reflects the change immediately
                        productService.updateProductQuantity(it.getProductId(), userEmail, newQty);
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error updating product " + it.getProductId() + ": " + e.getMessage());
                }
            } else {
                oi.setBuyingCost(BigDecimal.ZERO);
            }
            
            // unitPrice is the selling price (cost per piece from order form)
            BigDecimal unitPrice = oi.getUnitPrice() != null ? oi.getUnitPrice() : BigDecimal.ZERO;
            Integer qty = oi.getQty() != null ? oi.getQty() : 0;
            
            // Calculate total price (selling price * quantity)
            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(qty));
            oi.setTotalPrice(total);
            
            // Calculate net profit: (selling price per piece - buying cost per piece) * quantity
            // Net Profit = (unitPrice - buyingCost) * qty
            // ALWAYS calculate profit if quantity > 0 to ensure it's saved to database
            if (qty > 0) {
                // Ensure buyingCost is never null
                BigDecimal safeBuyingCost = buyingCost != null ? buyingCost : BigDecimal.ZERO;
                // Calculate profit per unit first, then multiply by quantity
                BigDecimal profitPerUnit = unitPrice.subtract(safeBuyingCost);
                BigDecimal profit = profitPerUnit.multiply(BigDecimal.valueOf(qty));
                oi.setProfit(profit);
            } else {
                oi.setProfit(BigDecimal.ZERO);
            }
            
            return oi;
        }).collect(Collectors.toList());

        o.setItems(items);
        o.setItemsCount(items.stream().mapToInt(i -> i.getQty() == null ? 0 : i.getQty()).sum());
        BigDecimal totalAmount = items.stream()
                .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        o.setTotalAmount(totalAmount);
        
        // Calculate total profit - ALWAYS set this field to ensure it's saved to database
        BigDecimal totalProfit = items.stream()
                .map(i -> i.getProfit() == null ? BigDecimal.ZERO : i.getProfit())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // Always set totalProfit, even if it's zero, to ensure the field exists in database
        o.setTotalProfit(totalProfit != null ? totalProfit : BigDecimal.ZERO);
        
        o.setCreatedAt(Instant.now());
        o.setUpdatedAt(Instant.now());

        return repo.save(o);
    }

    public List<Order> listAll() {
        return repo.findAll();
    }

    public Optional<Order> getById(String id) {
        return repo.findById(id);
    }

    public Order updateOrder(String id, CreateOrderRequest req, String userEmail) {
        Optional<Order> maybe = repo.findById(id);
        if (maybe.isEmpty()) throw new IllegalArgumentException("order not found");
        Order o = maybe.get();

        // simple update: overwrite certain fields (you can expand)
        if (req.getCustomerName() != null) o.setCustomerName(req.getCustomerName());
        if (req.getChannel() != null) o.setChannel(req.getChannel());
        if (req.getDestination() != null) o.setDestination(req.getDestination());
        if (req.getPayment() != null) o.setPayment(req.getPayment());
        if (req.getStatus() != null) o.setStatus(req.getStatus());

        // if items provided, recompute totals and update product quantities
        if (req.getItems() != null) {
            // Store old items to calculate quantity differences
            List<OrderItem> oldItems = o.getItems() != null ? o.getItems() : List.of();
            
            // Calculate quantity differences for each product
            for (OrderItem oldItem : oldItems) {
                if (oldItem.getProductId() != null && !oldItem.getProductId().trim().isEmpty() && oldItem.getQty() != null && oldItem.getQty() > 0) {
                    try {
                        Product product = productService.getProductByProductId(oldItem.getProductId(), userEmail);
                        int currentQty = product.getQty() != null ? product.getQty() : 0;
                        // Return the old quantity back to inventory
                        int newQty = currentQty + oldItem.getQty();
                        productService.updateProductQuantity(oldItem.getProductId(), userEmail, newQty);
                    } catch (Exception e) {
                        // Log error but continue - product might have been deleted
                        System.err.println("Warning: Could not return quantity for product " + oldItem.getProductId() + ": " + e.getMessage());
                    }
                }
            }
            
            // Now process new items and reduce quantities
            List<OrderItem> items = req.getItems().stream().map(it -> {
                OrderItem oi = new OrderItem();
                oi.setProductId(it.getProductId());
                oi.setProductName(it.getProductName());
                oi.setQty(it.getQty() == null ? 0 : it.getQty());
                oi.setUnitPrice(it.getUnitPrice() == null ? BigDecimal.ZERO : it.getUnitPrice());
                
                // Validate quantity and get buying cost from product
                BigDecimal buyingCost = BigDecimal.ZERO;
                if (it.getProductId() != null && !it.getProductId().trim().isEmpty()) {
                    try {
                        Product product = productService.getProductByProductId(it.getProductId(), userEmail);
                        Integer orderQty = it.getQty() == null ? 0 : it.getQty();
                        
                        // Validate quantity - order quantity must be <= available quantity
                        if (orderQty > 0 && orderQty > product.getQty()) {
                            throw new RuntimeException("Insufficient quantity for product " + it.getProductId() + 
                                ". Available: " + product.getQty() + ", Requested: " + orderQty);
                        }
                        
                        // Get buying cost from product - get this BEFORE updating quantity
                        buyingCost = product.getBuyingCost() != null ? product.getBuyingCost() : BigDecimal.ZERO;
                        oi.setBuyingCost(buyingCost);
                        
                        // Decrease product quantity after validation
                        if (orderQty > 0) {
                            int currentQty = product.getQty() != null ? product.getQty() : 0;
                            int newQty = currentQty - orderQty;
                            
                            if (newQty < 0) {
                                throw new RuntimeException("Cannot reduce quantity below zero for product " + it.getProductId());
                            }
                            
                            // Update product quantity in database using the dedicated method
                            productService.updateProductQuantity(it.getProductId(), userEmail, newQty);
                        }
                    } catch (Exception e) {
                        throw new RuntimeException("Error updating product " + it.getProductId() + ": " + e.getMessage());
                    }
                } else {
                    oi.setBuyingCost(BigDecimal.ZERO);
                }
                
                // unitPrice is the selling price
                BigDecimal unitPrice = oi.getUnitPrice() != null ? oi.getUnitPrice() : BigDecimal.ZERO;
                Integer qty = oi.getQty() != null ? oi.getQty() : 0;
                
                oi.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(qty)));
                
                // Calculate net profit: (selling price per piece - buying cost per piece) * quantity
                // ALWAYS calculate profit if quantity > 0 to ensure it's saved to database
                if (qty > 0) {
                    // Ensure buyingCost is never null
                    BigDecimal safeBuyingCost = buyingCost != null ? buyingCost : BigDecimal.ZERO;
                    BigDecimal profitPerUnit = unitPrice.subtract(safeBuyingCost);
                    BigDecimal profit = profitPerUnit.multiply(BigDecimal.valueOf(qty));
                    oi.setProfit(profit);
                } else {
                    oi.setProfit(BigDecimal.ZERO);
                }
                
                return oi;
            }).collect(Collectors.toList());
            o.setItems(items);
            o.setItemsCount(items.stream().mapToInt(i -> i.getQty() == null ? 0 : i.getQty()).sum());
            BigDecimal totalAmount = items.stream()
                    .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            o.setTotalAmount(totalAmount);
            
            // Calculate total profit - ALWAYS set this field to ensure it's saved to database
            BigDecimal totalProfit = items.stream()
                    .map(i -> i.getProfit() == null ? BigDecimal.ZERO : i.getProfit())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            // Always set totalProfit, even if it's zero, to ensure the field exists in database
            o.setTotalProfit(totalProfit != null ? totalProfit : BigDecimal.ZERO);
        }

        o.setUpdatedAt(Instant.now());
        return repo.save(o);
    }

    public void deleteById(String id) {
        repo.deleteById(id);
    }

    public Order changeQty(String id, int index, int delta, String userEmail) {
        var maybe = repo.findById(id);
        if (maybe.isEmpty()) throw new IllegalArgumentException("order not found");
        Order o = maybe.get();
        List<OrderItem> items = o.getItems();
        if (items == null || index < 0 || index >= items.size()) throw new IllegalArgumentException("invalid item index");
        OrderItem it = items.get(index);
        int oldQty = it.getQty() == null ? 0 : it.getQty();
        int newQty = Math.max(0, oldQty + delta);
        int qtyChange = newQty - oldQty;
        
        // Update product quantity if productId exists
        if (it.getProductId() != null && !it.getProductId().trim().isEmpty() && qtyChange != 0) {
            try {
                Product product = productService.getProductByProductId(it.getProductId(), userEmail);
                int currentProductQty = product.getQty() != null ? product.getQty() : 0;
                
                if (qtyChange > 0) {
                    // Quantity increased - need to check if enough product available
                    if (qtyChange > currentProductQty) {
                        throw new RuntimeException("Insufficient quantity in inventory. Available: " + currentProductQty + ", Requested increase: " + qtyChange);
                    }
                    // Decrease product quantity
                    int newProductQty = currentProductQty - qtyChange;
                    productService.updateProductQuantity(it.getProductId(), userEmail, newProductQty);
                } else if (qtyChange < 0) {
                    // Quantity decreased - return items to inventory
                    int newProductQty = currentProductQty + Math.abs(qtyChange);
                    productService.updateProductQuantity(it.getProductId(), userEmail, newProductQty);
                }
            } catch (Exception e) {
                throw new RuntimeException("Error updating product quantity: " + e.getMessage());
            }
        }
        
        it.setQty(newQty);
        
        // Get current values - ensure buyingCost is retrieved if not already set
        BigDecimal unitPrice = it.getUnitPrice() != null ? it.getUnitPrice() : BigDecimal.ZERO;
        BigDecimal buyingCost = it.getBuyingCost() != null ? it.getBuyingCost() : BigDecimal.ZERO;
        
        // If buyingCost is not set, try to get it from the product
        if (it.getProductId() != null && !it.getProductId().trim().isEmpty() && 
            (buyingCost == null || buyingCost.compareTo(BigDecimal.ZERO) == 0)) {
            try {
                Product product = productService.getProductByProductId(it.getProductId(), userEmail);
                buyingCost = product.getBuyingCost() != null ? product.getBuyingCost() : BigDecimal.ZERO;
                it.setBuyingCost(buyingCost);
            } catch (Exception e) {
                // If product not found, keep existing buyingCost or use zero
                if (buyingCost == null) buyingCost = BigDecimal.ZERO;
            }
        }
        
        // Recalculate total price (selling price * quantity)
        it.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(newQty)));
        
        // Recalculate net profit: (selling price per piece - buying cost per piece) * quantity
        // ALWAYS calculate profit if quantity > 0 to ensure it's saved to database
        if (newQty > 0) {
            // Ensure buyingCost is never null
            BigDecimal safeBuyingCost = buyingCost != null ? buyingCost : BigDecimal.ZERO;
            BigDecimal profitPerUnit = unitPrice.subtract(safeBuyingCost);
            BigDecimal profit = profitPerUnit.multiply(BigDecimal.valueOf(newQty));
            it.setProfit(profit);
        } else {
            it.setProfit(BigDecimal.ZERO);
        }
        
        o.setItems(items);
        o.setItemsCount(items.stream().mapToInt(i -> i.getQty() == null ? 0 : i.getQty()).sum());
        BigDecimal totalAmount = items.stream()
                .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        o.setTotalAmount(totalAmount);
        
        // Recalculate total profit - ALWAYS set this field to ensure it's saved to database
        BigDecimal totalProfit = items.stream()
                .map(i -> i.getProfit() == null ? BigDecimal.ZERO : i.getProfit())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // Always set totalProfit, even if it's zero, to ensure the field exists in database
        o.setTotalProfit(totalProfit != null ? totalProfit : BigDecimal.ZERO);
        
        o.setUpdatedAt(Instant.now());
        return repo.save(o);
    }
}
