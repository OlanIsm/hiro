# Hiro — Design System

## 1. Style Archetype: Soft Light Neumorphism (Soft UI)
The design system for **Hiro** follows a modern **Light Mode Neumorphism** approach with tactile, extruded, and sunken surfaces illuminated from the top-left (-145deg lighting angle).

### User Core CSS Reference Formula
```css
border-radius: 74px;
background: linear-gradient(145deg, #cacaca, #f0f0f0);
box-shadow: 36px 36px 72px #bebebe,
            -36px -36px 72px #ffffff;
```

---

## 2. Typography Standard — Nunito Sans
All interface surfaces in Hiro must strictly use **Nunito Sans** as the official brand typography for maximum readability, friendliness, and modern aesthetics.

- **Font Family**: `'Nunito Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Inheritance**: Form controls (`input`, `button`, `select`, `textarea`) must explicitly inherit `font-family: inherit`.
- **Enlarged Legibility Scale**:
  - **Brand & Main Headings (H1/H2)**: `20px` to `28px` | `font-weight: 800` to `900`
  - **Column Titles & Section Headers**: `14.5px` to `15.5px` | `font-weight: 800` | uppercase / tracking
  - **Card Titles / Role Titles**: `15.5px` | `font-weight: 700`
  - **Form Labels & Field Inputs**: `14px` to `15px` | `font-weight: 700` (labels), `500` (inputs)
  - **Buttons & Navigation Items**: `13.5px` to `14.5px` | `font-weight: 700`
  - **Top Metric Cards**: Labels `13.5px` (`font-weight: 700`) | Counts `18px` (`font-weight: 800`)
  - **Secondary Metadata, Tags, & Dates**: `11.5px` to `13px` | `font-weight: 600` to `700` (Never below 11.5px)

---

## 3. Palette & Semantic Theming
- **Canvas Base**: `#e8ecf4` (Light soft-slate white canvas)
- **Primary Brand Purple**: `#7c3aed` (Tailwind violet-600)
- **Secondary Vivid Purple**: `#8b5cf6` (Tailwind violet-500)
- **Deep Accent Purple**: `#6d28d9` (Tailwind violet-700)
- **Soft Purple Tint**: `#ede9fe` (Tailwind violet-100)
- **Text & Typography Colors**:
  - Headings & Primary Text: `#1e1b4b` (Deep violet-black)
  - Secondary Labels & Meta: `#475569` (Slate-600)
  - Muted / Placeholders: `#94a3b8` (Slate-400)

### 4 Top Metric Cards (Filled Color, Compact Rounded Rectangles)
1. **Total Applications**: **Ungu (Purple Fill)**
   - Background: `linear-gradient(135deg, #8b5cf6, #7c3aed)`
   - Border: `1px solid rgba(255, 255, 255, 0.2)` | Radius: `10px` | Padding: `6px 14px`
   - Label: `#ffffff` | Count: `#ffffff`
2. **Test Phase**: **Kuning (Amber/Yellow Fill)**
   - Background: `linear-gradient(135deg, #f59e0b, #d97706)`
   - Border: `1px solid rgba(255, 255, 255, 0.2)` | Radius: `10px` | Padding: `6px 14px`
   - Label: `#ffffff` | Count: `#ffffff`
3. **Interview Phase**: **Biru (Blue Fill)**
   - Background: `linear-gradient(135deg, #3b82f6, #2563eb)`
   - Border: `1px solid rgba(255, 255, 255, 0.2)` | Radius: `10px` | Padding: `6px 14px`
   - Label: `#ffffff` | Count: `#ffffff`
4. **Active in Pipeline**: **Hijau (Emerald/Green Fill)**
   - Background: `linear-gradient(135deg, #10b981, #059669)`
   - Border: `1px solid rgba(255, 255, 255, 0.2)` | Radius: `10px` | Padding: `6px 14px`
   - Label: `#ffffff` | Count: `#ffffff`

---

## 3. Elevation & Lighting Scale

### A. Collapsible Purple Sidebar
- **Expanded Width**: `230px` | **Collapsed Width**: `72px`
- **Surface**: `#e8ecf4` with right-side neumorphic elevation: `box-shadow: 6px 0 18px #cfd5e2`
- **Active Navigation**: Tactile purple pill `linear-gradient(145deg, #8b5cf6, #7c3aed)` with white text.

### B. Large Modals & Floating Dialogs (Surface Convex)
- **Radius**: `24px` to `28px`
- **Surface**: `linear-gradient(145deg, #f0f4fc, #dfe4ee)`
- **Border**: `1px solid rgba(255, 255, 255, 0.8)`
- **Shadow**: `20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff`

### C. Kanban Columns & Cards (Sunken Well & Raised Card Hierarchy)
- **Columns (Sunken Well / Menjorok ke Dalam)**:
  - `borderRadius: "22px"`
  - `backgroundColor: "#e1e6f0"` (Drag-over: `#dce2ee`)
  - `boxShadow: inset 5px 5px 12px #c5cddb, inset -5px -5px 12px #ffffff`
  - Drag-over active: `inset 6px 6px 14px #c2c9d6, inset -6px -6px 14px #ffffff, 0 0 0 2px #7c3aed`
  - Fill 100% column height with internal card scrolling (`overflow-y: auto`).
  - Empty State: Soft dashed border `1px dashed rgba(160, 174, 192, 0.6)` on semi-transparent background `rgba(255, 255, 255, 0.35)`.
- **Cards (Convex Tile / Menonjol ke Luar)**:
  - `borderRadius: "16px"`
  - `padding: "12px 14px"`
  - `background: linear-gradient(145deg, #ffffff, #eaf0f9)`
  - `boxShadow: 6px 6px 14px #b8c1d1, -5px -5px 12px #ffffff` (Overlay drag: `16px 16px 32px #b0b9ca, -12px -12px 24px #ffffff`)
  - `border: 1px solid rgba(255, 255, 255, 0.95)`
  - Tactile elevated cards pop out prominently against the sunken column well.

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

## 4. Strict Viewport & No-Scroll Rules
- **No Page-Level Scrolling**: The application root and body are strictly locked to `height: 100vh; overflow: hidden;`.
- **Card-Level Scroll**: Only the cards list inside each individual Kanban column scrolls when items exceed the column height.
