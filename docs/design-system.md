## Design System Rules

Before implementing or modifying frontend UI, read `docs/[design-system.md](http://design-system.md)`. Treat it as the source of truth for visual design.

### Product Identity

- The application name is **Hiro**. Do not use "Olan's Jira" or "Olan's Jira" branding in the UI, page titles, visible labels, or documentation updated during implementation.
- Hiro is a personal internship tracker, not a corporate project management platform.
- The interface must feel calm, friendly, clean, and comfortable for extended use.

### Visual Direction

- Follow the soft neumorphism design system defined in `docs/[design-system.md](http://design-system.md)`.
- Use warm, muted neutral surfaces and restrained sage green accents.
- Prefer soft, diffuse shadows over strong borders.
- Use inset shadows selectively for inputs and recessed surfaces.
- Keep the interface minimal, spacious, and visually quiet.
- Avoid harsh contrast, saturated colors, heavy gradients, glassmorphism, excessive badges, and decorative visual effects.
- Do not apply neumorphic shadows to every element. Preserve clear visual hierarchy and usability.
- Do not make the interface look like a formal enterprise dashboard.

### Design Tokens

- Use centralized CSS variables and shared design tokens for colors, shadows, spacing, typography, and border radius.
- Do not scatter hardcoded color values or inconsistent shadow definitions throughout components.
- Use Inter with sensible system-font fallbacks unless a documented reason requires a change.
- Follow the color palette and component measurements in `docs/[design-system.md](http://design-system.md)`.
- Use Lucide outline icons consistently; do not use emoji as UI icons.

### Component Consistency

- Reuse shared components for buttons, inputs, cards, tags, dialogs, and Kanban columns.
- Define clear default, hover, active, focus, disabled, loading, success, and error states where applicable.
- Use consistent border radii, spacing, and typography.
- Keep transitions subtle and responsive. Respect `prefers-reduced-motion`.
- Do not add a UI component library or animation dependency without a clear technical need.

### Kanban UI

- The primary board must contain exactly four ordered columns: Applied, Test, Interview, and Next Step.
- Keep internship cards neutral and readable, with restrained semantic status colors.
- Dragging a card should produce clear but subtle visual feedback.
- Highlight valid drop targets without using aggressive colors or animations.
- If a status update fails to persist, revert the optimistic UI change and show a clear error.
- Keep horizontal scrolling within the board when the available viewport is too narrow.

### Accessibility Overrides

- Accessibility takes precedence over aesthetic fidelity.
- Do not lower text contrast to achieve a softer appearance.
- Aim for WCAG AA contrast: at least 4.5:1 for normal text and 3:1 for large text.
- Neumorphic shadows must not be the only indicator that an element is interactive.
- Provide visible keyboard focus states, accessible labels, and non-color status indicators.
- Ensure forms, dialogs, navigation, and drag-and-drop workflows remain usable with keyboard navigation.
- Add subtle borders or stronger surface contrast when necessary to make controls distinguishable.

### UI Review Checklist

Before marking a frontend task complete:

1. Confirm `docs/[design-system.md](http://design-system.md)` was followed.
2. Check spacing, typography, shadows, and colors for consistency.
3. Verify hover, focus, pressed, disabled, loading, empty, and error states as relevant.
4. Check readability at the target desktop viewport.
5. Confirm the design does not introduce unnecessary visual clutter.
6. Verify keyboard accessibility and reduced-motion behavior where applicable.
7. Run relevant frontend tests and type checks.