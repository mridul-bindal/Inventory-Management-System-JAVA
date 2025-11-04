package com.example.demo.order.dto;

import java.math.BigDecimal;

public class OrderItemRequest {
    private String productId;
    private String productName;
    private Integer qty;
    private BigDecimal unitPrice;

    public OrderItemRequest() {}
    // getters / setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
