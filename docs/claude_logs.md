# Claude Logs

A running log of notable Claude Code conversations for this project.

---

## 2026-09-04 — Initial wireframe

**Request:** Build the initial frontend wireframe for the CashRegister app (Next.js App Router, TypeScript, Tailwind, daisyUI only). Layout only — no calculation logic, API routes, validation, or file parsing.

**Starting state:** Fresh `create-next-app` scaffold with daisyUI already configured in `app/globals.css` (`@plugin "daisyui"`). No `components` directory yet.

**Changes made:**
- Added `app/components/Navbar.tsx` — daisyUI `navbar` with "CashRegister" text on the left and a minimal link on the right.
- Added `app/components/Footer.tsx` — daisyUI `footer footer-center` with "Created with <3 by JT Kazousky" and a Next.js + daisyUI credit line.
- Replaced the default `create-next-app` boilerplate in `app/page.tsx` with a centered, minimal layout: heading + instruction text, a `textarea` for pasting transactions, a dashed drop-zone placeholder for a `.txt` file upload, and a single primary "Calculate Change" button.
- Updated `app/layout.tsx` to render `Navbar` and `Footer` around `{children}`, and updated the page `metadata` (title/description) to match the app.
- Verified with `npx tsc --noEmit` — no type errors.

**Follow-up edits made directly by the user (not by Claude):**
- `app/layout.tsx`: set `data-theme="caramellatte"` on `<html>`.
- `app/globals.css`: scoped daisyUI to the `caramellatte` theme only.
- `app/components/Navbar.tsx`: constrained navbar to `max-w-4xl` and centered it, restyled the logo text, switched the right-side link to `btn btn-primary` with a `lucide-react` `GitPullRequest` icon, updated the GitHub URL casing.
- `app/components/Footer.tsx`: switched footer to `bg-secondary` / `text-primary-content` styling.

**Explicitly out of scope for this pass:** calculation logic, API routes, file parsing/validation, extra dependencies beyond daisyUI/lucide-react already present, animations/gradients/dashboards/sidebars.

---

## 2026-09-04 — Tab selector for input method

**Request:** Split `app/page.tsx` into a tab selector with "Calculator" and "File Upload" options — Calculator tab shows the textarea, File Upload tab shows the file drop zone. Include aria labels.

**Changes made:**
- Replaced the stacked textarea + drop-zone layout in `app/page.tsx` with daisyUI's CSS-only radio-based tabs (`tabs tabs-lift`), using `role="tablist"` / `role="tab"` / `role="tabpanel"` and `aria-label="Calculator"` / `aria-label="File Upload"` on the tab inputs, plus `aria-label="Transaction data"` on the textarea.
- No client-side state or `"use client"` needed — the tab switching is pure CSS via daisyUI's radio-input pattern, so `page.tsx` stays a server component.
- The primary "Calculate Change" button remains outside the tabs, applying to whichever input method is active.
- Verified with `npx tsc --noEmit` — no type errors.

---

## 2026-09-04 — Domain types

**Request:** Begin type generation in `app/lib/types.ts`, covering Currency Denominations, Currency, and all types needed for the problem defined in `README.md`.

**Changes made:**
- Added `app/lib/types.ts` with:
  - `MinorUnits` — money represented as an integer in the currency's smallest unit (e.g. cents) to avoid floating-point rounding errors.
  - `Denomination` (name/pluralName/value/kind) and `DenominationKind` ("bill" | "coin").
  - `Currency` (code/name/symbol/minorUnitsPerMajorUnit/denominations) and `CurrencyDenominations` (denominations keyed by currency code) — kept currency-agnostic per the README's "new client in France" consideration.
  - `Transaction` — a parsed "amount owed, amount paid" input line.
  - `ChangeLineItem` and `ChangeResult` — the denomination breakdown and full result for a transaction, including an `isRandomized` flag for the "divisible by 3" rule.
- No parsing/calculation logic yet — types only, per current scope.
- Verified with `npx tsc --noEmit` — no type errors.
