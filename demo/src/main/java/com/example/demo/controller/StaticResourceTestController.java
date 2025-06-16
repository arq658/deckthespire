package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/test")
public class StaticResourceTestController {

    private final ResourceLoader resourceLoader;
    
    @Value("${avatar.directory:/assets/avatars}")
    private String avatarDirectory;
    
    public StaticResourceTestController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
    
    @GetMapping("/static-resources")
    public ResponseEntity<?> testStaticResources() {
        Map<String, Object> result = new HashMap<>();
        result.put("avatarDirectory", avatarDirectory);
        
        try {
            // Verificar si el directorio existe
            String resourcePath = "static" + avatarDirectory;
            Resource resource = resourceLoader.getResource("classpath:" + resourcePath);
            result.put("resourceExists", resource.exists());
            
            if (resource.exists()) {
                try {
                    File directory = resource.getFile();
                    result.put("isDirectory", directory.isDirectory());
                    result.put("absolutePath", directory.getAbsolutePath());
                    
                    if (directory.isDirectory()) {
                        // Listar archivos
                        File[] files = directory.listFiles();
                        result.put("fileCount", files != null ? files.length : 0);
                        result.put("files", Arrays.toString(files != null ? files : new File[0]));
                    }
                } catch (IOException e) {
                    result.put("error", "Error al acceder al archivo: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            result.put("error", "Error general: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/check-file/{filename}")
    public ResponseEntity<?> checkFileExists(@PathVariable String filename) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Verificar archivo específico
            String resourcePath = "static/assets/avatars/" + filename;
            Resource resource = resourceLoader.getResource("classpath:" + resourcePath);
            result.put("resourceExists", resource.exists());
            result.put("resourcePath", resourcePath);
            
            if (resource.exists()) {
                result.put("fileSize", resource.contentLength());
                result.put("lastModified", resource.lastModified());
            }
        } catch (Exception e) {
            result.put("error", "Error al verificar archivo: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
}
