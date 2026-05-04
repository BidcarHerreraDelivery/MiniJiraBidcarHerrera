# Diagramas de Arquitectura — Mini Jira V1
> **Generado por:** Arquitecto de Software  
> **Referencia:** PRD v1.0 · specs.md · backlog.md

---

## 1. Modelo C4 — Nivel Contenedores

```mermaid
C4Container
    title Diagrama de Contenedores — Mini Jira V1

    Person(usuario, "Usuario", "Miembro del equipo. Crea y gestiona sus propios tickets.")
    Person(admin, "Admin", "Administrador. Gestiona usuarios, tickets y roles.")

    System_Boundary(minijira, "Mini Jira") {

        Container(spa, "Web App", "React + Tailwind + Shadcn UI",
            "SPA que provee tablero Kanban, formularios de tickets, filtros, dashboard de métricas y exportaciones.")

        Container(api, "API Server", "Node.js + REST/JSON",
            "Gestiona autenticación, autorización por rol, lógica de negocio, control de concurrencia, ciclo de vida de tickets y exportaciones CSV/PDF.")

        ContainerDb(db, "Base de Datos", "PostgreSQL",
            "Persiste usuarios, roles, tickets, estados, comentarios, etiquetas y datos de métricas.")

        Container(worker, "Email Worker", "Node.js — proceso asíncrono",
            "Consume la cola de notificaciones y despacha emails sin bloquear la respuesta al usuario.")
    }

    System_Ext(emailSvc, "Servicio de Email Transaccional", "Resend / SendGrid",
        "Entrega notificaciones: ticket asignado, mención en comentario, listado de tickets huérfanos por baja de usuario.")

    Rel(usuario, spa, "Usa", "HTTPS")
    Rel(admin, spa, "Usa", "HTTPS")
    Rel(spa, api, "Solicitudes API", "JSON / HTTPS")
    Rel(api, db, "Lee y escribe", "SQL / TLS")
    Rel(api, worker, "Encola notificaciones", "Async / interno")
    Rel(worker, emailSvc, "Envía emails", "HTTPS / API REST")
    Rel(emailSvc, usuario, "Entrega notificación", "SMTP")
    Rel(emailSvc, admin, "Entrega notificación", "SMTP")
```

### Decisiones de arquitectura

| Contenedor | Justificación desde el PRD |
|---|---|
| **SPA React** | Stack definido en reunión; UI "limpia tipo Apple" con Shadcn/Tailwind |
| **API Node.js** | Stack definido; centraliza lógica de roles, permisos y concurrencia (sección 4) |
| **PostgreSQL** | Requerido por relaciones entre entidades: roles, estados, asignaciones, comentarios |
| **Email Worker** | PRD sección 2.7: notificaciones *asíncronas*, no bloquean al usuario |
| **Email externo** | PRD sección 6: Resend o SendGrid como servicio transaccional |

> El `Email Worker` es un proceso interno (puede ser un job queue con BullMQ o similar) para desacoplar el flujo de negocio del envío de correos y absorber fallos del proveedor externo sin afectar la UX.

---

## 2. Diagrama de Secuencia — Mover ticket de "Por hacer" a "Listo"

> **Historia de usuario:** HU-02 — Ciclo de vida completo de un ticket  
> **Referencia PRD:** Secciones 2.1, 2.3 y 4

```mermaid
sequenceDiagram
    actor Usuario
    participant SPA as "Web App (React)"
    participant API as "API Server (Node.js)"
    participant DB as "Base de Datos (Postgres)"

    Usuario->>SPA: Arrastra ticket a columna "Listo"

    SPA->>API: PATCH /tickets/:id { estado: "Listo", version }
    Note right of SPA: JWT en Authorization header

    API->>API: Valida JWT y extrae userId + rol

    API->>DB: SELECT id, estado, asignado_a, updated_at
    DB-->>API: Datos actuales del Ticket

    API->>API: Verifica permiso: ¿Asignado o Admin?

    alt Sin permiso
        API-->>SPA: 403 Forbidden
        SPA-->>Usuario: "No tienes permisos"
    else Con permiso — verificar concurrencia
        API->>API: Compara version recibida con updated_at

        alt Ticket modificado por otro (versión desactualizada)
            API-->>SPA: 409 Conflict (Datos actuales)
            SPA-->>Usuario: Aviso: ¿Sobreescribir o descartar?

            alt Usuario elige Sobreescribir
                Usuario->>SPA: Confirma sobreescribir
                SPA->>API: PATCH /tickets/:id { force: true }
            else Usuario elige Descartar
                Usuario->>SPA: Descarta cambios
                SPA->>API: GET /tickets/:id
                API->>DB: SELECT * FROM tickets
                DB-->>API: Ticket actualizado
                API-->>SPA: 200 OK (Datos nuevos)
                SPA-->>Usuario: Actualiza visualmente el tablero
            end
        end

        API->>DB: UPDATE tickets SET estado = 'Listo'
        DB-->>API: Confirmación de actualización

        API-->>SPA: 200 OK { ticket }
        SPA->>SPA: Mueve tarjeta y actualiza UI
        SPA-->>Usuario: Tablero actualizado
    end

### Decisiones de diseño aplicadas

| Decisión | Origen en PRD |
|---|---|
| `version` con `updated_at` para concurrencia optimista | Sección 4 — detección de edición simultánea |
| Validación de permiso antes de tocar BD | Sección 2.1 — solo asignado o Admin puede cambiar estado |
| `force: true` para sobreescritura explícita | Sección 4 — *"ninguna versión se pierde sin decisión explícita"* |
| `updated_at` automático en UPDATE | Sección 2.2 — fecha de última edición es sistema, no editable |
