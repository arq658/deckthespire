package com.example.demo.controller;

import com.example.demo.model.Deck;
import com.example.demo.model.User;
import com.example.demo.repository.DeckRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decks")
public class DeckController {
    @Autowired
    private DeckRepository deckRepository;
      @Autowired
    private UserRepository userRepository;
    
    /**
     * Helper method to extract user ID from authentication
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // Try to get ID directly from principal
        if (authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        
        // Fallback: look up by username
        String username = authentication.getName();
        return userRepository.findByUsername(username)
            .map(User::getId)
            .orElse(null);
    }    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Deck> getAllDecks() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuthentication(authentication);
        
        if (userId != null) {
            return deckRepository.findByUserId(userId);
        }
        
        // Fallback to returning all decks (for admin users)
        return deckRepository.findAll();
    }    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDeckById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = getUserIdFromAuthentication(authentication);
        
        return deckRepository.findById(id)
                .map(deck -> {
                    // Verify the user owns this deck
                    if (currentUserId == null || !deck.getUserId().equals(currentUserId)) {
                        return ResponseEntity.status(403).body("You don't have permission to view this deck");
                    }
                    
                    return ResponseEntity.ok(deck);
                })
                .orElse(ResponseEntity.notFound().build());
    }@PostMapping
    @PreAuthorize("isAuthenticated()")
    public Deck createDeck(@RequestBody Deck deck) {
        // Set the user ID from the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuthentication(authentication);
        
        if (userId != null) {
            deck.setUserId(userId);
            System.out.println("Saving deck: " + deck.getName() + " for user ID: " + deck.getUserId());
            return deckRepository.save(deck);
        } else {
            throw new RuntimeException("No se pudo identificar al usuario");
        }
    }    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateDeck(@PathVariable Long id, @RequestBody Deck deckDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = getUserIdFromAuthentication(authentication);
        
        return deckRepository.findById(id)
                .map(existingDeck -> {
                    // Verify the user owns this deck
                    if (currentUserId == null || !existingDeck.getUserId().equals(currentUserId)) {
                        return ResponseEntity.status(403).body("You don't have permission to edit this deck");
                    }
                    
                    existingDeck.setName(deckDetails.getName());
                    existingDeck.setDescription(deckDetails.getDescription());
                    existingDeck.setCards(deckDetails.getCards());
                    existingDeck.setRelics(deckDetails.getRelics());
                    return ResponseEntity.ok(deckRepository.save(existingDeck));
                })
                .orElse(ResponseEntity.notFound().build());
    }    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteDeck(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = getUserIdFromAuthentication(authentication);
        
        return deckRepository.findById(id)
                .map(deck -> {
                    // Verify the user owns this deck
                    if (currentUserId == null || !deck.getUserId().equals(currentUserId)) {
                        return ResponseEntity.status(403).body("You don't have permission to delete this deck");
                    }
                    
                    deckRepository.delete(deck);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
