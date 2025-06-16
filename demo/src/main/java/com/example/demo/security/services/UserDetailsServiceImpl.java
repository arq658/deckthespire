package com.example.demo.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;    @Override
    @Transactional
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        // Intentar autenticar primero por nombre de usuario
        User user = userRepository.findByUsername(login)
            .orElse(null);
            
        // Si no se encuentra, intentar por correo electrónico
        if (user == null) {
            user = userRepository.findByEmail(login)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username or email: " + login));
        }

        return UserDetailsImpl.build(user);
    }
}
