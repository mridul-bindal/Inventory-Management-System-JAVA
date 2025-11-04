package com.example.demo.dto;

import java.util.Map;

public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Map<String,Object> user;

    public AuthResponse() {}
    public AuthResponse(String accessToken, Map<String,Object> user) {
        this.accessToken = accessToken;
        this.user = user;
    }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public Map<String,Object> getUser() { return user; }
    public void setUser(Map<String,Object> user) { this.user = user; }
}
