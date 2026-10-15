# Olan's Jira — Design System

## 1. Style Archetype: Soft Light Neumorphism (Soft UI)
The design system for Olan's Jira follows a modern **Light Mode Neumorphism** approach with tactile, extruded, and sunken surfaces illuminated from the top-left (-145deg lighting angle).

### User Core CSS Reference Formula
```css
border-radius: 74px;
background: linear-gradient(145deg, #cacaca, #f0f0f0);
box-shadow: 36px 36px 72px #bebebe,
            -36px -36px 72px #ffffff;
```

---

## 2. Palette: Purple Dominance (Strictly No Blue)
- **Canvas Base**: `#e8ecf4` (Light soft-slate white canvas)
- **Primary Brand Purple**: `#7c3aed` (Tailwind violet-600)
- **Secondary Vivid Purple**: `#8b5cf6` (Tailwind violet-500)
- **Deep Accent Purple**: `#6d28d9` (Tailwind violet-700)
- **Soft Purple Tint**: `#ede9fe` (Tailwind violet-100)
- **Text & Typography**:
  - Headings & Primary Text: `#1e1b4b` (Deep violet-black)
  - Secondary Labels & Meta: `#475569` (Slate-600)
  - Muted / Placeholders: `#94a3b8` (Slate-400)
- **Status Indicators**:
  - `APPLIED`: Indigo / Soft Purple (`#6366f1`)
  - `TEST`: Amber Gold (`#f59e0b`)
  - `INTERVIEW`: Royal Purple (`#8b5cf6`)
  - `NEXT_STEP`: Emerald Mint (`#10b981`)

---

## 3. Elevation & Lighting Scale

### A. Large Modals & Floating Dialogs (Surface Convex)
- **Radius**: `24px` to `28px`
- **Surface**: `linear-gradient(145deg, #f0f4fc, #dfe4ee)`
- **Border**: `1px solid rgba(255, 255, 255, 0.8)`
- **Shadow**: `20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff`

### B. Cards & Metric Panels (Surface Flat / Convex)
- **Radius**: `18px` to `24px`
- **Surface**: `linear-gradient(145deg, #f0f4fc, #dfe4ee)`
- **Border**: `1px solid rgba(255, 255, 255, 0.7)`
- **Shadow**: `8px 8px 18px #cfd5e2, -8px -8px 18px #ffffff`
- **Hover**: `10px 10px 22px #cfd5e2, -10px -10px 22px #ffffff`

### C. Wells & Columns Container
- **Radius**: `24px`
- **Surface**: `#e8ecf4`
- **Border**: `1px solid rgba(255, 255, 255, 0.6)`
- **Shadow**: `inset 3px 3px 8px #d0d6e2, inset -3px -3px 8px #ffffff`

### D. Form Inputs, Search, & Textareas (Surface Inset)
- **Radius**: `12px` to `16px`
- **Surface**: `#e4e8f1`
- **Border**: `1px solid rgba(255, 255, 255, 0.7)`
- **Shadow**: `inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff`
- **Text**: `#1e1b4b`

### E. Tactile Buttons
- **Standard Button (`.neu-button`)**:
  - `background: linear-gradient(145deg, #f0f4fc, #dfe4ee)`
  - `box-shadow: 5px 5px 12px #d0d6e2, -5px -5px 12px #ffffff`
  - Active: `box-shadow: inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff`
- **Primary Brand Button (`.neu-button-primary`)**:
  - `background: linear-gradient(145deg, #8b5cf6, #7c3aed)`
  - `box-shadow: 5px 5px 15px rgba(124, 58, 237, 0.35), -4px -4px 10px #ffffff`
  - Active: `background: linear-gradient(145deg, #7c3aed, #6d28d9)`

---

## 4. Layout & Viewport Rules
- **Full Viewport Width**: The dashboard must span `100%` width with comfortable margins (`max-width: 1600px` centered with fluid paddings, or edge-to-edge). Never restrict the `#root` or container to narrow fixed boxes.
- **Backdrops**: Modals use light soft scrims `rgba(15, 23, 42, 0.35)` with `backdrop-filter: blur(4px)`.
