package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.MessageResponse;
import com.example.demo.model.ERole;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;

/**
 * Controlador para pruebas y operaciones de desarrollo
 * SOLO PARA ENTORNO DE DESARROLLO - NO USAR EN PRODUCCIÓN
 */
@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    /**
     * Crea un usuario administrador para pruebas
     * SOLO PARA ENTORNO DE DESARROLLO - NO USAR EN PRODUCCIÓN
     */
    @GetMapping("/create-admin")
    public ResponseEntity<?> createAdminUser() {
        // Verificar si ya existe un usuario admin
        if (userRepository.existsByUsername("admin")) {
            return ResponseEntity.ok(new MessageResponse("Admin user already exists!"));
        }
        
        // Crear usuario admin
        User adminUser = new User(
            "admin", 
            "admin@example.com", 
            encoder.encode("admin123")
        );
        
        adminUser.setDisplayName("Administrator");
        adminUser.setAvatarUrl("/assets/avatars/admin-avatar.png");
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setUpdatedAt(LocalDateTime.now());
        
        // Asignar roles de usuario y admin
        Set<Role> roles = new HashSet<>();
        
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
            .orElseThrow(() -> new RuntimeException("Error: Role USER is not found."));
        roles.add(userRole);
        
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
            .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));
        roles.add(adminRole);
        
        adminUser.setRoles(roles);
        userRepository.save(adminUser);
        
        return ResponseEntity.ok(new MessageResponse("Admin user created successfully! Use username: admin, password: admin123"));
    }
    
    /**
     * Verificar la contraseña proporcionada para un usuario específico
     * SOLO PARA ENTORNO DE DESARROLLO - NO USAR EN PRODUCCIÓN
     */
    @GetMapping("/check-password")
    public ResponseEntity<?> checkPassword(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
            .orElse(null);
        
        if (user == null) {
            return ResponseEntity.ok("User not found: " + username);
        }
        
        boolean matches = encoder.matches(rawPassword, user.getPassword());
        
        return ResponseEntity.ok("Password check for " + username + ": " + (matches ? "CORRECT" : "INCORRECT"));
    }
}
