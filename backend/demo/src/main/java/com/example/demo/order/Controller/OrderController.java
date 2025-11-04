package com.example.demo.order.Controller;

import com.example.demo.order.dto.CreateOrderRequest;
import com.example.demo.order.model.Order;
import com.example.demo.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService svc;
    public OrderController(OrderService svc) { this.svc = svc; }

    @GetMapping
    public ResponseEntity<List<Order>> list(@RequestParam(value="q", required=false) String q,
                                            @RequestParam(value="status", required=false) String status,
                                            @RequestParam(value="payment", required=false) String payment) {
        // basic filters
        List<Order> all = svc.listAll();
        // lightweight filtering on server side (for demo). You can make repository queries later.
        var filtered = all.stream().filter(o -> {
            boolean ok = true;
            if (q != null && !q.trim().isEmpty()) {
                String lq = q.toLowerCase();
                ok &= (o.getOrderCode() != null && o.getOrderCode().toLowerCase().contains(lq))
                        || (o.getCustomerName() != null && o.getCustomerName().toLowerCase().contains(lq));
            }
            if (status != null && !"All".equalsIgnoreCase(status)) ok &= status.equalsIgnoreCase(o.getStatus());
            if (payment != null && !"All".equalsIgnoreCase(payment)) ok &= payment.equalsIgnoreCase(o.getPayment());
            return ok;
        }).toList();
        return ResponseEntity.ok(filtered);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequest req, @RequestHeader(value="X-User-Id", required=false) String userId) {
        // X-User-Id optional; later get from SecurityContext
        try {
            Order o = svc.createOrder(req, userId);
            return ResponseEntity.ok(o);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add order: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        return svc.getById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody CreateOrderRequest req) {
        try {
            Order o = svc.updateOrder(id, req);
            return ResponseEntity.ok(o);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        svc.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items/{index}/change")
    public ResponseEntity<?> changeQty(@PathVariable String id, @PathVariable int index, @RequestParam int delta) {
        try {
            Order o = svc.changeQty(id, index, delta);
            return ResponseEntity.ok(o);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
