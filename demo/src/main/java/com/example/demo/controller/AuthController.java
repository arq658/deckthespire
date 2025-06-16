package com.example.demo.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.AvatarUpdateRequest;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.SignupRequest;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserUpdateRequest;
import com.example.demo.model.ERole;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.jwt.JwtUtils;
import com.example.demo.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;    @Autowired
    JwtUtils jwtUtils;
    
    @PostMapping({"/signin", "/login"})
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // El campo username puede contener un nombre de usuario o un email
        String usernameOrEmail = loginRequest.getUsername();
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getDisplayName(),
                userDetails.getAvatarUrl(),
                roles
            ));
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Endpoint alternativo para iniciar sesión específicamente con correo electrónico
     * Útil para clientes que quieren ser explícitos sobre el tipo de autenticación
     */
    @PostMapping("/signin-email")
    public ResponseEntity<?> authenticateUserByEmail(@Valid @RequestBody LoginRequest loginRequest) {
        // Asegurarse de que el campo username se trata como email
        String email = loginRequest.getUsername();
        
        try {
            // Intentar buscar el usuario por correo electrónico primero
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + email));
            
            // Usar el nombre de usuario real para la autenticación
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getDisplayName(),
                userDetails.getAvatarUrl(),
                roles
            ));
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping({"/signup", "/register"})
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(
            signUpRequest.getUsername(),
            signUpRequest.getEmail(),
            encoder.encode(signUpRequest.getPassword())
        );
        
        // Set display name if provided, otherwise use username
        user.setDisplayName(signUpRequest.getDisplayName() != null && !signUpRequest.getDisplayName().isEmpty() 
            ? signUpRequest.getDisplayName() 
            : signUpRequest.getUsername());

        // Set avatar if provided
        if (signUpRequest.getAvatarUrl() != null && !signUpRequest.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(signUpRequest.getAvatarUrl());
        } else {
            user.setAvatarUrl("/assets/avatars/default-avatar.png");
        }

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
      @GetMapping({"/user", "/profile"})
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
        List<String> roles = userDetails.getAuthorities().stream()
            .map(item -> item.getAuthority())
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(new JwtResponse(
            null, // No need to send a new token
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            roles
        ));
    }
      @PutMapping({"/user", "/profile"})
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserProfile(
            @Valid @RequestBody UserUpdateRequest userUpdateRequest, 
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        // Check if email is already in use by another user
        if (userUpdateRequest.getEmail() != null && 
            !userUpdateRequest.getEmail().equals(user.getEmail()) && 
            userRepository.existsByEmail(userUpdateRequest.getEmail())) {
            
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Email is already in use!"));
        }
        
        // Update user fields if provided
        if (userUpdateRequest.getDisplayName() != null) {
            user.setDisplayName(userUpdateRequest.getDisplayName());
        }
        
        if (userUpdateRequest.getEmail() != null) {
            user.setEmail(userUpdateRequest.getEmail());
        }
        
        if (userUpdateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(userUpdateRequest.getAvatarUrl());
        }
        
        // Update password if provided
        if (userUpdateRequest.getPassword() != null && !userUpdateRequest.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(userUpdateRequest.getPassword()));
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("User profile updated successfully!"));
    }
    
    /**
     * Obtiene todos los usuarios registrados en el sistema
     * Sólo disponible para administradores
     * 
     * @return Lista de usuarios
     */    /**
     * Obtiene todos los usuarios registrados en el sistema
     * Endpoint público para fines de demostración
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
     * Endpoint alternativo para obtener todos los usuarios
     * Path diseñado específicamente para acceso público
     * 
     * @return Lista de usuarios con información segura
     */
    @GetMapping("/public-users")
    public ResponseEntity<?> getPublicUsersList() {
        List<User> users = userRepository.findAll();
        
        // Convertir a DTOs para asegurar que solo se expongan datos no sensibles
        List<UserDTO> userDTOs = UserDTO.fromUsers(users);
        
        return ResponseEntity.ok(userDTOs);
    }
    
    /**
     * Endpoint para actualizar solo el avatar del usuario
     * 
     * @param avatarUpdateRequest La solicitud con la URL del nuevo avatar
     * @param authentication Datos de autenticación del usuario
     * @return Mensaje de éxito o error
     */
    @PutMapping("/update-avatar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserAvatar(
            @Valid @RequestBody AvatarUpdateRequest avatarUpdateRequest, 
            Authentication authentication) {
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        // Actualizar el avatar
        user.setAvatarUrl(avatarUpdateRequest.getAvatarUrl());
        user.setUpdatedAt(java.time.LocalDateTime.now());
        
        userRepository.save(user);
        
        // Devolver respuesta con los datos actualizados
        return ResponseEntity.ok(
            new JwtResponse(
                null, // No es necesario un nuevo token
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList())
            )
        );
    }
}
