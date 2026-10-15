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

## 2. Palette & Semantic Theming
- **Canvas Base**: `#e8ecf4` (Light soft-slate white canvas)
- **Primary Brand Purple**: `#7c3aed` (Tailwind violet-600)
- **Secondary Vivid Purple**: `#8b5cf6` (Tailwind violet-500)
- **Deep Accent Purple**: `#6d28d9` (Tailwind violet-700)
- **Soft Purple Tint**: `#ede9fe` (Tailwind violet-100)
- **Text & Typography**:
  - Headings & Primary Text: `#1e1b4b` (Deep violet-black)
  - Secondary Labels & Meta: `#475569` (Slate-600)
  - Muted / Placeholders: `#94a3b8` (Slate-400)

### 4 Top Metric Pills (No Icons)
1. **Total Applications**: **Ungu (Purple)**
   - Background: `linear-gradient(145deg, #f5f3ff, #ede9fe)`
   - Border: `1px solid rgba(124, 58, 237, 0.25)`
   - Label: `#6d28d9` | Count: `#5b21b6`
2. **Test Phase**: **Kuning (Yellow/Amber)**
   - Background: `linear-gradient(145deg, #fffbeb, #fef3c7)`
   - Border: `1px solid rgba(245, 158, 11, 0.3)`
   - Label: `#b45309` | Count: `#92400e`
3. **Interview Phase**: **Biru (Blue)**
   - Background: `linear-gradient(145deg, #eff6ff, #dbeafe)`
   - Border: `1px solid rgba(59, 130, 246, 0.3)`
   - Label: `#1d4ed8` | Count: `#1e40af`
4. **Active in Pipeline**: **Hijau (Green/Emerald)**
   - Background: `linear-gradient(145deg, #ecfdf5, #d1fae5)`
   - Border: `1px solid rgba(16, 185, 129, 0.3)`
   - Label: `#047857` | Count: `#065f46`

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

### C. Kanban Columns & Cards (Compact & Crisp)
- **Columns**:
  - `borderRadius: "20px"`
  - `boxShadow: 6px 6px 14px #cfd5e2, -6px -6px 14px #ffffff`
  - Fill 100% column height with internal card scrolling (`overflow-y: auto`).
- **Cards**:
  - `borderRadius: "16px"`
  - `padding: "12px 14px"`
  - Compact tactile convex surfaces with dual shadows.

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
