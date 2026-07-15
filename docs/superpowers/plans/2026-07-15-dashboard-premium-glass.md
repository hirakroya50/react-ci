# Dashboard Premium Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard page with a premium glass visual treatment, stronger spacing, and cleaner layout while preserving all existing data flows and interactions.

**Architecture:** Keep the current dashboard data-fetching and interaction logic intact, and confine the work to presentation changes in the dashboard page, closely related display components, and shared theme tokens. Use the existing Tailwind utility approach inside the page while adding only the minimum shared CSS variables needed for the new surface and glow system.

**Tech Stack:** React, TypeScript, Tailwind utility classes, existing app CSS variables, Framer Motion, Vite

## Global Constraints

- No changes to authentication or routing.
- No schema or API changes.
- No new dashboard features beyond presentation and minor copy polish.
- Preserve existing behavior, navigation, and Supabase-driven data flows.
- Keep project cards more solid than hero or control surfaces to preserve readability.
- Validation must include a production build and a focused dashboard smoke check.

---

## File Structure

- Modify: `src/pages/Dashboard.tsx`
  - Owns the page layout, section hierarchy, and most visual treatment changes.
- Modify: `src/components/ActivityFeed.tsx`
  - Aligns activity presentation with the redesigned dashboard side-rail surfaces.
- Modify: `src/components/ProjectPulse.tsx`
  - Tightens progress bar styling so it matches the premium card treatment.
- Modify: `src/index.css`
  - Adds any new theme tokens required for glass surfaces, panel glow, and richer shadow depth.

### Task 1: Add shared premium-glass theme tokens

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Existing CSS variable system on `:root` and `[data-theme="dark"]`
- Produces: New reusable variables for elevated glass surfaces and ambient glow used by the dashboard classes

- [ ] **Step 1: Add the new root and dark theme variables**

```css
:root {
  --surface-strong: #ffffff;
  --surface-glass: rgba(255, 255, 255, 0.78);
  --surface-glass-strong: rgba(255, 255, 255, 0.9);
  --panel-glow: rgba(99, 102, 241, 0.16);
  --panel-glow-strong: rgba(139, 92, 246, 0.22);
  --shadow-xl-soft: 0 24px 60px rgba(15, 23, 42, 0.12);
}

[data-theme="dark"] {
  --surface-strong: #1a1f30;
  --surface-glass: rgba(18, 22, 34, 0.76);
  --surface-glass-strong: rgba(22, 27, 41, 0.92);
  --panel-glow: rgba(99, 102, 241, 0.2);
  --panel-glow-strong: rgba(129, 140, 248, 0.24);
  --shadow-xl-soft: 0 28px 80px rgba(0, 0, 0, 0.42);
}
```

- [ ] **Step 2: Verify the CSS file remains syntactically valid via production build later**

Run: `pnpm build`
Expected: Build succeeds without CSS parsing errors

### Task 2: Rebuild the dashboard shell and section hierarchy

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: Existing `projects`, `focusTasks`, `globalStats`, `searchQuery`, `selectedCategory`, `newProject`, `handleAddProject`, and `navigate`
- Produces: New page structure with hero shell, summary row, composer, filter toolbar, and richer project grid while preserving the same behaviors and handlers

- [ ] **Step 1: Replace the outer page wrapper with a layered shell and contained content frame**

```tsx
<div className="relative min-h-screen overflow-hidden bg-[var(--bg)] pt-24 md:pt-32 pb-16">
  <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,_var(--panel-glow-strong),_transparent_38%),radial-gradient(circle_at_top_right,_var(--panel-glow),_transparent_34%)]" />
  <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-[42rem] max-w-6xl rounded-[3rem] border border-white/5 bg-white/[0.02] blur-3xl" />
  <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
```

- [ ] **Step 2: Rework the header into a hero panel with embedded search**

```tsx
<header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-xl-soft)] backdrop-blur-xl md:p-8 lg:p-10">
  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(129,140,248,0.16),transparent_45%,rgba(255,255,255,0.04))]" />
  <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
```

- [ ] **Step 3: Rebuild the summary row and project composer into distinct premium surfaces**

```tsx
<section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
...
</section>

<section className="rounded-[2rem] border border-white/10 bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-xl-soft)] backdrop-blur-xl md:p-8">
...
</section>
```

- [ ] **Step 4: Rebuild the filter bar and project grid card wrappers without changing click/search/filter behavior**

```tsx
<section className="rounded-[1.75rem] border border-white/10 bg-[var(--surface-glass)] p-3 shadow-[var(--shadow-sm)] backdrop-blur-xl">
...
</section>

<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
...
</div>
```

- [ ] **Step 5: Preserve all existing handlers and state wiring**

```tsx
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
onClick={handleAddProject}
onClick={() => setSelectedCategory(category)}
onClick={() => navigate(`/projects/${project.id}`)}
```

### Task 3: Align supporting components to the new surface language

**Files:**
- Modify: `src/components/ActivityFeed.tsx`
- Modify: `src/components/ProjectPulse.tsx`

**Interfaces:**
- Consumes: Existing activity item props and `ProjectPulse` props
- Produces: Matching spacing, text hierarchy, and progress styling without any API changes

- [ ] **Step 1: Update activity items to use richer spacing and stronger icon chips**

```tsx
<div key={activity.id} className="group flex items-start gap-4 rounded-2xl border border-white/6 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
```

- [ ] **Step 2: Refine the progress component visual treatment only**

```tsx
<div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/5">
  <motion.div
    ...
    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent2)] to-sky-400"
  />
</div>
```

### Task 4: Validate the redesign without changing functionality

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/components/ActivityFeed.tsx`
- Modify: `src/components/ProjectPulse.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Final UI changes from prior tasks
- Produces: Verified visual refactor with unchanged interactions

- [ ] **Step 1: Run the production build**

Run: `pnpm build`
Expected: Exit code 0 and Vite production bundle output

- [ ] **Step 2: Run a focused dashboard smoke check in the browser**

Run: `pnpm dev`
Expected: Local app available at `http://localhost:5173` for checking spacing, layout, search input, category filter, project creation UI, and project card navigation

- [ ] **Step 3: Confirm interaction preservation manually**

Check these behaviors on the dashboard page:

```text
1. Search still filters visible projects.
2. Category chips still change the selected category and filter results.
3. The create-project controls still submit through the same button and handler.
4. Clicking a project card still navigates to /projects/:id.
```