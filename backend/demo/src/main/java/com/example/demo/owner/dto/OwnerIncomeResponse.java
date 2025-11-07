package com.example.demo.owner.dto;

import java.math.BigDecimal;

public class OwnerIncomeResponse {
    private BigDecimal totalProfit;
    private BigDecimal totalSalaries;
    private BigDecimal ownerIncome; // totalProfit - totalSalaries

    public OwnerIncomeResponse() {}

    public OwnerIncomeResponse(BigDecimal totalProfit, BigDecimal totalSalaries, BigDecimal ownerIncome) {
        this.totalProfit = totalProfit;
        this.totalSalaries = totalSalaries;
        this.ownerIncome = ownerIncome;
    }

    // Getters and Setters
    public BigDecimal getTotalProfit() { return totalProfit; }
    public void setTotalProfit(BigDecimal totalProfit) { this.totalProfit = totalProfit; }

    public BigDecimal getTotalSalaries() { return totalSalaries; }
    public void setTotalSalaries(BigDecimal totalSalaries) { this.totalSalaries = totalSalaries; }

    public BigDecimal getOwnerIncome() { return ownerIncome; }
    public void setOwnerIncome(BigDecimal ownerIncome) { this.ownerIncome = ownerIncome; }
}

