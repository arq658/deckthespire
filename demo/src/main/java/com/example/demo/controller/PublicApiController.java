package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.UserDTO;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

/**
 * Controlador público para acceso a datos no sensibles
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class PublicApiController {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Obtiene todos los usuarios registrados en el sistema
     * Endpoint totalmente público
     * 
     * @return Lista de usuarios con información segura
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        // Convertir a DTOs para asegurar que solo se expongan datos no sensibles
        List<UserDTO> userDTOs = UserDTO.fromUsers(users);
        
        return ResponseEntity.ok(userDTOs);
    }
    
    /**
     * Endpoint de diagnóstico para verificar la información de un usuario
     * ADVERTENCIA: ¡Este endpoint solo debe estar activo en entornos de desarrollo!
     */
    @GetMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + email));
            
            // Crear un objeto que contiene solo información básica
            // y segura para diagnóstico
            return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "exists", true
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "email", email,
                "exists", false,
                "message", e.getMessage()
            ));
        }
    }
}
