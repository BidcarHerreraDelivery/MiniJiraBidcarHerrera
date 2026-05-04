# PRD — Mini Jira (v1.0)
> **Estado:** Borrador inicial · Basado en reunión kick-off del 24 de octubre  
> **Stakeholders:** Laura (PO), Marcos (Tech Lead), Sofía (Dev Junior), Roberto (PM)  
> **Horizonte de entrega comprometido:** 3 semanas ⚠️ *sujeto a revisión tras cierre de decisiones pendientes*

---

## 1. Objetivo del producto

Herramienta interna de gestión de tareas para un equipo de 10 personas. Debe reemplazar el uso informal de listas o Jira corporativo con una solución ligera, visualmente limpia y sin curva de aprendizaje.

---

## 2. In Scope — V1

### 2.1 Autenticación y Roles
| Elemento | Detalle |
|---|---|
| Acceso | Login con credenciales internas (no SSO corporativo en V1) |
| Rol **Admin** | Gestiona usuarios, puede archivar cualquier ticket, puede cambiar cualquier estado |
| Rol **Usuario** | Crea tickets, edita y archiva únicamente sus propios tickets, cambia estado de tickets que le están asignados |
| Creación de admins | Solo un admin puede promover a otro usuario a admin |

### 2.2 Tickets
| Campo | Tipo | Notas |
|---|---|---|
| Título | Texto corto (≤ 120 chars) | Obligatorio |
| Descripción | Texto largo (rich text básico) | Opcional |
| Estado | Enum | Ver sección 2.3 |
| Prioridad | Enum: Baja / Media / Alta | Obligatorio al crear |
| Asignado a | Usuario del sistema | Puede quedar sin asignar |
| Etiquetas | Multi-select libre | Opcional |
| Creado por | Sistema (auto) | No editable |
| Fecha de creación | Sistema (auto) | No editable |
| Fecha de última edición | Sistema (auto) | Trazabilidad mínima |

### 2.3 Estados del ticket
```
Por hacer → En progreso → Review → Listo
                ↕
             Bloqueado
```
> **Decisión:** Se adoptan 5 estados. "Review" y "Bloqueado" son necesarios para que las métricas reflejen la realidad del flujo. La vista de tablero mostrará 4 columnas activas + 1 columna colapsable para "Bloqueado" para satisfacer la restricción visual de Laura.

### 2.4 Comportamiento de "Eliminar"
- El botón se etiqueta **"Archivar"** (no "Eliminar") para eliminar ambigüedad.
- Los tickets archivados **no se borran** de la base de datos.
- Los tickets archivados **no aparecen** en el tablero principal ni en filtros por defecto.
- Los tickets archivados **sí cuentan** en el dashboard de métricas bajo la categoría "Cerrado/Archivado".
- Solo puede archivar: el **creador del ticket** o un **Admin**.

### 2.5 Comentarios
- Cualquier usuario autenticado puede comentar en cualquier ticket visible.
- Solo el **autor del comentario** o un **Admin** puede editar o eliminar su propio comentario.
- No se puede comentar en un ticket archivado.

### 2.6 Filtros y búsqueda
- Filtros disponibles: estado, prioridad, etiqueta, asignado a, fecha de creación (rango).
- Los filtros son acumulables (AND).
- Búsqueda de texto libre sobre título y descripción.

### 2.7 Notificaciones por email
| Evento | Destinatario |
|---|---|
| Ticket asignado a ti | Usuario asignado |
| Mencionado en comentario (`@usuario`) | Usuario mencionado |
- Las notificaciones son asíncronas (no bloquean la acción del usuario).
- No hay preferencias de notificación en V1 (todas activas por defecto).

### 2.8 Dashboard de métricas
- Tickets creados vs. cerrados/archivados por mes (gráfico de barras).
- Distribución de tickets por estado actual (gráfico de dona).
- Filtro de rango de fechas en el dashboard.
- Los datos se calculan sobre la base de datos en tiempo real (sin caché de analítica separada en V1).

### 2.9 Exportación de datos
- Cualquier usuario puede exportar el listado de tickets visible según sus filtros activos.
- Formatos soportados: **CSV** y **PDF**.
- El export respeta los permisos del usuario (solo exporta lo que puede ver).
- El PDF incluye: título, descripción, estado, prioridad, asignado, fecha de creación y última edición.
- La exportación es bajo demanda (botón manual); no hay exports programados en V1.
---

## 3. Out of Scope — V1

| Funcionalidad | Motivo de exclusión |
|---|---|
| Modo oscuro | Complejidad de theming no justificada en V1 |
| SSO / Login con cuentas corporativas | Fuera del alcance técnico del sprint inicial |
| Historial completo de cambios por campo (audit log) | Requiere diseño de esquema adicional; candidato para V2 |
| Eliminación física de tickets | Decisión de negocio: los datos se conservan siempre |
| Adjuntos / archivos en tickets | No mencionado; añade complejidad de almacenamiento |
| Notificaciones in-app (tiempo real / WebSockets) | Solo email en V1 |
| Preferencias de notificación por usuario | V2 |
| Integración con Slack u otras herramientas | Fuera de alcance |
| Sub-tareas o tickets relacionados | Fuera de alcance |
| Control de tiempo trabajado (time tracking) | Mencionado como campo sensible; excluido de V1 |
| Gráficas de velocidad o burndown | V2 |

---

## 4. Concurrencia — Comportamiento definido

> Estas reglas responden las preguntas que quedaron sin resolver en la reunión del 24/oct.

| Escenario | Comportamiento esperado |
|---|---|
| Dos usuarios editan el mismo ticket simultáneamente | El sistema muestra un **aviso** al segundo usuario al intentar guardar: *"Este ticket fue modificado por [usuario] hace X segundos. ¿Deseas sobreescribir o descartar tus cambios?"* |
| Un usuario cambia el estado mientras otro edita | Al guardar el editor, el sistema valida que el estado no haya cambiado. Si cambió, muestra aviso con el estado actual antes de confirmar el guardado. |
| Ticket archivado mientras se redacta un comentario | El sistema rechaza el envío del comentario e informa al usuario que el ticket fue archivado. |

---

## 5. Ciclo de vida del ticket

```
Creación → [Por hacer | En progreso | Review | Bloqueado] → Listo → Archivado
                                                                        ↓
                                                              (visible solo en dashboard
                                                               y búsqueda avanzada)
```

**Reasignación por baja de usuario:**  
Si un usuario es desactivado del sistema, sus tickets asignados quedan como **"Sin asignar"** y un Admin recibe notificación por email con el listado.

---

## 6. Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | React | Definido por el equipo técnico en reunión |
| **Backend** | Node.js | Definido por el equipo técnico en reunión |
| **Base de datos** | PostgreSQL (relacional) | Necesario por la lógica de estados, roles y relaciones entre entidades |
| **UI / Design System** | Librería de componentes (ej. Shadcn/UI o Radix + Tailwind) | Estética "limpia tipo Apple", sin construir desde cero |
| **Email** | Servicio transaccional (ej. Resend o SendGrid) | Notificaciones asíncronas con plantillas |
| **ORM** | Por definir por Tech Lead | Recomendado para flexibilidad ante cambios de esquema en sprint 1 |
| **Despliegue** | Por definir | No discutido en reunión |

---

## 7. Decisiones pendientes (bloquean el inicio del desarrollo)

| # | Pregunta | Responsable | Fecha límite |
|---|---|---|---|
| D-01 | ¿Los usuarios pueden ver **todos** los tickets del equipo o solo los propios/asignados? | Laura (PO) | Antes de iniciar sprint 1 |
| D-02 | ¿Qué sucede con los tickets cuando un usuario es dado de baja y no hay admin disponible para reasignar? | Roberto (PM) | Antes de iniciar sprint 1 |
| D-03 | ¿El dashboard es accesible para todos los usuarios o solo para admins/dirección? | Laura (PO) | Antes de iniciar sprint 1 |
| D-04 | ¿Cuál es la plataforma de despliegue? (afecta configuración del servicio de email) | Roberto (PM) | Semana 1 |

---

## 8. Criterios de aceptación mínimos para producción (V1)

- [ ] Un usuario puede registrarse, iniciar sesión y cerrar sesión.
- [ ] Un usuario puede crear, editar y archivar sus propios tickets.
- [ ] Un admin puede gestionar cualquier ticket.
- [ ] El tablero muestra los tickets en columnas por estado con filtros funcionales.
- [ ] Los comentarios funcionan y disparan notificaciones por email.
- [ ] El dashboard muestra al menos la gráfica de tickets creados vs. cerrados por mes.
- [ ] El sistema muestra aviso ante edición concurrente del mismo ticket.

---

*Documento generado por el equipo de PM · Próxima revisión: tras cierre de decisiones D-01 a D-04*
