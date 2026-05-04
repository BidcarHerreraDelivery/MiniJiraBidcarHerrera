# Frontend Specs — Mini Jira V1

> **Estado:** Aprobado para desarrollo  
> **Referencia:** PRD v1.0 · specs.md · backlog.md · init_db.sql  
> **Decisiones D-01 a D-04 del PRD resueltas:** incorporadas en este documento

---

## 1. Stack y versiones

| Capa | Tecnología | Versión |
|---|---|---|
| **Lenguaje** | TypeScript | 5.x |
| **Framework UI** | React | 19.x |
| **Build tool** | Vite | 6.x |
| **Routing** | React Router | v7 |
| **Server state** | TanStack Query (React Query) | v5 |
| **Client state** | Zustand | v5 |
| **Design System** | Shadcn/UI | latest |
| **CSS** | Tailwind CSS | v3 |
| **Formularios** | React Hook Form | v7 |
| **Validación** | Zod | v3 |
| **Rich text** | Tiptap | v2 |
| **Drag & drop** | @dnd-kit/core | v6 |
| **Gráficas** | Recharts | v2 |
| **Gestor de paquetes** | npm | — |

---

## 2. Dependencias

### 2.1 Producción

```jsonc
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^7.0.0",                    // routing + guards declarativos
  "@tanstack/react-query": "^5.0.0",           // caché y sincronización de datos del servidor
  "zustand": "^5.0.0",                          // estado de UI local (modal abierto, filtros activos, etc.)
  "@tiptap/react": "^2.0.0",                    // editor rich text de la descripción del ticket
  "@tiptap/starter-kit": "^2.0.0",             // Bold, Italic, Listas, Encabezados
  "@tiptap/extension-link": "^2.0.0",          // enlaces en descripción
  "@tiptap/extension-mention": "^2.0.0",       // menciones @usuario en comentarios
  "@dnd-kit/core": "^6.0.0",                    // drag-and-drop del tablero Kanban
  "@dnd-kit/sortable": "^8.0.0",               // columnas ordenables
  "@dnd-kit/utilities": "^3.0.0",              // helpers de transformación
  "recharts": "^2.0.0",                         // gráficas del dashboard (barras + donut)
  "react-hook-form": "^7.0.0",                 // manejo de formularios
  "zod": "^3.0.0",                              // esquemas de validación
  "@hookform/resolvers": "^3.0.0",             // puente React Hook Form ↔ Zod
  "axios": "^1.7.0",                            // cliente HTTP con interceptores
  "date-fns": "^3.0.0"                          // formateo de fechas (locale es)
}
```

### 2.2 Desarrollo

```jsonc
{
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "typescript": "^5.0.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "tailwindcss": "^3.0.0",
  "autoprefixer": "^10.0.0",
  "postcss": "^8.0.0"
}
```

> **Nota:** PDF generado por el backend (Node.js). El frontend solo hace GET al endpoint de exportación y descarga el archivo resultante; no requiere librería de PDF en cliente.

---

## 3. Modelo de datos (frontend — TypeScript)

```typescript
// ─── Enumerados ────────────────────────────────────────────────────────────────
type UserRole       = 'admin' | 'usuario';
type TicketStatus   = 'por_hacer' | 'en_progreso' | 'review' | 'bloqueado' | 'listo';
type TicketPriority = 'baja' | 'media' | 'alta';

// ─── Entidades ─────────────────────────────────────────────────────────────────
interface User {
  id:        string;   // UUID
  email:     string;
  name:      string;
  role:      UserRole;
  active:    boolean;
  createdAt: string;   // ISO 8601
  updatedAt: string;
}

interface Label {
  id:   string;
  name: string;
}

interface Ticket {
  id:          string;
  title:       string;                   // ≤ 120 chars
  description: string | null;            // HTML generado por Tiptap; null si vacío
  status:      TicketStatus;
  priority:    TicketPriority;
  createdBy:   User;                     // relación expandida desde el backend
  assignedTo:  User | null;
  labels:      Label[];
  archivedAt:  string | null;            // null = activo; ISO 8601 = archivado
  createdAt:   string;
  updatedAt:   string;                   // timestamp de concurrencia optimista
}

interface Comment {
  id:        string;
  ticketId:  string;
  user:      User;
  content:   string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth / sesión (Zustand authStore) ────────────────────────────────────────
interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  setUser:         (user: User) => void;
  clearSession:    () => void;
}

// ─── Filtros de tablero (Zustand filterStore / URL query params) ───────────────
interface TicketFilters {
  status?:    TicketStatus[];
  priority?:  TicketPriority[];
  labels?:    string[];           // label IDs
  assignedTo?: string;            // user ID
  createdFrom?: string;           // ISO date
  createdTo?:   string;           // ISO date
  search?:      string;           // texto libre sobre título y descripción
}

// ─── Respuestas de la API ──────────────────────────────────────────────────────
interface ApiError {
  statusCode: number;
  message:    string;
  code?:      string;             // ej. 'CONFLICT', 'FORBIDDEN'
}

interface PaginatedResponse<T> {
  data:  T[];
  total: number;
  page:  number;
  limit: number;
}
```

---

## 4. Arquitectura de componentes

### 4.1 Mapa de páginas y rutas

| Ruta | Componente página | Acceso |
|---|---|---|
| `/login` | `LoginPage` | Público (redirige si ya autenticado) |
| `/` | → redirect `/board` | Autenticado |
| `/board` | `BoardPage` | Todos los roles |
| `/tickets/:id` | `TicketDetailPage` | Todos los roles |
| `/dashboard` | `DashboardPage` | Todos los roles |
| `/admin/users` | `AdminUsersPage` | Solo `admin` |
| `*` | `NotFoundPage` | — |

### 4.2 Árbol de componentes

```
App
├── RouterProvider (React Router v7)
│   ├── PublicRoute
│   │   └── LoginPage
│   │       └── LoginForm (react-hook-form + zod)
│   └── ProtectedRoute (valida sesión; redirige a /login si no hay cookie)
│       └── AppShell
│           ├── Sidebar
│           │   ├── NavItem[Tablero]
│           │   ├── NavItem[Dashboard]
│           │   └── NavItem[Usuarios] (solo admin)
│           ├── TopBar
│           │   ├── UserMenu
│           │   └── LogoutButton
│           └── Outlet (página activa)
│
├── BoardPage
│   ├── TicketFilters (persiste en URL query params)
│   │   ├── StatusFilter
│   │   ├── PriorityFilter
│   │   ├── LabelFilter
│   │   ├── AssigneeFilter
│   │   ├── DateRangeFilter
│   │   └── SearchInput
│   ├── ExportButton (descarga CSV o PDF vía backend)
│   └── KanbanBoard (DndContext de @dnd-kit)
│       ├── KanbanColumn[Por hacer]
│       │   └── TicketCard[] (Draggable)
│       ├── KanbanColumn[En progreso]
│       ├── KanbanColumn[Review]
│       ├── KanbanColumn[Listo]
│       └── KanbanColumn[Bloqueado] (colapsable)
│           └── TicketCard[] (Draggable)
│
├── TicketDetailPage  (/tickets/:id)
│   ├── TicketHeader (título, estado, prioridad, badges)
│   ├── TicketForm (react-hook-form; modo edición inline)
│   │   ├── TitleInput (maxLength=120, contador de chars)
│   │   ├── TiptapEditor (descripción; bold/italic/listas/links)
│   │   ├── StatusSelect
│   │   ├── PrioritySelect
│   │   ├── AssigneeSelect (solo usuarios activos)
│   │   └── LabelMultiSelect (creación al vuelo)
│   ├── ConcurrencyWarningDialog (aparece en 409 o al detectar cambio por polling)
│   │   ├── "Sobreescribir mis cambios"
│   │   └── "Descartar y ver versión actual"
│   ├── ArchiveButton (visible si: es creador O es admin; ticket no archivado)
│   └── CommentSection
│       ├── CommentList
│       │   └── CommentItem[]
│       │       ├── CommentContent
│       │       ├── EditCommentForm (si: es autor O es admin)
│       │       └── DeleteCommentButton (si: es autor O es admin)
│       └── NewCommentForm (Tiptap para menciones @usuario)
│           └── MentionSuggestions (dropdown de usuarios activos)
│
├── DashboardPage
│   ├── DateRangePicker (persiste en URL query params)
│   ├── BarChartWidget  (tickets creados vs. cerrados/archivados por mes — Recharts)
│   └── DonutChartWidget (distribución por estado actual — Recharts)
│
└── AdminUsersPage  (AdminRoute — solo admin)
    ├── UserTable
    │   └── UserRow[]
    │       ├── RoleBadge
    │       ├── PromoteButton (promueve a admin; solo si actor es admin)
    │       ├── DeactivateButton
    │       └── StatusBadge (activo / inactivo)
    └── CreateUserDialog
        └── CreateUserForm (react-hook-form + zod)
```

### 4.3 Componentes UI reutilizables (Shadcn/UI base + extensiones)

| Componente | Origen | Uso |
|---|---|---|
| `Button` | Shadcn | CTA, acciones |
| `Input` | Shadcn | Campos de texto |
| `Select` | Shadcn | Estado, prioridad, asignado |
| `Dialog` | Shadcn | ConcurrencyWarning, CreateUser, confirmaciones |
| `Badge` | Shadcn | Estado, prioridad, etiquetas |
| `Tooltip` | Shadcn | Info contextual |
| `DropdownMenu` | Shadcn | UserMenu, acciones de ticket |
| `Toast` (Sonner) | Shadcn | Feedback de acciones (éxito / error) |
| `Skeleton` | Shadcn | Carga de tickets y gráficas |
| `Avatar` | Shadcn | Foto/iniciales del usuario asignado |
| `TiptapEditor` | Custom | Descripción del ticket y comentarios |
| `CharCounter` | Custom | Contador de chars en TitleInput |
| `EmptyState` | Custom | Tablero sin resultados, columna vacía |
| `ErrorBoundary` | Custom | Errores de renderizado aislados |

---

## 5. Estructura de carpetas

```
mini-jira-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                     # Imágenes, iconos estáticos
│   │
│   ├── components/
│   │   ├── ui/                     # Re-exports de Shadcn/UI + overrides CSS
│   │   └── layout/
│   │       ├── AppShell.tsx
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts    # Zustand: user, isAuthenticated
│   │   │   ├── api/
│   │   │   │   └── authApi.ts      # POST /auth/login, POST /auth/logout
│   │   │   └── schemas/
│   │   │       └── loginSchema.ts  # Zod
│   │   │
│   │   ├── tickets/
│   │   │   ├── components/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── TicketCard.tsx
│   │   │   │   ├── TicketForm.tsx
│   │   │   │   ├── TicketFilters.tsx
│   │   │   │   ├── TicketHeader.tsx
│   │   │   │   ├── ConcurrencyWarningDialog.tsx
│   │   │   │   ├── ArchiveButton.tsx
│   │   │   │   └── ExportButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTickets.ts         # TanStack Query: GET /tickets
│   │   │   │   ├── useTicketDetail.ts    # TanStack Query: GET /tickets/:id
│   │   │   │   ├── useMutateTicket.ts    # create / edit / archive
│   │   │   │   ├── useDragTicket.ts      # lógica @dnd-kit → PATCH /tickets/:id
│   │   │   │   └── useConcurrencyPoll.ts # polling 30s cuando modal de edición está abierto
│   │   │   ├── api/
│   │   │   │   └── ticketsApi.ts
│   │   │   ├── schemas/
│   │   │   │   └── ticketSchema.ts       # Zod
│   │   │   └── store/
│   │   │       └── filterStore.ts        # Zustand: filtros activos sincronizados con URL
│   │   │
│   │   ├── comments/
│   │   │   ├── components/
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── CommentItem.tsx
│   │   │   │   ├── NewCommentForm.tsx
│   │   │   │   └── EditCommentForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useComments.ts
│   │   │   │   └── useMutateComment.ts
│   │   │   └── api/
│   │   │       └── commentsApi.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── BarChartWidget.tsx
│   │   │   │   └── DonutChartWidget.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardMetrics.ts
│   │   │   └── api/
│   │   │       └── dashboardApi.ts
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── UserTable.tsx
│   │       │   ├── UserRow.tsx
│   │       │   └── CreateUserDialog.tsx
│   │       ├── hooks/
│   │       │   ├── useUsers.ts
│   │       │   └── useMutateUser.ts
│   │       ├── api/
│   │       │   └── usersApi.ts
│   │       └── schemas/
│   │           └── userSchema.ts
│   │
│   ├── lib/
│   │   ├── axios.ts               # instancia Axios + interceptores (manejo 401, 409)
│   │   └── utils.ts               # cn(), formatDate(), truncate()
│   │
│   ├── router/
│   │   ├── index.tsx              # createBrowserRouter (React Router v7)
│   │   ├── ProtectedRoute.tsx     # valida authStore; redirige a /login
│   │   └── AdminRoute.tsx         # valida role === 'admin'; redirige a /board
│   │
│   ├── types/
│   │   └── index.ts               # User, Ticket, Comment, Label, ApiError, etc.
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── BoardPage.tsx
│   │   ├── TicketDetailPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AdminUsersPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── App.tsx                    # RouterProvider + QueryClientProvider
│   └── main.tsx                   # createRoot
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── package.json
```

---

## 6. Reglas de negocio (frontend)

### 6.1 Autenticación y sesión

| Regla | Detalle |
|---|---|
| **Almacenamiento JWT** | httpOnly cookie gestionada por el servidor; el frontend nunca accede al token directamente |
| **Verificación de sesión** | Al montar `App`, se hace GET `/auth/me`; si responde 401 → redirect `/login` |
| **Logout** | POST `/auth/logout` + `clearSession()` en Zustand + redirect `/login` |
| **Sin registro público** | No existe ruta `/register`; solo admins crean cuentas desde `/admin/users` |
| **Guard de admin** | `AdminRoute` comprueba `authStore.user.role === 'admin'`; si no → redirect `/board` |

### 6.2 Visibilidad de datos

| Regla | Detalle |
|---|---|
| **Todos los tickets visibles** | Cualquier usuario autenticado ve todos los tickets activos del equipo (D-01 resuelto) |
| **Tickets archivados** | No aparecen en el tablero ni en los resultados de filtros por defecto; sí cuentan en el dashboard bajo "Cerrado/Archivado" |
| **Dashboard** | Accesible para todos los roles autenticados (D-03 resuelto) |
| **Gestión de usuarios** | Ruta `/admin/users` exclusiva para rol `admin` |

### 6.3 Permisos de acción (UI)

| Acción | Quién puede hacerla |
|---|---|
| Crear ticket | Cualquier usuario autenticado |
| Editar campos del ticket (título, descripción, etiquetas, asignado, prioridad) | Creador del ticket **o** Admin |
| Cambiar estado del ticket | Usuario asignado **o** Admin |
| Archivar ticket | Creador del ticket **o** Admin |
| Comentar en ticket activo | Cualquier usuario autenticado |
| Comentar en ticket archivado | **Prohibido** — el campo de comentario se deshabilita y muestra aviso |
| Editar / eliminar comentario | Autor del comentario **o** Admin |
| Crear / desactivar usuarios | Solo Admin |
| Promover usuario a admin | Solo Admin |
| Asignar ticket a usuario desactivado | **Prohibido** — el selector filtra solo usuarios activos |

> La UI oculta o deshabilita (no solo oculta) los controles a los que el usuario no tiene acceso para evitar confusión. Si el backend igual rechaza la acción, se muestra un Toast de error.

### 6.4 Validaciones de formulario (Zod)

**Ticket (crear / editar):**
- `title`: `string().min(1, "El título es obligatorio").max(120, "Máximo 120 caracteres")`
- `priority`: `enum(['baja','media','alta'], { required_error: "La prioridad es obligatoria" })`
- `description`: `string().optional()` (rich text HTML; puede ser nulo)
- `assignedTo`: `string().uuid().optional().nullable()`
- `labels`: `array(string().uuid()).optional()`

**Crear usuario (admin):**
- `name`: `string().min(2).max(255)`
- `email`: `string().email()`
- `role`: `enum(['admin','usuario'])`

**Login:**
- `email`: `string().email()`
- `password`: `string().min(8)`

### 6.5 Concurrencia optimista

| Paso | Comportamiento |
|---|---|
| **Al abrir un ticket en modo edición** | Se inicia `useConcurrencyPoll`: cada 30 s se hace GET `/tickets/:id` comparando `updatedAt` con el valor cargado |
| **Si `updatedAt` cambió durante la edición** | Se muestra `ConcurrencyWarningDialog` sin bloquear la edición en curso: "Este ticket fue modificado por [usuario.name] hace X seg. ¿Sobreescribir o descartar?" |
| **Al guardar (PATCH)** | Se envía `{ ...cambios, updatedAt: versionCargada }`. Si el backend responde **409**, se dispara el mismo diálogo aunque el polling no lo haya detectado antes |
| **Opción "Sobreescribir"** | Se reenvía PATCH con `force: true` |
| **Opción "Descartar"** | Se cancela la edición, se hace GET `/tickets/:id` para recargar la versión actual y se detiene el polling |
| **Ticket archivado durante edición de comentario** | Si el POST `/comments` recibe 422/409 con código `TICKET_ARCHIVED`, se muestra Toast de error y el texto del comentario se conserva en el campo para que el usuario pueda copiarlo |

### 6.6 Tablero Kanban

| Regla | Detalle |
|---|---|
| **Columnas** | 4 columnas principales: Por hacer · En progreso · Review · Listo + 1 columna "Bloqueado" colapsable |
| **Drag & drop** | Al soltar una tarjeta en otra columna se hace PATCH `/tickets/:id { status, updatedAt }` inmediatamente (optimistic update con rollback en error) |
| **Columna "Bloqueado"** | Colapsada por defecto; se expande con toggle manual; muestra badge con conteo de tickets |
| **Filtros** | Se sincronizan con URL query params; el tablero se re-filtra al cambiar la URL |
| **Búsqueda de texto** | Debounce de 350 ms antes de enviar query al backend |
| **Tickets archivados** | No aparecen en ninguna columna del tablero activo |

### 6.7 Rich text (Tiptap)

**Extensiones habilitadas (descripción de ticket):**
- `StarterKit` (bold, italic, listas ordenadas/desordenadas, párrafos, encabezados H1–H3)
- `Link` (inserción de enlaces externos)

**Extensiones habilitadas (comentarios):**
- `StarterKit` (solo bold e italic; sin encabezados)
- `Mention` (autocompletado `@usuario` sobre lista de usuarios activos)

**Output:** HTML serializado. El backend almacena el HTML en `description` / `comments.content` como texto plano (sin saneado en frontend; el backend es responsable de sanitizar).

### 6.8 Dashboard de métricas

| Widget | Datos | Filtro |
|---|---|---|
| **Gráfica de barras** | Tickets creados vs. cerrados/archivados agrupados por mes | Rango de fechas (persiste en URL) |
| **Gráfica de donut** | Distribución de tickets por estado actual (incluye archivados bajo "Cerrado/Archivado") | Rango de fechas |

- Los datos se solicitan al backend en tiempo real (sin caché de analítica local).
- TanStack Query cachea la respuesta 1 minuto (`staleTime: 60_000`).

### 6.9 Exportación

| Formato | Comportamiento |
|---|---|
| **CSV** | GET `/export/csv?[filtros activos]` → el navegador descarga el archivo directamente |
| **PDF** | GET `/export/pdf?[filtros activos]` → el navegador descarga el archivo directamente |
| **Permisos** | El backend aplica los permisos del usuario autenticado; el frontend solo pasa los filtros activos |
| **Feedback** | Botón muestra spinner mientras la respuesta llega; Toast de éxito al completar o de error si falla |

### 6.10 Manejo de errores HTTP

| Código | Acción en frontend |
|---|---|
| 401 | Limpiar sesión Zustand + redirect `/login` |
| 403 | Toast "No tienes permisos para realizar esta acción" |
| 404 | Mostrar `NotFoundPage` o Toast según contexto |
| 409 | Abrir `ConcurrencyWarningDialog` con los datos actuales del servidor |
| 422 | Mostrar errores de validación junto al campo correspondiente (React Hook Form) |
| 5xx | Toast "Error del servidor. Intenta de nuevo." |

El interceptor de Axios en `src/lib/axios.ts` centraliza los casos 401 y 5xx. El resto se gestiona en cada hook de mutación.

### 6.11 Menciones `@usuario` en comentarios

- Tiptap `Mention` muestra un dropdown al escribir `@`; filtra usuarios activos del sistema.
- El texto se serializa como HTML con `data-mention-id` para que el backend pueda extraer los destinatarios de notificación.
- Si el usuario mencionado está desactivado, el backend omite el email (EC-02); el frontend no realiza ninguna validación previa sobre ello.

---

## 7. Decisiones del PRD resueltas en este documento

| ID | Decisión | Resolución |
|---|---|---|
| D-01 | ¿Los usuarios ven todos los tickets? | **Sí.** Todos los autenticados ven todos los tickets activos del equipo (confirmado por HU-01 del backlog) |
| D-02 | Tickets al dar de baja a un usuario | Pasan a `assignedTo = null` ("Sin asignar"); el Admin recibe email. Flujo manejado por el backend; el frontend solo refresca el tablero |
| D-03 | ¿El dashboard es para todos? | **Sí.** Accesible para cualquier usuario autenticado |
| D-04 | Plataforma de despliegue | No afecta la especificación del frontend en V1 |

---

*Documento generado a partir del PRD v1.0 · backlog.md · mermaid_design.md · init_db.sql*  
*Próximo paso: confirmación del equipo técnico → inicio de scaffolding con `npm create vite@latest`*
