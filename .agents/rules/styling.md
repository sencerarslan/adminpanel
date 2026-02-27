---
trigger: always_on
glob: ["**/*.tsx", "**/*.css"]
description: Tailwind CSS, shadcn/ui, dark mode, responsive design, and animation rules
---

# Styling Rules

## Core Stack

- **Component library**: shadcn/ui. Before creating a new UI primitive, verify it doesn't already exist in shadcn.
- **Styling engine**: Tailwind CSS. Inline `style` prop is only allowed for dynamic values passed as CSS custom properties (e.g. computed widths, dynamic colors).
- **Icons**: `lucide-react` exclusively. No other icon libraries are added.
- **Animations**: `tailwindcss-animate` for simple transitions; Framer Motion for complex sequences. CSS transition durations stay within 150–300ms.

## Design System Tokens

All design tokens are defined in `tailwind.config.ts`. Magic numbers (raw pixel values not tied to a token) are forbidden.

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: { ... },
      secondary: { ... },
      destructive: { ... },
      muted: { ... },
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      ...
    },
  },
}
```

## Responsive Design

- **Mobile-first** is mandatory. Write base styles for mobile, then override with `sm:`, `md:`, `lg:`, `xl:` breakpoints in that order.
- Even though this is an admin panel (primarily desktop), all layouts must work on tablet (`md:`) and be usable on mobile (`sm:`).
- Sidebar collapses to a drawer on mobile; tables become horizontally scrollable.

## Dark Mode

- Dark mode is managed via `next-themes` with `attribute="class"` strategy.
- Every component must include both light and dark variants:

```tsx
// ✅ Correct
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// ❌ Wrong — dark mode forgotten
<div className="bg-white text-gray-900">
```

- Never hardcode colors that don't adapt to the theme. Always use semantic color tokens (`bg-background`, `text-foreground`, `border`, etc.) from shadcn's CSS variables where applicable.

## Component Styling Conventions

- Compose Tailwind classes using `cn()` (from `lib/utils.ts`) for conditional class merging — never use string concatenation or template literals for class logic.

```ts
// ✅
className={cn('base-class', isActive && 'active-class', className)}

// ❌
className={`base-class ${isActive ? 'active-class' : ''}`}
```

- Extract repeated class combinations into a local constant or a `cva` (class-variance-authority) variant definition — not a new CSS file.

```ts
const buttonVariants = cva('base styles...', {
  variants: {
    intent: { primary: '...', secondary: '...' },
    size: { sm: '...', md: '...', lg: '...' },
  },
});
```

## What NOT to Do

- Do not write component styles in global CSS files — use Tailwind classes.
- Do not use `!important`.
- Do not use arbitrary values (e.g. `w-[347px]`) without a justified reason; prefer design tokens.
- Do not mix styling approaches (Tailwind + CSS Modules + inline styles on the same element).
