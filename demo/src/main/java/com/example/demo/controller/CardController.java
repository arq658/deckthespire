package com.example.demo.controller;

import com.example.demo.model.Card;
import com.example.demo.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @GetMapping
    public Map<String, Object> getAllCards() {
        List<Map<String, Object>> cardsData = cardRepository.findAll().stream()
            .map(this::formatCardResponse)
            .collect(Collectors.toList());
            
        Map<String, Object> response = new HashMap<>();
        response.put("data", cardsData);
        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCardById(@PathVariable Long id) {
        return cardRepository.findById(id)
                .map(card -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("data", formatCardResponse(card));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    private Map<String, Object> formatCardResponse(Card card) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", String.valueOf(card.getId()));
        data.put("type", "card");
        
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("name", card.getName());
        attributes.put("color", card.getColor());
        attributes.put("rarity", card.getRarity());
        attributes.put("card_type", card.getType());
        attributes.put("cost", card.getCost());
        attributes.put("description", card.getDescription());
        attributes.put("keyword_description", card.getKeywordDescription());
        attributes.put("image", card.getImageUrl());
        
        data.put("attributes", attributes);
        return data;
    }
}
