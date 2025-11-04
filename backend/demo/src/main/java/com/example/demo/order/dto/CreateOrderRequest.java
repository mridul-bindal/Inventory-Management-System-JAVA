package com.example.demo.order.dto;

import java.util.List;

public class CreateOrderRequest {
    private String customerName;
    private String channel;
    private String destination;
    private List<OrderItemRequest> items;
    private String payment; // Cash/NEFT/RTGS/UPI
    private String status;  // Pending/Completed

    public CreateOrderRequest() {}
    // getters/setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    public String getPayment() { return payment; }
    public void setPayment(String payment) { this.payment = payment; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
