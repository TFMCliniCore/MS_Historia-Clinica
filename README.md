# MS Historia Clínica

Microservicio REST construido con NestJS, Prisma y PostgreSQL para gestionar historias clínicas veterinarias y adjuntos médicos.

Este microservicio depende de **MS Entidades Core** para validación y enriquecimiento de datos de pacientes, clientes y sucursales mediante HTTP Join. También se integra con **MS Agenda** para obtener citas y recordatorios del paciente.

---

## Stack

- NestJS
- Prisma ORM
- PostgreSQL 16
- Docker / Docker Compose
- TypeScript

---

## Dependencias externas

| Servicio | Rol |
| --- | --- |
| `ms-entidades-core` | Provee datos de pacientes, clientes y sucursales via HTTP |
| `ms-agenda` | Provee citas y recordatorios del paciente via HTTP |

Las URLs se configuran con variables de entorno `MS_ENTIDADES_URL` y `MS_AGENDA_URL`.

---

## Variables de entorno

```env
# Puerto de la aplicación
PORT=3005

# Base de datos PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_DB=historia-clinica

# URL de conexíon (construida desde las variables anteriores)
DATABASE_URL=postgresql://postgres:<password>@db:5432/historia-clinica?schema=public

# Microservicios externos (opcionales)
MS_ENTIDADES_URL=http://localhost:3001/api/v1 (para ejecución local colocar http://host.docker.internal:3001/api/v1, red de Docker)
MS_AGENDA_URL=http://localhost:3003/api/v1  (para ejecución local colocar http://host.docker.internal:3003/api/v1, red de Docker)

# Entorno
NODE_ENV=development
```

---

## Ejecución con Docker

```bash
docker compose up --build
```

Servicios disponibles:

- **API**: `http://localhost:3005`
- **Base de datos**: Puerto 5432 interno (no expuesto al host por defecto)

Al iniciar el contenedor se ejecutan automáticamente:

1. Migraciones de Prisma
2. Seed con datos iniciales (funciona con o sin ms-entidades/ms-agenda)
3. Arranque del servidor NestJS

**Parar contenedor**:

```bash
docker compose stop
```

**Detener y eliminar volúmenes**:

```bash
docker compose down -v
```

**Reconstruir**:

```bash
docker compose up --build
```

---

## Ejecución local

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Ejecutar seed (puede funcionar sin ms-entidades)
npm run prisma:seed

# Modo desarrollo
npm run start:dev
```

---

## Estructura principal

```text
src/
  historia-clinica/
    dto/
      create-historia-clinica.dto.ts
      update-historia-clinica.dto.ts
    historia-clinica.controller.ts
    historia-clinica.module.ts
    historia-clinica.service.ts
    entities/
      historia-clinica.entity.ts
  adjuntos/
    dto/
      create-adjunto.dto.ts
      update-adjunto.dto.ts
    adjuntos.controller.ts
    adjuntos.module.ts
    adjuntos.service.ts
    entities/
      adjunto.entity.ts
    multer.config.ts
  agenda/
    agenda.controller.ts
    agenda.module.ts
  external-client/
    agenda-client.service.ts
    entidades-client.service.ts
    external-client.module.ts
  prisma/
    prisma-client-exception.filter.ts
    prisma.module.ts
    prisma.service.ts
  app.module.ts
  app.controller.ts
  app.service.ts
  main.ts
prisma/
  migrations/
  schema.prisma
  seed.js
```

---

## Datos iniciales precargados

El seed (`prisma/seed.js`) es **inteligente y aislado**:

1. **Intenta** conectarse a `ms-entidades` (timeout 3s) para obtener pacientes y sucursales reales.
2. Si está disponible y hay datos, los usa para crear historias clínicas con datos reales.
3. Si NO está disponible, crea **datos de prueba locales** con IDs ficticios ( Ej. `pacienteId=1`, `sucursalId=1`).

En ambos casos crea:
- 2 historias clínicas de ejemplo
- 2 adjuntos de referencia

Esto permite ejecutar el microservicio **de forma independiente** sin necesidad de tener ms-entidades o ms-agenda corriendo.

---

## URL Base

```text
http://localhost:3005/api/v1 (para desarrollo)
```

---

## Tabla de endpoints

### Historia Clínica

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/v1/historia-clinica` | Crear historia clínica |
| GET | `/api/v1/historia-clinica` | Listar historias (con filtros) |
| GET | `/api/v1/historia-clinica/:id` | Obtener una historia por ID |
| GET | `/api/v1/historia-clinica/ficha/:pacienteId` | Obtener ficha completa de un paciente (historias + citas + recordatorios) |
| PATCH | `/api/v1/historia-clinica/:id` | Actualizar historia parcialmente |
| PUT | `/api/v1/historia-clinica/:id` | Reemplazar historia completa |
| DELETE | `/api/v1/historia-clinica/:id` | Eliminar lógicamente una historia |

#### Filtros disponibles en GET `/api/v1/historia-clinica`

| Query param | Tipo | Descripción |
| --- | --- | --- |
| `pacienteId` | number | Filtrar por paciente |
| `sucursalId` | number | Filtrar por sucursal |
| `pagado` | boolean | `true` o `false` |
| `desde` | ISO date | Fecha >= desde |
| `hasta` | ISO date | Fecha <= hasta |

---

### Adjuntos

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/v1/adjuntos/paciente/:pacienteId` | Subir adjuntos asociados a un paciente |
| POST | `/api/v1/adjuntos/historia/:historiaClinicaId` | Subir adjuntos asociados a una historia |
| GET | `/api/v1/adjuntos/paciente/:pacienteId` | Galería de adjuntos del paciente |
| GET | `/api/v1/adjuntos/historia/:historiaClinicaId` | Adjuntos de una historia específica |
| GET | `/api/v1/adjuntos/:id` | Obtener un adjunto por ID |
| DELETE | `/api/v1/adjuntos/:id` | Eliminar lógicamente un adjunto (y el archivo físico) |

**Nota**: Los adjuntos se suben como `multipart/form-data` con campo `files[]` (máximo 10 archivos, 5MB c/u). Tipos permitidos: jpg, jpeg, png, webp, gif.

---

### Agenda (proxy)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/v1/agenda/paciente/:pacienteId/citas` | Obtener citas del paciente (desde ms-agenda) |
| GET | `/api/v1/agenda/paciente/:pacienteId/recordatorios` | Obtener recordatorios del paciente (desde ms-agenda) |
| POST | `/api/v1/agenda/citas` | Crear cita (envía a ms-agenda) |
| POST | `/api/v1/agenda/recordatorios` | Crear recordatorio (envía a ms-agenda) |

---

## Comportamiento del DELETE

Todos los endpoints DELETE realizan **borrado lógico**: actualizan el campo `eliminado = true`. Los registros con `eliminado: true` no aparecen en las consultas GET.

---

## Estrategia HTTP Join

Las entidades almacenan IDs externos (`pacienteId`, `sucursalId`) sin foreign keys de base de datos hacia `ms-entidades`. Al consultar, el servicio realiza llamadas HTTP a `ms-entidades` para enriquecer la respuesta:

- **GET por ID**: `Promise.all` de 2 llamadas (paciente + sucursal).
- **GET listado**: Una llamada por tipo de entidad (todos los pacientes, todas las sucursales), luego merge en memoria con `Map<id, entidad>` para lookup O(1).

```
GET /api/v1/historia-clinica
  +-> prisma.historiaClinica.findMany()
  +-> GET /pacientes (una llamada, todos)
  +-> GET /sucursales (una llamada, todas)
  +-> merge con Map
```

