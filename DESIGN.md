---
name: Task System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fe'
  surface-container: '#ecedf9'
  surface-container-high: '#e6e8f3'
  surface-container-highest: '#e0e2ed'
  on-surface: '#181c23'
  on-surface-variant: '#414755'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eef0fc'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#5d5e63'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfe4'
  on-secondary-container: '#626267'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1b1f'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#e0e2ed'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-page: 40px
---

## Brand & Style

The brand identity focuses on clarity, precision, and calm productivity. This design system draws heavily from **Minimalism** and **Corporate/Modern** aesthetics, specifically influenced by Apple’s human interface guidelines. The goal is to reduce cognitive load by eliminating unnecessary visual noise, allowing the user's tasks to remain the focal point. 

The emotional response should be one of "quiet efficiency." By utilizing expansive whitespace and a restrained color palette, the interface feels organized even when handling complex project data. Surface treatments are light and airy, avoiding heavy containers in favor of structural alignment and subtle tonal shifts.

## Colors

The palette is rooted in a professional "Slate and Silver" foundation. We use **Crisp White** (#FFFFFF) for primary interactive surfaces and **Off-White/Light Gray** (#F5F5F7) for application backgrounds to create a clear sense of layering.

Priority accents are desaturated and applied sparingly to prevent the "Christmas tree effect" common in project management tools:
- **High Priority:** A soft, accessible red used for critical status indicators and overdue tags.
- **Medium Priority:** A warm amber for warning states and steady progress.
- **Low Priority:** A classic San Francisco blue for standard tasks and informational badges.
- **Neutral/Slate:** Various shades of gray handle borders, secondary text, and inactive states to maintain a professional atmosphere.

## Typography

This design system utilizes **Inter** for its exceptional readability on high-density displays and its neutral, Apple-adjacent character. 

- **Headlines:** Use tighter letter spacing and heavier weights to create a strong visual anchor for page titles and board columns.
- **Body Text:** Sized at 15px for the primary workspace to balance information density with legibility.
- **Labels:** Small caps or bold weights at 11px-12px are used for metadata like "Issue Keys" (e.g., TASK-101) and "Status Tags," ensuring they are distinct from primary task descriptions.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict margin constraints to ensure the Kanban board scales gracefully across ultra-wide monitors.

- **Board Layout:** Kanban columns should have a fixed-minimum width (280px) and expand to fill available space, using a 20px gutter between columns.
- **Whitespace:** Use 24px-32px of padding inside cards and containers to prevent the interface from feeling "cramped" like legacy enterprise software.
- **Rhythm:** All spacing must be a multiple of 4px. Use 16px (md) for standard element spacing and 8px (sm) for related sub-elements.

## Elevation & Depth

We use **Ambient Shadows** and **Tonal Layers** to define the z-axis. The design avoids heavy black shadows, opting instead for soft, diffused blurs with very low opacity (5-10%).

- **Level 0 (Background):** The application canvas uses the secondary background color (#F5F5F7).
- **Level 1 (Cards/Columns):** Task cards and sidebar containers sit on the primary surface color (#FFFFFF) with a 1px soft gray border (#E5E5E7).
- **Level 2 (Hover/Active):** When a task card is dragged or hovered, it gains a slightly more pronounced shadow (10% opacity) and a subtle lift effect to indicate interactivity.
- **Modals:** Use a heavy backdrop blur (20px) to focus the user’s attention on the task details without losing context of the board.

## Shapes

The design system employs **Rounded** corners to create a friendly and modern feel. 

- **Standard Elements:** Buttons, input fields, and task cards use a 0.5rem (8px) radius.
- **Containers:** Kanban columns and larger dashboard widgets use a 1rem (16px) radius to frame their internal content.
- **Micro-Elements:** Checkboxes and small tags use a 4px radius to maintain sharp alignment with text while still appearing "soft" at the edges.

## Components

- **Task Cards:** White background, 1px neutral border, 16px internal padding. Display the task title in `body-md` bold, with metadata (assignee, priority tag) at the bottom.
- **Kanban Columns:** Transparent or very subtle gray background (#F0F0F2). Header text should be `label-md` with a count badge in a pill shape.
- **Buttons:** 
    - *Primary:* Solid blue with white text.
    - *Secondary:* Ghost style with a 1px gray border and slate text. 
    - *Tertiary:* Text-only for less frequent actions.
- **Priority Chips:** Low-contrast backgrounds (e.g., 10% opacity of the priority color) with high-contrast text. This ensures the color is visible but not overwhelming.
- **Input Fields:** Clean 1px border that shifts to the primary blue on focus. Use placeholder text in `slate_600`.
- **Navigation:** A slim, vertical sidebar on the left using semi-transparent materials (Glassmorphism) if the background allows, or simple tonal separation.