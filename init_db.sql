-- =============================================================================
-- init_db.sql — Mini Jira V1
-- Base de datos: PostgreSQL 15+
-- Referencia: PRD v1.0 · specs.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- búsqueda de texto libre (ILIKE optimizado)

-- -----------------------------------------------------------------------------
-- TIPOS ENUMERADOS
-- Secciones PRD: 2.1 (roles), 2.2 (prioridad), 2.3 (estados)
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
    'admin',
    'usuario'
);

CREATE TYPE ticket_status AS ENUM (
    'por_hacer',
    'en_progreso',
    'review',
    'bloqueado',
    'listo'
);

CREATE TYPE ticket_priority AS ENUM (
    'baja',
    'media',
    'alta'
);

CREATE TYPE notification_event AS ENUM (
    'ticket_asignado',           -- PRD §2.7: ticket asignado al usuario
    'mencion_comentario',        -- PRD §2.7: @usuario en comentario
    'tickets_huerfanos'          -- PRD §5: baja de usuario con tickets asignados
);

CREATE TYPE notification_status AS ENUM (
    'enviada',
    'omitida_cuenta_inactiva',   -- EC-02: destinatario desactivado
    'fallida'                    -- fallo en proveedor externo de email
);

-- -----------------------------------------------------------------------------
-- FUNCIÓN AUXILIAR — actualización automática de updated_at
-- Usada por todos los triggers de las tablas principales
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLA: users
-- PRD §2.1 — Autenticación y Roles
-- =============================================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(255) NOT NULL,
    password_hash TEXT         NOT NULL,
    role          user_role    NOT NULL DEFAULT 'usuario',
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE  users              IS 'Cuentas del equipo. Roles: admin | usuario.';
COMMENT ON COLUMN users.active       IS 'FALSE = usuario desactivado. Sus tickets quedan sin asignar (ver PRD §5).';
COMMENT ON COLUMN users.role         IS 'Solo un admin puede promover a otro usuario a admin (PRD §2.1).';
COMMENT ON COLUMN users.updated_at   IS 'Actualizado automáticamente por trigger.';

-- =============================================================================
-- TABLA: tickets
-- PRD §2.2, §2.3, §2.4, §5 — Ciclo de vida del ticket
-- =============================================================================
CREATE TABLE tickets (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(120)    NOT NULL
                                  CONSTRAINT chk_tickets_title_not_empty
                                  CHECK (char_length(trim(title)) > 0),
    description   TEXT,
    status        ticket_status   NOT NULL DEFAULT 'por_hacer',
    priority      ticket_priority NOT NULL,
    created_by    UUID            NOT NULL
                                  REFERENCES users(id)
                                  ON DELETE RESTRICT,
    assigned_to   UUID            REFERENCES users(id)
                                  ON DELETE SET NULL,    -- PRD §5: baja → NULL (sin asignar)
    archived_at   TIMESTAMPTZ,                           -- NULL = activo | NOT NULL = archivado
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW() -- usado para concurrencia optimista (PRD §4)
);

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE  tickets              IS 'Unidad central de trabajo. Archivado lógico: archived_at IS NOT NULL.';
COMMENT ON COLUMN tickets.title        IS 'Obligatorio. Máx 120 caracteres (PRD §2.2).';
COMMENT ON COLUMN tickets.priority     IS 'Obligatorio al crear (PRD §2.2).';
COMMENT ON COLUMN tickets.created_by   IS 'Inmutable tras creación. No editable por el usuario (PRD §2.2).';
COMMENT ON COLUMN tickets.assigned_to  IS 'Nullable. Si el usuario asignado es desactivado, pasa a NULL (PRD §5).';
COMMENT ON COLUMN tickets.archived_at  IS 'Archivado lógico. Tickets archivados no aparecen en tablero (PRD §2.4).';
COMMENT ON COLUMN tickets.updated_at   IS 'Timestamp de concurrencia optimista (PRD §4). Actualizado por trigger.';

-- =============================================================================
-- TABLA: labels
-- PRD §2.2 — Etiquetas multi-select libre
-- =============================================================================
CREATE TABLE labels (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE labels IS 'Catálogo de etiquetas libres. Se crean al vuelo desde el formulario de ticket.';

-- =============================================================================
-- TABLA: ticket_labels  (relación N:M tickets ↔ labels)
-- =============================================================================
CREATE TABLE ticket_labels (
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    label_id  UUID NOT NULL REFERENCES labels(id)  ON DELETE CASCADE,
    PRIMARY KEY (ticket_id, label_id)
);

COMMENT ON TABLE ticket_labels IS 'Relación N:M entre tickets y etiquetas.';

-- =============================================================================
-- TABLA: comments
-- PRD §2.5 — Comentarios en tickets
-- =============================================================================
CREATE TABLE comments (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  UUID        NOT NULL
                           REFERENCES tickets(id)
                           ON DELETE CASCADE,
    user_id    UUID        NOT NULL
                           REFERENCES users(id)
                           ON DELETE RESTRICT,
    content    TEXT        NOT NULL
                           CONSTRAINT chk_comments_content_not_empty
                           CHECK (char_length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE  comments           IS 'Comentarios por ticket. Solo el autor o un admin puede editar/eliminar (PRD §2.5).';
COMMENT ON COLUMN comments.ticket_id IS 'Cascade delete: si el ticket se borra físicamente, sus comentarios también.';
COMMENT ON COLUMN comments.user_id   IS 'RESTRICT: no se puede eliminar un usuario con comentarios.';

-- =============================================================================
-- TABLA: notification_log
-- PRD §2.7, EC-02 — Trazabilidad de notificaciones email
-- =============================================================================
CREATE TABLE notification_log (
    id           UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    event        notification_event  NOT NULL,
    recipient_id UUID                REFERENCES users(id) ON DELETE SET NULL,
    ticket_id    UUID                REFERENCES tickets(id) ON DELETE SET NULL,
    comment_id   UUID                REFERENCES comments(id) ON DELETE SET NULL,
    status       notification_status NOT NULL,
    metadata     JSONB,              -- payload adicional (ej. lista de tickets huérfanos)
    created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notification_log          IS 'Registro de notificaciones email. EC-02: omitida_cuenta_inactiva trazable.';
COMMENT ON COLUMN notification_log.metadata IS 'JSON libre para datos extra: lista de tickets huérfanos, texto del error, etc.';

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- Tablero: filtros activos excluyen archivados (partial index)
CREATE INDEX idx_tickets_status      ON tickets(status)      WHERE archived_at IS NULL;
CREATE INDEX idx_tickets_priority    ON tickets(priority)    WHERE archived_at IS NULL;
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to) WHERE archived_at IS NULL;

-- Métricas y filtros por fecha (PRD §2.6, §2.8)
CREATE INDEX idx_tickets_created_at  ON tickets(created_at);
CREATE INDEX idx_tickets_archived_at ON tickets(archived_at);
CREATE INDEX idx_tickets_created_by  ON tickets(created_by);

-- Comentarios por ticket (carga del detalle de ticket)
CREATE INDEX idx_comments_ticket_id  ON comments(ticket_id);

-- Notificaciones por destinatario
CREATE INDEX idx_notif_recipient     ON notification_log(recipient_id);
CREATE INDEX idx_notif_ticket        ON notification_log(ticket_id);

-- Búsqueda de texto libre sobre título y descripción (PRD §2.6)
CREATE INDEX idx_tickets_fts ON tickets
    USING GIN (to_tsvector('spanish',
        coalesce(title, '') || ' ' || coalesce(description, '')
    ));

-- Búsqueda ILIKE rápida en etiquetas
CREATE INDEX idx_labels_name_trgm ON labels USING GIN (name gin_trgm_ops);

-- =============================================================================
-- MOCK DATA — Entorno de desarrollo / demo
-- Equipo ficticio del proyecto Mini Jira
-- Contraseñas hasheadas con bcrypt (valor en texto plano: "Password123!")
-- =============================================================================

-- -----------------------------------------------------------------------------
-- USUARIOS (3)
-- -----------------------------------------------------------------------------
INSERT INTO users (id, email, name, password_hash, role, active) VALUES
    (
        '11111111-0000-0000-0000-000000000001',
        'marcos.garcia@minijira.dev',
        'Marcos García',
        '$2b$12$KIXDoB3H5yxjmcEiw0CpZ.1w/fKqJvEBoTmj5yJMfQHGE6y5W4CzK',
        'admin',
        TRUE
    ),
    (
        '22222222-0000-0000-0000-000000000002',
        'sofia.ramirez@minijira.dev',
        'Sofía Ramírez',
        '$2b$12$KIXDoB3H5yxjmcEiw0CpZ.1w/fKqJvEBoTmj5yJMfQHGE6y5W4CzK',
        'usuario',
        TRUE
    ),
    (
        '33333333-0000-0000-0000-000000000003',
        'ana.torres@minijira.dev',
        'Ana Torres',
        '$2b$12$KIXDoB3H5yxjmcEiw0CpZ.1w/fKqJvEBoTmj5yJMfQHGE6y5W4CzK',
        'usuario',
        TRUE
    );

-- -----------------------------------------------------------------------------
-- ETIQUETAS
-- -----------------------------------------------------------------------------
INSERT INTO labels (id, name) VALUES
    ('aaaa0001-0000-0000-0000-000000000001', 'backend'),
    ('aaaa0002-0000-0000-0000-000000000002', 'frontend'),
    ('aaaa0003-0000-0000-0000-000000000003', 'infraestructura'),
    ('aaaa0004-0000-0000-0000-000000000004', 'documentación'),
    ('aaaa0005-0000-0000-0000-000000000005', 'autenticación');

-- -----------------------------------------------------------------------------
-- TICKETS (5) — estados variados
-- -----------------------------------------------------------------------------
INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to, created_at, updated_at) VALUES

    -- Ticket 1 · por_hacer · Alta · sin asignar
    (
        'bbbb0001-0000-0000-0000-000000000001',
        'Configurar pipeline de CI/CD',
        'Definir y configurar el pipeline de integración continua en GitHub Actions. Debe incluir: lint, tests unitarios y build de la imagen Docker. Bloquea el despliegue del primer sprint.',
        'por_hacer',
        'alta',
        '11111111-0000-0000-0000-000000000001',   -- creado por Marcos (Admin)
        NULL,                                      -- sin asignar
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),

    -- Ticket 2 · en_progreso · Alta · asignado a Ana
    (
        'bbbb0002-0000-0000-0000-000000000002',
        'Implementar autenticación JWT',
        'Crear los endpoints POST /auth/login y POST /auth/refresh. El token de acceso debe expirar en 15 minutos y el refresh token en 7 días. Usar la librería jsonwebtoken. Referencia: PRD §2.1.',
        'en_progreso',
        'alta',
        '11111111-0000-0000-0000-000000000001',   -- creado por Marcos
        '33333333-0000-0000-0000-000000000003',   -- asignado a Ana
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '1 day'
    ),

    -- Ticket 3 · en_progreso · Media · asignado a Sofía
    (
        'bbbb0003-0000-0000-0000-000000000003',
        'Diseñar componentes del tablero Kanban',
        'Implementar las 4 columnas activas del tablero (Por hacer, En progreso, Review, Listo) y la columna colapsable de Bloqueado usando Shadcn/UI + Tailwind. Los tickets deben ser arrastrables entre columnas. Referencia: PRD §2.3.',
        'en_progreso',
        'media',
        '22222222-0000-0000-0000-000000000002',   -- creado por Sofía
        '22222222-0000-0000-0000-000000000002',   -- asignado a sí misma
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '12 hours'
    ),

    -- Ticket 4 · review · Baja · asignado a Ana
    (
        'bbbb0004-0000-0000-0000-000000000004',
        'Documentar endpoints de la API REST',
        'Generar la especificación OpenAPI 3.0 para todos los endpoints del MVP: /auth, /tickets, /users, /comments. Publicarla en /api/docs usando Swagger UI. Incluir ejemplos de request y response para cada operación.',
        'review',
        'baja',
        '33333333-0000-0000-0000-000000000003',   -- creado por Ana
        '33333333-0000-0000-0000-000000000003',   -- asignado a Ana
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 hours'
    ),

    -- Ticket 5 · listo · Media · asignado a Sofía
    (
        'bbbb0005-0000-0000-0000-000000000005',
        'Setup inicial del proyecto React',
        'Inicializar el proyecto con Vite + React + TypeScript. Configurar Tailwind CSS, Shadcn/UI, React Router y estructura base de carpetas (components, pages, hooks, services). Verificar que el build de producción pase sin errores.',
        'listo',
        'media',
        '11111111-0000-0000-0000-000000000001',   -- creado por Marcos
        '22222222-0000-0000-0000-000000000002',   -- asignado a Sofía
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '2 days'
    );

-- -----------------------------------------------------------------------------
-- TICKET_LABELS — asignación de etiquetas
-- -----------------------------------------------------------------------------
INSERT INTO ticket_labels (ticket_id, label_id) VALUES
    ('bbbb0001-0000-0000-0000-000000000001', 'aaaa0003-0000-0000-0000-000000000003'), -- CI/CD → infraestructura
    ('bbbb0002-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000001'), -- JWT → backend
    ('bbbb0002-0000-0000-0000-000000000002', 'aaaa0005-0000-0000-0000-000000000005'), -- JWT → autenticación
    ('bbbb0003-0000-0000-0000-000000000003', 'aaaa0002-0000-0000-0000-000000000002'), -- Kanban → frontend
    ('bbbb0004-0000-0000-0000-000000000004', 'aaaa0004-0000-0000-0000-000000000004'), -- Docs → documentación
    ('bbbb0004-0000-0000-0000-000000000004', 'aaaa0001-0000-0000-0000-000000000001'), -- Docs → backend
    ('bbbb0005-0000-0000-0000-000000000005', 'aaaa0002-0000-0000-0000-000000000002'); -- Setup → frontend

-- -----------------------------------------------------------------------------
-- COMENTARIOS — conversación realista en tickets activos
-- -----------------------------------------------------------------------------
INSERT INTO comments (id, ticket_id, user_id, content, created_at, updated_at) VALUES

    -- Comentarios en ticket JWT (en progreso)
    (
        'cccc0001-0000-0000-0000-000000000001',
        'bbbb0002-0000-0000-0000-000000000002',
        '11111111-0000-0000-0000-000000000001',  -- Marcos
        'Ana, recuerda almacenar el refresh token en la BD para poder invalidarlo en logout. No lo guardes solo en el cliente.',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        'cccc0002-0000-0000-0000-000000000002',
        'bbbb0002-0000-0000-0000-000000000002',
        '33333333-0000-0000-0000-000000000003',  -- Ana
        'Entendido @marcos.garcia. Ya tengo la tabla refresh_tokens en el esquema. Subo el PR hoy por la tarde.',
        NOW() - INTERVAL '2 days 18 hours',
        NOW() - INTERVAL '2 days 18 hours'
    ),

    -- Comentario en ticket Kanban (en progreso)
    (
        'cccc0003-0000-0000-0000-000000000003',
        'bbbb0003-0000-0000-0000-000000000003',
        '11111111-0000-0000-0000-000000000001',  -- Marcos
        'Sofía, para el drag-and-drop te recomiendo @dnd-kit/core. Es más ligero que react-beautiful-dnd y tiene mejor soporte para accesibilidad.',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'cccc0004-0000-0000-0000-000000000004',
        'bbbb0003-0000-0000-0000-000000000003',
        '22222222-0000-0000-0000-000000000002',  -- Sofía
        'Gracias @marcos.garcia, ya lo estoy probando. La columna Bloqueado colapsable la implementaré con un estado local en el componente Board.',
        NOW() - INTERVAL '1 day 10 hours',
        NOW() - INTERVAL '1 day 10 hours'
    ),

    -- Comentario en ticket Docs (review)
    (
        'cccc0005-0000-0000-0000-000000000005',
        'bbbb0004-0000-0000-0000-000000000004',
        '11111111-0000-0000-0000-000000000001',  -- Marcos
        'Revisé el draft. Falta documentar los códigos de error 409 (conflicto de concurrencia) y 403 (sin permisos). Son críticos para el frontend.',
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours'
    );

-- -----------------------------------------------------------------------------
-- NOTIFICATION_LOG — trazabilidad de emails enviados
-- PRD §2.7, EC-02
-- -----------------------------------------------------------------------------
INSERT INTO notification_log (event, recipient_id, ticket_id, comment_id, status, metadata) VALUES

    -- Notificación de asignación enviada a Ana (ticket JWT)
    (
        'ticket_asignado',
        '33333333-0000-0000-0000-000000000003',
        'bbbb0002-0000-0000-0000-000000000002',
        NULL,
        'enviada',
        '{"email": "ana.torres@minijira.dev"}'
    ),

    -- Notificación de asignación enviada a Sofía (ticket Kanban y Setup)
    (
        'ticket_asignado',
        '22222222-0000-0000-0000-000000000002',
        'bbbb0003-0000-0000-0000-000000000003',
        NULL,
        'enviada',
        '{"email": "sofia.ramirez@minijira.dev"}'
    ),
    (
        'ticket_asignado',
        '22222222-0000-0000-0000-000000000002',
        'bbbb0005-0000-0000-0000-000000000005',
        NULL,
        'enviada',
        '{"email": "sofia.ramirez@minijira.dev"}'
    ),

    -- Notificación de mención a Marcos en comentario de Ana
    (
        'mencion_comentario',
        '11111111-0000-0000-0000-000000000001',
        'bbbb0002-0000-0000-0000-000000000002',
        'cccc0002-0000-0000-0000-000000000002',
        'enviada',
        '{"email": "marcos.garcia@minijira.dev", "mentioned_by": "ana.torres@minijira.dev"}'
    ),

    -- Notificación de mención a Marcos en comentario de Sofía
    (
        'mencion_comentario',
        '11111111-0000-0000-0000-000000000001',
        'bbbb0003-0000-0000-0000-000000000003',
        'cccc0004-0000-0000-0000-000000000004',
        'enviada',
        '{"email": "marcos.garcia@minijira.dev", "mentioned_by": "sofia.ramirez@minijira.dev"}'
    );
