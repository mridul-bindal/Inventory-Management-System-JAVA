package com.example.demo.order.model;

import java.math.BigDecimal;

public class OrderItem {
    private String productId;   // optional: link to product collection
    private String productName; // optional name snapshot
    private Integer qty;
    private BigDecimal unitPrice; // cost per piece
    private BigDecimal totalPrice;

    public OrderItem() {}

    // getters / setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
