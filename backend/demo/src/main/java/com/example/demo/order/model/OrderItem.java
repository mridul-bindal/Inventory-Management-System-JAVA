package com.example.demo.order.model;

import java.math.BigDecimal;

public class OrderItem {
    private String productId;   // optional: link to product collection
    private String productName; // optional name snapshot
    private Integer qty;
    private BigDecimal unitPrice; // selling price per piece
    private BigDecimal buyingCost; // buying cost per piece (from product)
    private BigDecimal totalPrice; // total selling price (unitPrice * qty)
    private BigDecimal profit; // profit = (unitPrice - buyingCost) * qty

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
    public BigDecimal getBuyingCost() { return buyingCost; }
    public void setBuyingCost(BigDecimal buyingCost) { this.buyingCost = buyingCost; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }
}
