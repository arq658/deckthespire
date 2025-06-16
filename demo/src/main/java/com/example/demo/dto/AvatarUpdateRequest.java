package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para solicitud de cambio de avatar
 */
public class AvatarUpdateRequest {
    @NotBlank
    private String avatarUrl;
    
    // Constructors
    public AvatarUpdateRequest() {}
    
    public AvatarUpdateRequest(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    // Getters and Setters
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
