# Plan: Construcción del Home completo — CicloVida

## Diagnóstico

El código estructural de todos los componentes ya existe, pero el **sistema de tokens no estaba configurado**:
- `tailwind.config.ts` y `index.css` tenían las variables de shadcn por defecto (HSL)
- `Sidebar`, `TopBar`, `BoardPage` usaban clases genéricas (`gray-900`, `blue-600`)
- `TicketCard` y `KanbanColumn` ya usaban `var(--token)` correctamente pero las variables no estaban definidas

## Fases y estado

| # | Fase | Archivos clave | Estado |
|---|---|---|---|
| 1 | **Tokens CSS + Tailwind config** | `index.css`, `tailwind.config.ts`, `index.html` | ✅ Completada |
| 2 | **AppShell layout** | `AppShell.tsx` | ✅ Completada |
| 3 | **Sidebar** | `Sidebar.tsx` | ✅ Completada |
| 4 | **TopBar** | `TopBar.tsx` | ✅ Completada |
| 5 | **BoardPage header** | `BoardPage.tsx` | ✅ Completada |
| 6 | **TicketFilters** | `TicketFilters.tsx` | ✅ Completada |
| 7 | **TicketCard** | `TicketCard.tsx` | ✅ Completada |
| 8 | **KanbanColumn** | `KanbanColumn.tsx` | ✅ Completada |
| 9 | **KanbanBoard** | `KanbanBoard.tsx` | ✅ Completada |
| 10 | **Integración total + modal** | `BoardPage.tsx` | ✅ Completada |

## Árbol de dependencias

```
Fase 1 (tokens)
    └── Fase 2 (AppShell)
            ├── Fase 3 (Sidebar)
            ├── Fase 4 (TopBar)
            │       └── Fase 5 (BoardPage header)
            │               └── Fase 6 (TicketFilters)
            └── Fase 7 (TicketCard) ← hoja independiente
                    └── Fase 8 (KanbanColumn)
                            └── Fase 9 (KanbanBoard)
                                    └── Fase 10 (Integración total)
```

## Tokens por fase

### Fase 3 — Sidebar
- Fondo: `inverse-surface` (#2d3039)
- Texto nav: `inverse-on-surface` (#eef0fc)
- Ítem activo: `inverse-primary` (#adc6ff)
- Tipografía: `headline-md` app name, `body-md` nav items

### Fase 4 — TopBar
- Fondo: `surface-container-lowest` (#ffffff)
- Borde: `outline-variant` (#c1c6d7), 1px
- Texto: `on-surface-variant` (#414755)
- Tipografía: `body-sm` (13px/400)

### Fase 5 — BoardPage header
- Título: `on-surface` (#181c23), `headline-lg` (24px/600)
- Botón primario: fondo `primary`, texto `on-primary`, hover `primary-container`
- Botón ghost: borde `outline-variant`, texto `on-surface`

### Fase 6 — TicketFilters
- Fondo barra: `surface-container-low` (#f1f3fe)
- Inputs: fondo `surface-container-lowest`, borde `outline-variant`, foco `primary`
- Placeholder: `outline` (#717786)

### Fase 7 — TicketCard
- Fondo: `surface-container-lowest` (#ffffff)
- Borde: `outline-variant` (#c1c6d7)
- Título: `on-surface`, `body-md` semi-bold
- Chip Alta: `error-container` / `on-error-container`
- Chip Media: `tertiary-fixed` / `on-tertiary-fixed`
- Chip Baja: `primary-fixed` / `on-primary-fixed`

### Fase 8 — KanbanColumn
- Fondo: `surface-container-high` (#e6e8f3)
- Título: `on-surface-variant`, `label-md` uppercase
- Badge: `secondary-container` / `on-secondary-container`, pill

### Fase 9 — KanbanBoard
- Fondo área: `background` (#f9f9ff)
- Layout: `flex gap-5 overflow-x-auto`
- Columna Bloqueado: colapsable a `w-12`

### Fase 10 — Modal "Nuevo ticket"
- Overlay: `on-surface` al 40%
- Modal: `surface-container-lowest`, `rounded-xl`, `shadow-xl`, `backdrop-blur-[20px]`

---

---

# Plan: Integración optimista — Zustand + useOptimistic + rollback

## Motivación

`KanbanBoard` actualmente usa `qc.setQueryData` (TanStack Query) para updates optimistas. El objetivo es migrar a:
- **Zustand** (`boardStore`) para el estado UI del tablero (movimientos en vuelo, errores)
- **`useOptimistic`** de React 19 para proyectar el estado mientras el servidor responde
- **`useTransition`** como contexto de transición que habilita el rollback automático
- **setTimeout 1500ms** para simular backend lento y hacer visible el estado en-vuelo
- **30% de probabilidad de fallo** para demostrar el rollback en acción

## Diagrama de flujo

```
Usuario arrastra tarjeta
        │
        ▼
handleDragEnd (useBoardDnD)
        │
        ├─→ applyOptimistic({ ticketId, newStatus })
        │         └─ optimisticTickets se actualiza INMEDIATAMENTE
        │            (React 19 / useOptimistic)
        │
        ├─→ boardStore.addPending(ticketId)
        │         └─ TaskCard muestra overlay de carga
        │
        ├─→ await sleep(1500ms)   ← backend lento simulado
        │
        ├─→ Math.random() < 0.3?
        │       ├─ SÍ → throw Error → useOptimistic REVIERTE
        │       │       boardStore.setMoveError(...)
        │       │       KanbanBoard muestra banner error
        │       │
        │       └─ NO → await ticketsApi.update(...)
        │               qc.invalidateQueries(['tickets'])
        │               boardStore.removePending(ticketId)
        │               optimisticTickets se confirma con dato real
        ▼
   Estado estable
```

## Archivos

| Acción | Archivo | Descripción |
|---|---|---|
| 🆕 Crear | `store/boardStore.ts` | Zustand: pendingMoves + moveError |
| 🆕 Crear | `hooks/useBoardDnD.ts` | useOptimistic + useTransition + slow backend |
| ♻️ Modificar | `components/KanbanBoard.tsx` | Consume useBoardDnD, banner de error |
| ♻️ Modificar | `components/TaskCardDisplay.tsx` | Prop `isPending`, overlay visual |
| ♻️ Modificar | `components/TaskCard.tsx` | Lee boardStore, pasa isPending |

---

## Especificación por archivo

---

### 1. `boardStore.ts`

```ts
interface MoveError {
  ticketId:   string;
  fromStatus: TicketStatus;
  toStatus:   TicketStatus;
  message:    string;
}

interface BoardStore {
  pendingMoves:  Set<string>;
  moveError:     MoveError | null;
  addPending:    (id: string) => void;
  removePending: (id: string) => void;
  setMoveError:  (error: MoveError) => void;
  clearMoveError: () => void;
}
```

`pendingMoves` es un `Set<string>` de IDs en vuelo. Zustand **no serializa** Sets con `persist`, por eso no se usa `persist` aquí — este store es 100% en memoria (se limpia al recargar, que es lo correcto para estado UI efímero).

---

### 2. `useBoardDnD.ts`

Props recibidas: `tickets: Ticket[]` (datos reales de TanStack Query)

Retorna: `{ optimisticTickets: Ticket[]; handleDragEnd: (r: DropResult) => void; isPending: boolean }`

```ts
type MoveAction = { ticketId: string; newStatus: TicketStatus };

const FAILURE_RATE = 0.3;
const SIMULATED_DELAY_MS = 1500;

export function useBoardDnD(tickets: Ticket[]) {
  const [optimisticTickets, applyOptimistic] = useOptimistic(
    tickets,
    (state: Ticket[], action: MoveAction) =>
      state.map(t => t.id === action.ticketId ? { ...t, status: action.newStatus } : t)
  );

  const [isPending, startTransition] = useTransition();
  const { addPending, removePending, setMoveError } = useBoardStore();
  const qc = useQueryClient();

  const handleDragEnd = (result: DropResult) => {
    const { draggableId: ticketId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TicketStatus;
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    const fromStatus = ticket.status;

    startTransition(async () => {
      applyOptimistic({ ticketId, newStatus });
      addPending(ticketId);

      // Simulated slow backend
      await new Promise<void>(r => setTimeout(r, SIMULATED_DELAY_MS));

      // Simulated random failure (30%)
      if (Math.random() < FAILURE_RATE) {
        removePending(ticketId);
        setMoveError({ ticketId, fromStatus, toStatus: newStatus, message: 'No se pudo mover el ticket. Se restauró la posición original.' });
        throw new Error('Simulated backend failure — rollback triggered');
      }

      await ticketsApi.update(ticketId, { status: newStatus, updatedAt: ticket.updatedAt });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      removePending(ticketId);
    });
  };

  return { optimisticTickets, handleDragEnd, isPending };
}
```

**Por qué funciona el rollback:**
- `useOptimistic` muestra el valor optimista **mientras la transición está activa**
- Cuando `startTransition` termina (por `throw`), React revierte `optimisticTickets` al `tickets` original de TQ
- TQ NO fue actualizado (solo lo actualiza `qc.invalidateQueries` en el camino feliz), así que el revert muestra la posición original ✅

---

### 3. `KanbanBoard.tsx` (cambios)

```diff
- const [collapsedCols, ...] = useState(...)
- const handleDragEnd = useCallback(...)
+ const { data } = useTickets();
+ const { optimisticTickets, handleDragEnd, isPending } = useBoardDnD(data?.data ?? []);
+ const moveError = useBoardStore(s => s.moveError);
+ const clearMoveError = useBoardStore(s => s.clearMoveError);

// Pasar optimisticTickets a columnas en vez de data?.data
- tickets={data?.data.filter(t => t.status === col.status) ?? []}
+ tickets={optimisticTickets.filter(t => t.status === col.status)}

// Banner de error debajo del board (auto-dismiss en 3s)
+ {moveError && <MoveErrorBanner error={moveError} onDismiss={clearMoveError} />}
```

Tokens del banner de error:
- Fondo: `error-container` (#ffdad6)
- Texto: `on-error-container` (#93000a)
- Borde: `outline-variant`
- Radio: `rounded-lg`
- Tipografía: `body-sm` (13px/400)

---

### 4. `TaskCardDisplay.tsx` (cambios)

Añadir prop `isPending?: boolean`. Cuando es `true`, mostrar un overlay sutil y borde pulsante:

```diff
+ isPending?: boolean;
// En el render:
+ {isPending && (
+   <div className="absolute inset-0 rounded bg-primary/[0.06] pointer-events-none animate-pulse" />
+ )}
// + agregar position-relative al contenedor raíz
```

Tokens del estado en-vuelo:
- Overlay: `primary` al 6% opacidad (efecto "selected")
- Borde: `primary` 2px (en lugar del `outline-variant` normal)

---

### 5. `TaskCard.tsx` (cambios)

```diff
+ const isPending = useBoardStore(s => s.pendingMoves.has(ticket.id));
// pasar al display:
+ isPending={isPending}
```

---

## Árbol de dependencias

```
boardStore ─────────────────────────────────────────┐
                                                    ├─→ TaskCard (lee pendingMoves)
useBoardDnD (useOptimistic + useTransition) ────────┤         └─→ TaskCardDisplay (isPending)
                                                    └─→ KanbanBoard (orquestador)
                                                              └─→ MoveErrorBanner
```

## Tokens resumen

| Elemento | Token |
|---|---|
| Banner error fondo | `error-container` (#ffdad6) |
| Banner error texto | `on-error-container` (#93000a) |
| Tarjeta en-vuelo overlay | `primary` 6% opacidad |
| Tarjeta en-vuelo borde | `primary` (#0058bc) 2px |


---

---

# Plan: Sistema de componentes Kanban reutilizables

## Motivación

Los componentes actuales (`TicketCard`, `KanbanColumn`, `KanbanBoard`) son funcionales pero tienen acoplamiento que limita la reusabilidad:
- `TicketCard` está fusionado con `Draggable` — no puede usarse fuera del tablero
- `KanbanColumn` deriva su label desde el status internamente — no es genérica
- `KanbanBoard` tiene `COLUMNS` como array plano sin metadatos — config dispersa
- No existen `PriorityChip` ni `AssigneeBadge` como unidades reutilizables
- No hay empty state ni skeletons de carga

## Archivos afectados

| Acción | Archivo |
|---|---|
| 🆕 Crear | `PriorityChip.tsx` |
| 🆕 Crear | `AssigneeBadge.tsx` |
| 🆕 Crear | `TaskCardDisplay.tsx` |
| 🆕 Crear | `TaskCard.tsx` |
| 🆕 Crear | `TaskCardSkeleton.tsx` |
| 🆕 Crear | `KanbanColumnEmpty.tsx` |
| ♻️ Reemplazar | `KanbanColumn.tsx` |
| ♻️ Reemplazar | `KanbanBoard.tsx` |
| 🗑️ Eliminar | `TicketCard.tsx` |

---

## Árbol de dependencias

```
[Capa 1 — Atómicos, sin dependencias internas]
  PriorityChip
  AssigneeBadge
  TaskCardSkeleton
  KanbanColumnEmpty

[Capa 2 — Composición de atómicos]
  TaskCardDisplay  (usa: PriorityChip + AssigneeBadge)

[Capa 3 — Wrapper DnD]
  TaskCard         (envuelve: TaskCardDisplay en <Draggable>)

[Capa 4 — Columna genérica]
  KanbanColumn     (usa: TaskCard + KanbanColumnEmpty, en <Droppable>)

[Capa 5 — Orquestador]
  KanbanBoard      (usa: KanbanColumn × N, en <DragDropContext>)
                   (skeleton: TaskCardSkeleton × N en carga)
```

---

## Especificación por componente

### 1. `PriorityChip`

```ts
interface PriorityChipProps { priority: TicketPriority }
```

| Variante | bg token | text token |
|---|---|---|
| `alta` | `error-container` (#ffdad6) | `on-error-container` (#93000a) |
| `media` | `tertiary-fixed` (#ffdbcc) | `on-tertiary-fixed` (#351000) |
| `baja` | `primary-fixed` (#d8e2ff) | `on-primary-fixed` (#001a41) |

Tipografía: `label-md` · 12px/600 · `rounded-sm` · `px-2 py-0.5`

---

### 2. `AssigneeBadge`

```ts
interface AssigneeBadgeProps { assignee: Pick<User, 'name'> | null }
```

Tokens: `on-surface-variant` · `label-sm` (11px/500) · retorna `null` si no hay asignado

---

### 3. `TaskCardDisplay`

Componente puramente presentacional — sin Router ni DnD.

```ts
interface TaskCardDisplayProps {
  ticket:         Ticket;
  isDragging?:    boolean;
  dragHandle?:    React.HTMLAttributes<HTMLDivElement>;
  draggableStyle?: React.CSSProperties;
  onClick?:       () => void;
}
```

| Zona | Token |
|---|---|
| Fondo | `surface-container-lowest` (#ffffff) |
| Borde | `outline-variant` 1px (#c1c6d7) |
| Título | `on-surface` · `body-md` 15px/600 |
| Radio | `rounded` (8px) |
| Sombra normal | `shadow-sm` |
| Sombra dragging | `shadow-xl` + `rotate-1` |

---

### 4. `TaskCard`

```ts
interface TaskCardProps { ticket: Ticket; index: number }
```

Envuelve `TaskCardDisplay` en `<Draggable>`, inyecta `dragHandleProps`, `isDragging` y `onClick` via `useNavigate`.

---

### 5. `TaskCardSkeleton`

Sin props. Simula una `TaskCard` con barras `animate-pulse`.
Tokens: `surface-container-lowest` fondo · `surface-container-high` barras shimmer.

---

### 6. `KanbanColumnEmpty`

Sin props. Texto centrado "No hay tickets aquí" en `on-surface-variant` · `body-sm` italic · `min-h-[200px]`.

---

### 7. `KanbanColumn` (refinada)

```ts
export interface ColumnConfig {
  status:      TicketStatus;
  label:       string;
  collapsible: boolean;
}

interface KanbanColumnProps {
  config:           ColumnConfig;
  tickets:          Ticket[];
  collapsed?:       boolean;
  onToggleCollapse?: () => void;
}
```

| Zona | Token |
|---|---|
| Header fondo | `surface-container-high` |
| Header texto | `on-surface-variant` · `label-md` uppercase |
| Badge conteo | `secondary-container` / `on-secondary-container` · `rounded-full` |
| Drop idle | `surface-container` |
| Drop activo | `surface-container-low` + outline `primary` 2px |
| Radio | `rounded-lg` (16px) en contenedor |
| Ancho | `w-72` (≥ 280px) |

---

### 8. `KanbanBoard` (refinado)

Sin props externas.

```ts
const COLUMN_CONFIG: ColumnConfig[] = [
  { status: 'por_hacer',   label: 'Por hacer',   collapsible: false },
  { status: 'en_progreso', label: 'En progreso', collapsible: false },
  { status: 'review',      label: 'Review',      collapsible: false },
  { status: 'listo',       label: 'Listo',       collapsible: false },
  { status: 'bloqueado',   label: 'Bloqueado',   collapsible: true  },
];
```

Estado: `collapsedCols: Set<TicketStatus>` (preparado para colapso múltiple futuro).
Loading: 3 columnas esqueleto × 2 `TaskCardSkeleton` cada una.

