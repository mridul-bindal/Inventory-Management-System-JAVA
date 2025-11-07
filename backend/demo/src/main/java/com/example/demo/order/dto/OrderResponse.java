package com.example.demo.order.dto;

import com.example.demo.order.model.OrderItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderResponse {
    private String id;
    private String orderCode;
    private Instant date;
    private String customerName;
    private String channel;
    private String destination;
    private List<OrderItem> items;
    private Integer itemsCount;
    private BigDecimal totalAmount;
    private BigDecimal totalProfit;
    private String payment;
    private String status;
    private Instant createdAt;

    public OrderResponse() {}
    // getters/setters
    // generate or paste manually (omitted for brevity)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public Integer getItemsCount() { return itemsCount; }
    public void setItemsCount(Integer itemsCount) { this.itemsCount = itemsCount; }
    public java.math.BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(java.math.BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public java.math.BigDecimal getTotalProfit() { return totalProfit; }
    public void setTotalProfit(java.math.BigDecimal totalProfit) { this.totalProfit = totalProfit; }
    public String getPayment() { return payment; }
    public void setPayment(String payment) { this.payment = payment; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
