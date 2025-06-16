package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Clase para manejar solicitudes de inicio de sesión
 * El campo username puede contener tanto el nombre de usuario como el correo electrónico
 */
public class LoginRequest {
    @NotBlank
    private String username; // Puede ser username o email

    @NotBlank
    private String password;

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
