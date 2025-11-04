package com.example.demo.order.service;

import com.example.demo.order.dto.CreateOrderRequest;
import com.example.demo.order.model.Order;
import com.example.demo.order.model.OrderItem;
import com.example.demo.order.repository.OrderRepository;
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

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }

    private String generateOrderCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

    public Order createOrder(CreateOrderRequest req, String createdByUserId) {
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
            BigDecimal total = (oi.getUnitPrice() == null ? BigDecimal.ZERO : oi.getUnitPrice())
                      .multiply(BigDecimal.valueOf(oi.getQty() == null ? 0 : oi.getQty()));
            oi.setTotalPrice(total);
            return oi;
        }).collect(Collectors.toList());

        o.setItems(items);
        o.setItemsCount(items.stream().mapToInt(i -> i.getQty() == null ? 0 : i.getQty()).sum());
        BigDecimal totalAmount = items.stream()
                .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        o.setTotalAmount(totalAmount);
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

    public Order updateOrder(String id, CreateOrderRequest req) {
        Optional<Order> maybe = repo.findById(id);
        if (maybe.isEmpty()) throw new IllegalArgumentException("order not found");
        Order o = maybe.get();

        // simple update: overwrite certain fields (you can expand)
        if (req.getCustomerName() != null) o.setCustomerName(req.getCustomerName());
        if (req.getChannel() != null) o.setChannel(req.getChannel());
        if (req.getDestination() != null) o.setDestination(req.getDestination());
        if (req.getPayment() != null) o.setPayment(req.getPayment());
        if (req.getStatus() != null) o.setStatus(req.getStatus());

        // if items provided, recompute totals
        if (req.getItems() != null) {
            List<OrderItem> items = req.getItems().stream().map(it -> {
                OrderItem oi = new OrderItem();
                oi.setProductId(it.getProductId());
                oi.setProductName(it.getProductName());
                oi.setQty(it.getQty() == null ? 0 : it.getQty());
                oi.setUnitPrice(it.getUnitPrice() == null ? BigDecimal.ZERO : it.getUnitPrice());
                oi.setTotalPrice(oi.getUnitPrice().multiply(BigDecimal.valueOf(oi.getQty())));
                return oi;
            }).collect(Collectors.toList());
            o.setItems(items);
            o.setItemsCount(items.stream().mapToInt(i -> i.getQty() == null ? 0 : i.getQty()).sum());
            BigDecimal totalAmount = items.stream()
                    .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            o.setTotalAmount(totalAmount);
        }

        o.setUpdatedAt(Instant.now());
        return repo.save(o);
    }

    public void deleteById(String id) {
        repo.deleteById(id);
    }

    public Order changeQty(String id, int index, int delta) {
        var maybe = repo.findById(id);
        if (maybe.isEmpty()) throw new IllegalArgumentException("order not found");
        Order o = maybe.get();
        List<OrderItem> items = o.getItems();
        if (items == null || index < 0 || index >= items.size()) throw new IllegalArgumentException("invalid item index");
        OrderItem it = items.get(index);
        int newQty = Math.max(0, (it.getQty() == null ? 0 : it.getQty()) + delta);
        it.setQty(newQty);
        it.setTotalPrice(it.getUnitPrice().multiply(BigDecimal.valueOf(newQty)));
        o.setItems(items);
        o.setItemsCount(items.stream().mapToInt(i -> i.getQty() == null ? 0 : i.getQty()).sum());
        BigDecimal totalAmount = items.stream()
                .map(i -> i.getTotalPrice() == null ? BigDecimal.ZERO : i.getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        o.setTotalAmount(totalAmount);
        o.setUpdatedAt(Instant.now());
        return repo.save(o);
    }
}
