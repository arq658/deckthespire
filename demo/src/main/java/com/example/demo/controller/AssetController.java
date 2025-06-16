package com.example.demo.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final ResourceLoader resourceLoader;
    
    @Value("${avatar.directory:/assets/avatars}")
    private String avatarDirectory;
    
    public AssetController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
    
    /**
     * Obtiene la lista de avatares disponibles en el directorio de avatares
     * 
     * @return Lista de avatares con rutas y nombres     */    /**
     * Obtiene un avatar específico por nombre
     */
    @GetMapping("/avatar/{filename:.+}")
    public ResponseEntity<?> getAvatarFile(@PathVariable String filename) {
        try {
            // Buscar el archivo específico
            String resourcePath = "static/assets/avatars/" + filename;
            Resource resource = resourceLoader.getResource("classpath:" + resourcePath);
            
            if (resource.exists()) {
                // Determinar el tipo MIME basado en la extensión del archivo
                String contentType = "image/png";
                if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                }
                  return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
            } else {
                // Si el recurso no existe, retornar 404
                System.out.println("Archivo de avatar no encontrado: " + filename);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            // En caso de error, responder con 500
            System.err.println("Error al servir avatar " + filename + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/avatars")
    public ResponseEntity<?> getAvailableAvatars() {
        // Lista para almacenar información de avatares
        List<Map<String, String>> avatars = new ArrayList<>();
            
        try {
            // Crear avatares predeterminados
            // Esta solución asegura que siempre hay avatares disponibles incluso si no existen físicamente
            String[] defaultAvatarNames = {"default-avatar", "ironclad", "silent", "defect", "watcher"};
            String[] avatarColors = {"3F51B5", "FF5252", "4CAF50", "FFEB3B", "9C27B0"};
              for (int i = 0; i < defaultAvatarNames.length; i++) {
                Map<String, String> avatarInfo = new HashMap<>();
                String fileName = defaultAvatarNames[i] + ".png";
                // Asegurarse de que las URLs comienzan con una barra
                String avatarPath = avatarDirectory.startsWith("/") ? avatarDirectory : "/" + avatarDirectory;
                avatarInfo.put("name", defaultAvatarNames[i].replace("-", " "));
                avatarInfo.put("path", avatarPath + "/" + fileName);
                avatarInfo.put("url", avatarPath + "/" + fileName);
                // Añadir información de color para generar avatar si no existe el archivo
                avatarInfo.put("color", avatarColors[i]);
                avatars.add(avatarInfo);
            }
            
            // Intentar buscar avatares reales en el sistema de archivos
            String resourcePath = "static" + avatarDirectory;
            Resource resource = resourceLoader.getResource("classpath:" + resourcePath);
            
            // Depuración
            System.out.println("Buscando avatares en: " + resourcePath);
            
            if (resource.exists()) {
                try {
                    File directory = resource.getFile();
                    System.out.println("Directorio encontrado: " + directory.getAbsolutePath());
                    
                    if (directory.isDirectory()) {
                        // Listar archivos en el directorio
                        try (Stream<Path> paths = Files.list(Paths.get(directory.getPath()))) {
                            List<File> files = paths
                                .filter(p -> {
                                    String fileName = p.getFileName().toString().toLowerCase();
                                    return Files.isRegularFile(p) && 
                                           !fileName.equals("readme.md") &&
                                           (fileName.endsWith(".png") || 
                                            fileName.endsWith(".jpg") || 
                                            fileName.endsWith(".jpeg") || 
                                            fileName.endsWith(".gif"));
                                })
                                .map(Path::toFile)
                                .collect(Collectors.toList());
                            
                            System.out.println("Archivos de imagen encontrados: " + files.size());
                            
                            // Si encontramos archivos de verdad, reemplazar nuestra lista predeterminada
                            if (!files.isEmpty()) {
                                avatars.clear();
                                
                                // Crear objetos de información para cada avatar
                                for (File file : files) {
                                    Map<String, String> avatarInfo = new HashMap<>();
                                    String fileName = file.getName();
                                    String name = fileName.substring(0, fileName.lastIndexOf('.'))
                                        .replace("-", " ")
                                        .replace("_", " ");
                                    
                                    // Primera letra en mayúscula para cada palabra
                                    String[] parts = name.split(" ");
                                    StringBuilder displayName = new StringBuilder();
                                    for (String part : parts) {
                                        if (part.length() > 0) {
                                            displayName.append(Character.toUpperCase(part.charAt(0)))
                                                     .append(part.substring(1))
                                                     .append(" ");
                                        }
                                    }
                                      avatarInfo.put("name", displayName.toString().trim());
                                    // Asegurarse de que las URLs comienzan con una barra
                                    String avatarPath = avatarDirectory.startsWith("/") ? avatarDirectory : "/" + avatarDirectory;
                                    avatarInfo.put("path", avatarPath + "/" + fileName);
                                    avatarInfo.put("url", avatarPath + "/" + fileName);
                                    // Añadir color para fallback visual
                                    avatarInfo.put("color", avatarColors[avatars.size() % avatarColors.length]);
                                    avatars.add(avatarInfo);
                                    
                                    System.out.println("Agregado avatar: " + fileName);
                                }
                            } else {
                                System.out.println("No se encontraron archivos de imagen, usando avatares predeterminados");
                            }
                        }
                    } else {
                        System.out.println("El recurso existe pero no es un directorio");
                    }
                } catch (Exception e) {
                    // Si ocurre un error al leer los archivos, seguimos usando los avatares predeterminados
                    System.err.println("Error al leer archivos de avatar: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("El directorio de recursos no existe: " + resourcePath);
            }
            
            return ResponseEntity.ok(avatars);
        } catch (Exception e) {            // Garantiza que al menos devolvemos un avatar por defecto incluso si todo falla
            if (avatars.isEmpty()) {
                Map<String, String> defaultAvatar = new HashMap<>();
                // Asegurarse de que las URLs comienzan con una barra
                String avatarPath = avatarDirectory.startsWith("/") ? avatarDirectory : "/" + avatarDirectory;
                defaultAvatar.put("name", "Default Avatar");
                defaultAvatar.put("path", avatarPath + "/default-avatar.png");
                defaultAvatar.put("url", avatarPath + "/default-avatar.png");
                defaultAvatar.put("color", "3F51B5");
                avatars.add(defaultAvatar);
            }
            
            // Registrar el error pero aún devolver la lista
            System.err.println("Error al procesar avatares: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(avatars);
        }
    }
}
