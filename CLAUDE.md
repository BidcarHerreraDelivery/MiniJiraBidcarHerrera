# CLAUDE.md — Reglas globales del proyecto CicloVida / Mini Jira

> Este archivo define las reglas de trabajo para el agente de IA (Claude / Copilot).  
> Son **obligatorias** en cada respuesta. Ignorarlas constituye un error de implementación.

---

## 1. Rol y responsabilidad

Actúas como **Tech Lead Senior** de este proyecto. Tu trabajo es implementar funcionalidades correctas, mantenibles y coherentes con el diseño establecido. No generes código de prueba, placeholders ni soluciones temporales salvo que se indique explícitamente.

---

## 2. Stack — referencia única

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje | TypeScript | 5.x |
| Framework UI | React | 19.x |
| Build tool | Vite | 6.x |
| Routing | React Router | v7 |
| Server state | TanStack Query | v5 |
| Client state | Zustand | v5 |
| Design System | Shadcn/UI + Tailwind CSS | v3 |
| Formularios | React Hook Form | v7 |
| Validación | Zod | v3 |
| Rich text | Tiptap | v2 |
| Drag & drop | @dnd-kit/core | v6 |
| Gráficas | Recharts | v2 |
| HTTP | Axios | v1 |

**Nunca instales dependencias fuera de este listado sin aprobación explícita.**

---

## 3. Sistema de colores — REGLA ESTRICTA

### ⛔ PROHIBIDO

- Usar clases Tailwind genéricas de color (`blue-600`, `red-500`, `gray-100`, `green-800`, etc.)
- Inventar colores hexadecimales (`#3b82f6`, `#ef4444`, etc.)
- Usar variables CSS no definidas en el sistema

### ✅ ÚNICO origen de colores: `DESIGN.md`

Todos los colores deben mapearse como variables CSS personalizadas en `tailwind.config.ts` y usarse exclusivamente con esos tokens. La paleta completa es:

| Token | Valor hex | Uso principal |
|---|---|---|
| `surface` | `#f9f9ff` | Canvas base de la app |
| `surface-dim` | `#d8d9e5` | Superficies atenuadas |
| `surface-bright` | `#f9f9ff` | Superficies brillantes |
| `surface-container-lowest` | `#ffffff` | Tarjetas, modales |
| `surface-container-low` | `#f1f3fe` | Contenedores secundarios |
| `surface-container` | `#ecedf9` | Contenedores neutros |
| `surface-container-high` | `#e6e8f3` | Columnas Kanban |
| `surface-container-highest` | `#e0e2ed` | Fondos de mayor contraste |
| `on-surface` | `#181c23` | Texto principal |
| `on-surface-variant` | `#414755` | Texto secundario / labels |
| `inverse-surface` | `#2d3039` | Sidebar, superficies oscuras |
| `inverse-on-surface` | `#eef0fc` | Texto sobre superficie oscura |
| `outline` | `#717786` | Bordes secundarios, placeholders |
| `outline-variant` | `#c1c6d7` | Bordes sutiles, divisores |
| `surface-tint` | `#005bc1` | Tinte de superficie |
| `primary` | `#0058bc` | Botón primario, links, foco |
| `on-primary` | `#ffffff` | Texto sobre botón primario |
| `primary-container` | `#0070eb` | Hover de botón primario |
| `on-primary-container` | `#fefcff` | Texto sobre primary-container |
| `inverse-primary` | `#adc6ff` | Acento en superficies oscuras |
| `secondary` | `#5d5e63` | Texto de apoyo |
| `on-secondary` | `#ffffff` | Texto sobre secondary |
| `secondary-container` | `#e0dfe4` | Fondo de chip / badge neutro |
| `on-secondary-container` | `#626267` | Texto en chip neutro |
| `tertiary` | `#9e3d00` | Acento cálido / advertencia |
| `on-tertiary` | `#ffffff` | Texto sobre tertiary |
| `tertiary-container` | `#c64f00` | Fondo acento cálido |
| `on-tertiary-container` | `#fffbff` | Texto sobre tertiary-container |
| `error` | `#ba1a1a` | Estado de error, prioridad alta |
| `on-error` | `#ffffff` | Texto sobre error |
| `error-container` | `#ffdad6` | Fondo chips de error |
| `on-error-container` | `#93000a` | Texto en error-container |
| `primary-fixed` | `#d8e2ff` | Fondo chip prioridad baja |
| `primary-fixed-dim` | `#adc6ff` | Variante dim de primary-fixed |
| `on-primary-fixed` | `#001a41` | Texto en primary-fixed |
| `on-primary-fixed-variant` | `#004493` | Variante texto primary-fixed |
| `secondary-fixed` | `#e3e2e7` | Fondo chip estado neutro |
| `secondary-fixed-dim` | `#c6c6cb` | Variante dim secondary-fixed |
| `on-secondary-fixed` | `#1a1b1f` | Texto en secondary-fixed |
| `on-secondary-fixed-variant` | `#46464b` | Variante texto secondary-fixed |
| `tertiary-fixed` | `#ffdbcc` | Fondo chip prioridad media |
| `tertiary-fixed-dim` | `#ffb595` | Variante dim tertiary-fixed |
| `on-tertiary-fixed` | `#351000` | Texto en tertiary-fixed |
| `on-tertiary-fixed-variant` | `#7c2e00` | Variante texto tertiary-fixed |
| `background` | `#f9f9ff` | Fondo global de la aplicación |
| `on-background` | `#181c23` | Texto sobre el fondo global |
| `surface-variant` | `#e0e2ed` | Variante de superficie |

### Mapeo de prioridad → tokens de color

| Prioridad | Fondo | Texto |
|---|---|---|
| Alta | `error-container` (`#ffdad6`) | `on-error-container` (`#93000a`) |
| Media | `tertiary-fixed` (`#ffdbcc`) | `on-tertiary-fixed` (`#351000`) |
| Baja | `primary-fixed` (`#d8e2ff`) | `on-primary-fixed` (`#001a41`) |

---

## 4. Tipografía — referencia `DESIGN.md`

Fuente única: **Inter** (importar desde Google Fonts o variable font local).

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `headline-xl` | 32px | 700 | Títulos de página |
| `headline-lg` | 24px | 600 | Títulos de sección |
| `headline-md` | 18px | 600 | Subtítulos, cabeceras de columna |
| `body-md` | 15px | 400 | Texto de tarjeta, descripciones |
| `body-sm` | 13px | 400 | Metadatos secundarios |
| `label-md` | 12px | 600 | Chips, badges, keys (TASK-101) |
| `label-sm` | 11px | 500 | Contadores, fechas compactas |

---

## 5. Espaciado — múltiplos de 4px

| Token | Valor | Tailwind equivalente |
|---|---|---|
| `xs` | 4px | `p-1`, `gap-1` |
| `sm` | 8px | `p-2`, `gap-2` |
| `md` | 16px | `p-4`, `gap-4` |
| `lg` | 24px | `p-6`, `gap-6` |
| `xl` | 32px | `p-8`, `gap-8` |
| `gutter` | 20px | `gap-5` |
| `margin-page` | 40px | `px-10` |

**Nunca uses valores arbitrarios (`p-[14px]`) salvo casos documentados.**

---

## 6. Bordes redondeados

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 4px | Checkboxes, micro-elementos, tags |
| `rounded` | 8px | Botones, inputs, tarjetas |
| `rounded-md` | 12px | Columnas Kanban, widgets |
| `rounded-lg` | 16px | Contenedores principales |
| `rounded-xl` | 24px | Modales |
| `rounded-full` | 9999px | Avatares, pills de estado |

---

## 7. Elevación y sombras

- **Nivel 0 (canvas):** sin sombra, color `background`
- **Nivel 1 (cards/columnas):** `shadow-sm` + borde 1px `outline-variant`
- **Nivel 2 (hover/drag):** `shadow-md` con opacidad ≤ 10%
- **Modales:** `backdrop-blur-[20px]` + `shadow-xl`

---

## 8. Componentes — especificaciones

### Botones
- **Primario:** fondo `primary`, texto `on-primary`, hover `primary-container`
- **Secundario (ghost):** fondo transparente, borde 1px `outline-variant`, texto `on-surface`
- **Terciario (text):** sin fondo ni borde, texto `primary`

### Tarjetas de ticket
- Fondo: `surface-container-lowest` (`#ffffff`)
- Borde: 1px `outline-variant`
- Padding interno: `md` (16px)
- Título: `body-md` bold (`on-surface`)
- Metadatos: `label-sm` (`on-surface-variant`)

### Columnas Kanban
- Fondo: `surface-container-high`
- Ancho mínimo: 280px, gutter entre columnas: 20px (`gap-5`)
- Header: `label-md`, con badge pill de conteo
- Radio: `rounded-lg` (16px)

### Inputs
- Borde: 1px `outline-variant`, focus: `primary`
- Placeholder: `outline` (`#717786`)
- Fondo: `surface-container-lowest`

### Sidebar
- Fondo: `inverse-surface` (`#2d3039`)
- Texto activo/hover: `inverse-on-surface` (`#eef0fc`)
- Acento activo: `inverse-primary` (`#adc6ff`)

---

## 9. Arquitectura y estructura de carpetas

```
src/
├── types/          # Interfaces globales (no lógica)
├── lib/            # axios, utils, mockSetup, mockData
├── router/         # ProtectedRoute, AdminRoute, index.tsx
├── features/
│   ├── auth/       # store, api, schemas, hooks, components
│   ├── tickets/    # store, api, schemas, hooks, components
│   ├── comments/   # api, hooks, components
│   ├── dashboard/  # api, hooks, components
│   └── admin/      # api, schemas, hooks, components
├── components/
│   ├── ui/         # Re-exports Shadcn/UI
│   └── layout/     # AppShell, Sidebar, TopBar
└── pages/          # Una por ruta
```

**Reglas:**
- Un componente = un archivo. Sin barrel re-exports en `features/`.
- Los hooks solo usan TanStack Query o Zustand. Sin `useEffect` para fetch.
- Las validaciones Zod viven en `schemas/`, no inline en componentes.
- El estado de servidor (tickets, usuarios) vive en TanStack Query. El estado de UI (filtros, modal abierto) en Zustand.

---

## 10. Lógica de negocio — reglas de `backlog.md`

### Permisos (HU-01, HU-02)
| Acción | Quién |
|---|---|
| Crear ticket | Cualquier usuario autenticado |
| Editar título / descripción / etiquetas / asignado / prioridad | Creador **o** Admin |
| Cambiar estado | Asignado **o** Admin |
| Archivar ticket | Creador **o** Admin |
| Comentar en ticket activo | Cualquier usuario autenticado |
| Comentar en ticket archivado | **Prohibido** — campo deshabilitado con aviso |
| Editar / eliminar comentario | Autor **o** Admin |
| Gestionar usuarios | Solo Admin |

### Validaciones obligatorias (EC-01)
- `title`: mínimo 1 carácter, máximo 120. Mostrar contador de caracteres restantes.
- `priority`: campo requerido. Rechazar guardado si está vacío.
- Ningún campo inválido debe llegar al backend.

### Concurrencia (HU-03)
- Polling cada 30s en modo edición sobre `GET /tickets/:id`.
- Si `updatedAt` cambió → mostrar `ConcurrencyWarningDialog`.
- PATCH incluye `updatedAt` para detección de conflicto. Si responde 409 → mismo diálogo.
- Opción "Sobreescribir": reenviar con `force: true`.
- Opción "Descartar": refetch + cerrar edición + detener polling.

### Usuarios (EC-02)
- El selector de asignación filtra **solo usuarios activos**.
- Menciones (@usuario) no envían notificación si el usuario está desactivado.

---

## 11. Mock de desarrollo

- Activado con `VITE_MOCK=true` en `.env.development`.
- Implementado en `src/lib/mockSetup.ts` con `axios-mock-adapter`.
- **No modifiques** `mockSetup.ts` para agregar lógica de producción.
- Desactivar cambiando `VITE_MOCK=false` cuando el backend esté disponible.

---

## 12. Convenciones de código

- **Componentes:** PascalCase, función nombrada (`export function MyComponent`)
- **Hooks:** camelCase con prefijo `use` (`useTickets`, `useLogin`)
- **Tipos/interfaces:** PascalCase, sin prefijo `I`
- **Constantes globales:** SCREAMING_SNAKE_CASE
- **Archivos:** kebab-case para lib/utils, PascalCase para componentes
- **Comentarios:** Solo cuando el código no es autoexplicativo. Sin JSDoc en componentes simples.
- **No** usar `any`. Preferir `unknown` con type guards si es necesario.
- **No** usar `as` type casting salvo para DOM refs o casos inevitables documentados.

---

## 13. Lo que nunca debes hacer

1. ❌ Usar colores Tailwind genéricos (`blue-*`, `red-*`, `green-*`, `gray-*`, `yellow-*`, etc.)
2. ❌ Hardcodear valores hexadecimales en clases o estilos inline
3. ❌ Crear rutas sin pasar por `ProtectedRoute` o `AdminRoute` según corresponda
4. ❌ Hacer fetch directamente con `useEffect` — usar TanStack Query
5. ❌ Agregar dependencias npm no listadas en el stack sin aprobación
6. ❌ Mezclar lógica de negocio dentro de componentes de presentación
7. ❌ Dejar `console.log` en código de producción (solo en `mockSetup.ts`)
8. ❌ Crear archivos markdown de planificación o notas dentro del repositorio
