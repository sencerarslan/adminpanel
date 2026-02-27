---
trigger: always_on
glob: ["**/*.tsx"]
description: Accessibility (a11y) rules — WCAG AA compliance for the admin panel
---

# Accessibility Rules

## Standard

All UI must meet **WCAG 2.1 Level AA** as a minimum. Strive for AAA where practical.

## Keyboard Navigation

- Every interactive element (buttons, links, inputs, dropdowns, modals) must be reachable and operable via keyboard alone.
- Tab order must follow the logical visual flow of the page.
- Avoid `tabIndex` values greater than `0` — use DOM order or `tabIndex="0"` for custom focusable elements.
- Focus states are never removed with `outline: none` or `focus:outline-none` without a replacement (`focus-visible:ring-2 ...`).

```tsx
// ✅ Visible focus ring retained
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">

// ❌ Focus removed — keyboard users lose navigation cues
<Button className="focus:outline-none">
```

## Semantic HTML

Use the correct HTML element for the job before reaching for ARIA:

| Purpose | Use |
|---------|-----|
| Navigation | `<nav>` |
| Page landmark | `<main>`, `<header>`, `<footer>`, `<aside>` |
| Interactive disclosure | `<details>` / `<summary>` or ARIA pattern |
| Data | `<table>` with `<thead>`, `<tbody>`, `<th scope="col/row">` |
| Grouping form fields | `<fieldset>` + `<legend>` |

## ARIA

- Use ARIA attributes only when semantic HTML cannot convey the meaning.
- Icon-only interactive elements must have `aria-label`:

```tsx
// ✅
<Button variant="ghost" size="icon" aria-label="Kullanıcıyı sil" onClick={onDelete}>
  <Trash2 className="h-4 w-4" />
</Button>

// ❌
<Button variant="ghost" size="icon" onClick={onDelete}>
  <Trash2 className="h-4 w-4" />
</Button>
```

- Dynamic content updates (toasts, live counters) use `aria-live="polite"` (or `"assertive"` for critical alerts).
- Loading states announce to screen readers: `aria-busy="true"` on the container.

## Modals & Dialogs

- shadcn/ui `Dialog` handles focus trap automatically — use it instead of rolling custom modals.
- On open: focus moves to the first focusable element inside the dialog.
- On close: focus returns to the trigger element that opened the dialog.
- `Escape` key always closes the dialog.

## Color & Contrast

- Text contrast ratio: **minimum 4.5:1** for normal text, **3:1** for large text (≥18px regular or ≥14px bold).
- Never convey information by color alone — pair color with an icon, label, or pattern.
- Check contrast for both light and dark themes using a tool (e.g. Colour Contrast Analyser, axe DevTools).

## Images & Media

- All `<Image>` components (via `next/image`) must have a meaningful `alt` attribute.
- Decorative images use `alt=""` so screen readers skip them.
- Videos must have captions or transcripts if they convey information.

## Forms

- Every input is associated with a `<label>` (via `htmlFor` / `id` or wrapping).
- `<FormMessage>` from shadcn associates error messages with the input using `aria-describedby` automatically.
- Required fields are indicated with both a visual marker and `aria-required="true"` (shadcn handles this via Radix).

## Testing

- Run **axe-core** or the browser axe DevTools extension on every new page before marking a feature complete.
- Fix all `critical` and `serious` violations before shipping; document any accepted `moderate` violations.
