package com.example.demo.controller;

import com.example.demo.model.Relic;
import com.example.demo.repository.RelicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/relics")
public class RelicController {

    @Autowired
    private RelicRepository relicRepository;

    @GetMapping
    public Map<String, Object> getAllRelics() {
        List<Map<String, Object>> relicsData = relicRepository.findAll().stream()
            .map(this::formatRelicResponse)
            .collect(Collectors.toList());
            
        Map<String, Object> response = new HashMap<>();
        response.put("data", relicsData);
        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRelicById(@PathVariable Long id) {
        return relicRepository.findById(id)
                .map(relic -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("data", formatRelicResponse(relic));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    private Map<String, Object> formatRelicResponse(Relic relic) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", String.valueOf(relic.getId()));
        data.put("type", "relic");
        
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("name", relic.getName());
        attributes.put("tier", relic.getTier());
        attributes.put("pool", relic.getPool());
        attributes.put("description", relic.getDescription());
        attributes.put("flavor_text", relic.getFlavorText());
        attributes.put("image", relic.getImageUrl());
        
        data.put("attributes", attributes);
        return data;
    }
}
