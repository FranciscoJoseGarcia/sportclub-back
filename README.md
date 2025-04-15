# sportclub-back

## Descripción

**sportclub-back** es una API desarrollada en Node.js con TypeScript que proporciona acceso a los beneficios de SportClub.

## Características

- **TypeScript** para tipado estático y mejor mantenibilidad
- **Express** como framework de servidor
- **Axios** para solicitudes HTTP a la API externa
- **Node-cache** para almacenamiento en caché en memoria
- **Winston** para logging estructurado
- **Jest** para pruebas unitarias y de integración
- **CORS** configurado para seguridad
- Middlewares personalizados para logging y manejo de errores

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) (incluido con Node.js)

## Cómo Ejecutar el Proyecto

### 1. Configuración Inicial
```bash
# Clonar el repositorio
git clone https://github.com/FranciscoJoseGarcia/sportclub-back.git
cd sportclub-back

# Instalar dependencias
npm install

# Crear archivo .env con las variables necesarias
echo "NODE_ENV=development
SERVER_PORT=3000
SERVER_HOSTNAME=localhost
SPORT_CLUB_API=https://api-beneficios.dev.sportclub.com.ar/api/beneficios" > .env
```

### 2. Modo Desarrollo
```bash
# Iniciar el servidor en modo desarrollo (con recarga automática)
npm run dev

# El servidor estará disponible en:
# http://localhost:3000
```

### 3. Modo Producción
```bash
# Compilar el proyecto
npm run build

# Iniciar el servidor en producción
npm run start
```

### 4. Ejecutar Tests
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch 
npm run test:watch

# Ver cobertura de tests
npm run test:coverage
```

### 5. Verificar que todo funciona
```bash
# Probar el health check
curl http://localhost:3000/health

# Probar obtener todos los beneficios
curl http://localhost:3000/api/beneficios

# Probar obtener un beneficio específico
curl http://localhost:3000/api/beneficios/1
```

## Estructura del Proyecto

```
sportclub-back/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── middlewares/     # Middlewares personalizados
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── utils/           # Utilidades y helpers
│   └── server.ts        # Configuración del servidor
├── tests/               # Tests unitarios y de integración
├── .env                 # Variables de entorno
└── package.json         # Dependencias y scripts
```

## Endpoints

### Health Check
- `GET /health` - Verifica el estado del servidor

### Beneficios
- `GET /api/beneficios` - Obtiene todos los beneficios
- `GET /api/beneficios/:id` - Obtiene un beneficio específico

## Pruebas

El proyecto incluye tests para:
- Controladores
- Servicios (benefits-service)
- Middlewares (error, logging)
- Rutas
- Servidor

Para ejecutar los tests:
```bash
npm test
```

## Logging

El sistema utiliza Winston para logging estructurado con los siguientes niveles:
- INFO: Información general
- WARN: Advertencias
- ERROR: Errores

## Manejo de Errores

El middleware de errores maneja:
- Timeouts de la API externa (504)
- Errores de autenticación (502)
- Errores de comunicación con la API (502)
- Errores internos del servidor (500)

## Caché

- Implementado con node-cache
- TTL de 5 minutos
- Claves: 'all-benefits' y 'benefit-{id}'


## Licencia

© 2025 Francisco José García. Todos los derechos reservados.