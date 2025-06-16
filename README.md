# DeckTheSpire - Slay the Spire Deck Builder

## 📋 Descripción

DeckTheSpire es una aplicación web completa para crear y gestionar mazos de Slay the Spire. Permite a los usuarios crear mazos personalizados seleccionando entre los 4 personajes principales del juego (Ironclad, Silent, Defect, Watcher), junto con cartas y reliquias específicas.

## 🚀 Características

### ✅ **Funcionalidades Implementadas**

#### **Backend (Spring Boot)**
- ✅ **API REST completa** para cartas, reliquias, keywords, mazos y personajes
- ✅ **Scraping automático** de datos desde la wiki de Slay the Spire usando JSoup
- ✅ **Base de datos PostgreSQL** con todas las entidades relacionadas
- ✅ **Sistema de autenticación JWT** con roles de usuario
- ✅ **Modelo de personajes** con:
  - Información básica (nombre, HP inicial, descripción)
  - Mazo inicial (starting deck)
  - Reliquia inicial (starting relic)
- ✅ **DataLoader** que pobla automáticamente la base de datos con:
  - 4 Personajes principales
  - 1,402 Cartas
  - 104 Keywords
  - 356 Relics

#### **Frontend (Angular)**
- ✅ **Interfaz moderna** con Angular Material
- ✅ **Sistema de autenticación** con login/registro
- ✅ **Editor de mazos avanzado** con:
  - Selección de personaje
  - Búsqueda y filtrado de cartas
  - Gestión de reliquias
- ✅ **Vista detallada de mazos** mostrando:
  - Información completa del personaje seleccionado
  - Cartas organizadas por costo
  - Reliquias ordenadas por tier
- ✅ **Lista de mazos** con información del personaje
- ✅ **Diseño responsive** y temática visual del juego

#### **Infraestructura**
- ✅ **Docker Compose** para levantar toda la aplicación
- ✅ **Contenedores separados** para backend, frontend y base de datos
- ✅ **Configuración de desarrollo** con hot-reload

## 🛠️ Tecnologías Utilizadas

### Backend
- **Java 21** con Spring Boot 3.5.0
- **Spring Data JPA** para persistencia
- **Spring Security** con JWT
- **PostgreSQL** como base de datos
- **JSoup** para web scraping

### Frontend
- **Angular 18** con TypeScript
- **Angular Material** para componentes UI
- **RxJS** para programación reactiva
- **SCSS** para estilos personalizados

### DevOps
- **Docker** y **Docker Compose**
- **Maven** para gestión de dependencias Java
- **npm** para gestión de dependencias Node.js

## 🐳 Instalación y Ejecución con Docker

### Prerrequisitos
- Docker Desktop instalado y ejecutándose
- Git para clonar el repositorio

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd DeckTheSpire
   ```

2. **Levantar la aplicación completa**
   ```bash
   docker-compose up --build
   ```

3. **Acceder a la aplicación**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:8090
   - **Base de datos**: localhost:5432

### ⏱️ Tiempo de inicio
- **Primera ejecución**: ~5-10 minutos (descarga de imágenes + scraping inicial)
- **Ejecuciones posteriores**: ~2-3 minutos

## 📊 Datos de la Aplicación

La aplicación carga automáticamente:

### **Personajes Principales**
1. **Ironclad** - El guerrero tanque
2. **Silent** - La asesina ágil  
3. **Defect** - El constructor de orbes
4. **Watcher** - La monja que manipula la postura

### **Contenido Completo del Juego**
- **1,402 Cartas** únicas con toda su información
- **356 Reliquias** con descripciones y efectos
- **104 Keywords** del juego explicadas

## 🎮 Cómo Usar la Aplicación

### 1. **Registro/Login**
- Crea una cuenta nueva o inicia sesión
- El sistema usa JWT para autenticación segura

### 2. **Crear un Mazo**
- Haz clic en "Create New Deck"
- **Selecciona un personaje** (Ironclad, Silent, Defect, o Watcher)
- Dale un nombre y descripción a tu mazo
- Busca y agrega cartas usando el filtro
- Agrega reliquias complementarias
- Guarda tu mazo

### 3. **Gestionar Mazos**
- Ve todos tus mazos en la lista principal
- Cada mazo muestra el personaje seleccionado
- Edita o elimina mazos existentes
- Ve detalles completos incluyendo información del personaje

### 4. **Vista Detallada**
- Ve la información completa del personaje:
  - HP inicial
  - Mazo de inicio
  - Reliquia de inicio
- Cartas organizadas por costo
- Reliquias organizadas por tier

## 🔧 Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │    Database     │
│   Angular 18    │◄──►│  Spring Boot    │◄──►│   PostgreSQL    │
│   Port: 4200    │    │   Port: 8090    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Wiki Scraping  │
                    │      JSoup      │
                    └─────────────────┘
```

## 📋 API Endpoints

### **Personajes**
- `GET /api/characters` - Lista todos los personajes
- `GET /api/characters/{id}` - Detalles de un personaje

### **Cartas**
- `GET /api/cards` - Lista todas las cartas
- `GET /api/cards/{id}` - Detalles de una carta

### **Reliquias**
- `GET /api/relics` - Lista todas las reliquias
- `GET /api/relics/{id}` - Detalles de una reliquia

### **Mazos**
- `GET /api/decks` - Lista mazos del usuario
- `POST /api/decks` - Crear nuevo mazo
- `PUT /api/decks/{id}` - Actualizar mazo
- `DELETE /api/decks/{id}` - Eliminar mazo

### **Autenticación**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Iniciar sesión

## 🔍 Características Técnicas Destacadas

### **Web Scraping Inteligente**
- Scraping automático de la wiki oficial de Slay the Spire
- Parseo de datos complejos (mazos iniciales, reliquias)
- Manejo de errores y timeouts
- Carga inicial solo si la base de datos está vacía

### **Seguridad**
- Autenticación JWT con roles
- Validación de permisos por usuario
- Protección de endpoints sensibles

### **Performance**
- Caching de datos estáticos
- Lazy loading de componentes
- Paginación en listas grandes
- Optimización de consultas JPA

### **UX/UI**
- Diseño responsive
- Tema oscuro inspirado en Slay the Spire
- Feedback visual para todas las acciones
- Filtros de búsqueda en tiempo real

## 🚀 Próximas Mejoras

- [ ] **Sistema de etiquetas** para mazos
- [ ] **Importar/exportar** mazos en formatos estándar
- [ ] **Estadísticas** de uso de cartas
- [ ] **Compartir mazos** públicamente
- [ ] **Modo offline** para construcción de mazos
- [ ] **Calculadora de sinergias** entre cartas

## 🐛 Solución de Problemas

### **El contenedor no inicia**
```bash
# Limpiar contenedores y volúmenes
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### **Error de conexión a la base de datos**
- Verificar que PostgreSQL esté ejecutándose
- Revisar las variables de entorno en `docker-compose.yml`

### **Datos no se cargan**
- El scraping inicial puede tomar varios minutos
- Revisar logs del backend: `docker-compose logs backend`

## 📝 Logs y Debugging

```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs del frontend
docker-compose logs -f frontend

# Ver logs de la base de datos
docker-compose logs -f database
```

## 🤝 Contribuciones

Este proyecto está abierto a contribuciones. Áreas de interés:
- Mejoras en la UI/UX
- Optimizaciones de performance
- Nuevas funcionalidades
- Tests automatizados
- Documentación adicional

---

**¡Disfruta construyendo mazos épicos para Slay the Spire! 🎴⚔️**
