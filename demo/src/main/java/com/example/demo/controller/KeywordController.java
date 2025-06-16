package com.example.demo.controller;

import com.example.demo.model.Keyword;
import com.example.demo.repository.KeywordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/keywords")
public class KeywordController {

    @Autowired
    private KeywordRepository keywordRepository;

    @GetMapping
    public Map<String, Object> getAllKeywords() {
        List<Map<String, Object>> keywordsData = keywordRepository.findAll().stream()
            .map(this::formatKeywordResponse)
            .collect(Collectors.toList());
            
        Map<String, Object> response = new HashMap<>();
        response.put("data", keywordsData);
        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getKeywordById(@PathVariable Long id) {
        return keywordRepository.findById(id)
                .map(keyword -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("data", formatKeywordResponse(keyword));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    private Map<String, Object> formatKeywordResponse(Keyword keyword) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", String.valueOf(keyword.getId()));
        data.put("type", "keywords");
        
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("name", keyword.getName());
        attributes.put("description", keyword.getDescription());
        attributes.put("names", keyword.getNames());
        
        data.put("attributes", attributes);
        return data;
    }
}
