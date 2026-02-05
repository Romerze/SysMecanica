# SysMecanica - Sistema de Gestión de Taller Mecánico

Sistema completo de gestión para talleres mecánicos automotrices, desarrollado con tecnologías web modernas.

## Características Principales

- Gestión de clientes y vehículos
- Órdenes de trabajo con seguimiento de estados
- Control de inventario de repuestos
- Facturación y control de pagos
- Reportes y estadísticas
- Sistema de usuarios con roles (RBAC)
- Diseño responsive

## Tecnologías

### Backend
- **Node.js** v18+ / v20+
- **Express.js** - Framework web
- **SQLite** - Base de datos embebida
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas

### Frontend
- **HTML5** - Estructura
- **CSS3 Puro** - Diseño personalizado (sin frameworks)
- **JavaScript Vanilla** - Lógica del cliente

## Instalación

### Prerrequisitos
- Node.js v18 o superior
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd SysMecanica
```

2. Instalar dependencias del backend:
```bash
cd backend
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Inicializar la base de datos:
```bash
npm run init-db
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## Estructura del Proyecto

```
SysMecanica/
├── backend/              # Backend API
│   ├── src/
│   │   ├── config/       # Configuración
│   │   ├── controllers/  # Controladores
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Rutas de API
│   │   ├── middleware/   # Middleware
│   │   ├── database/     # Base de datos SQLite
│   │   └── utils/        # Utilidades
│   ├── uploads/          # Archivos subidos
│   ├── backups/          # Respaldos de BD
│   └── tests/            # Tests
├── frontend/             # Frontend
│   ├── assets/           # Recursos estáticos
│   │   ├── css/          # Estilos CSS
│   │   ├── js/           # JavaScript
│   │   └── images/       # Imágenes
│   └── pages/            # Páginas HTML
└── docs/                 # Documentación
```

## Scripts Disponibles

### Backend
- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en modo desarrollo (con nodemon)
- `npm run init-db` - Inicializa la base de datos
- `npm test` - Ejecuta los tests
- `npm run test:watch` - Ejecuta tests en modo watch

## Uso

### Frontend
Abrir `frontend/pages/index.html` en un navegador o usar un servidor local como Live Server.

### Credenciales por Defecto
- **Usuario:** admin
- **Contraseña:** admin123

⚠️ **Importante:** Cambiar estas credenciales en producción.

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Ver cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Vehículos
- `GET /api/vehiculos` - Listar vehículos
- `POST /api/vehiculos` - Crear vehículo
- `GET /api/vehiculos/:id` - Ver vehículo
- `PUT /api/vehiculos/:id` - Actualizar vehículo

### Órdenes de Trabajo
- `GET /api/ordenes` - Listar órdenes
- `POST /api/ordenes` - Crear orden
- `GET /api/ordenes/:id` - Ver orden
- `PUT /api/ordenes/:id` - Actualizar orden

*Ver documentación completa de la API en `/docs/api-documentation.md`*

## Seguridad

- Autenticación JWT
- Hash de contraseñas con bcrypt
- Validación de inputs
- Headers de seguridad con Helmet
- Rate limiting
- CORS configurado

## Respaldos

La base de datos SQLite se respalda automáticamente en `/backend/backups/`.

### Respaldo manual:
```bash
npm run backup
```

### Restaurar respaldo:
```bash
npm run restore -- backup-filename.db
```

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles

## Soporte

Para soporte y preguntas, crear un issue en el repositorio.

## Roadmap

- [ ] Fase 1: Setup y Fundación ✅
- [ ] Fase 2: Autenticación y Backend Base
- [ ] Fase 3: Frontend Base
- [ ] Fase 4: Clientes y Vehículos
- [ ] Fase 5: Órdenes de Trabajo
- [ ] Fase 6: Inventario
- [ ] Fase 7: Facturación
- [ ] Fase 8: Reportes
- [ ] Fase 9: Optimización y Testing
- [ ] Fase 10: Despliegue

---

**Versión:** 1.0.0
**Última actualización:** 2026-02-04
