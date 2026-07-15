# Dashboard Premium Glass Redesign

## Overview

Refresh the dashboard page so it feels deliberate, modern, and premium instead of flat and under-spaced. The redesign keeps the current data model and dashboard features, but rebuilds the presentation around a darker glass-inspired visual system with better spacing, clearer hierarchy, and stronger section framing.

## Goals

- Make the dashboard feel polished and modern on desktop and mobile.
- Improve padding, spacing, and alignment across all dashboard sections.
- Introduce a premium glass aesthetic without harming readability.
- Strengthen the page hierarchy so overview, quick actions, and projects are visually distinct.
- Preserve existing behavior, navigation, and Supabase-driven data flows.

## Non-Goals

- No changes to authentication or routing.
- No schema or API changes.
- No new dashboard features beyond presentation and minor copy polish.
- No rewrite of shared navbar behavior unless required for visual consistency.

## Design Direction

The page should lean into a premium dark workspace aesthetic with controlled glassmorphism:

- Use layered radial glows behind the main content to avoid a flat backdrop.
- Use translucent panels with subtle borders and deeper shadows for hero and control surfaces.
- Keep project cards slightly more solid than the hero surfaces so content remains easy to scan.
- Use one primary accent family, centered on indigo, with secondary highlight tones for gradients and progress states.
- Preserve high contrast for titles, labels, and interactive controls.

## Layout Structure

The page should be organized in this order:

1. Hero shell
2. Summary and focus panels
3. Project composer
4. Filter toolbar
5. Project grid
6. Supporting side rail content

### Hero shell

The top of the page should become a contained hero section rather than loose text on the background. It should include:

- A stronger title block with larger type and clearer subtitle spacing.
- A search panel that feels embedded in the hero surface.
- Decorative background glow layers that stay behind content.

### Summary row

The focus panel and global progress panel should read like key dashboard highlights rather than ordinary cards. They should gain:

- Larger internal padding
- Better spacing between headings and content
- More expressive panel depth through gradient, blur, and highlight layers
- A balanced grid relationship on large screens and a clean stack on small screens

### Project composer

The project creation controls should live inside a dedicated composer card instead of a plain horizontal strip. The composer should:

- Have a short heading and helper copy
- Use grouped inputs with more generous padding
- Feel like a first-class action area rather than a utility row

### Filter toolbar

Category filters should sit inside a framed control bar with better separation from the rest of the page. The toolbar should:

- Have its own glass surface
- Use stronger active states
- Support horizontal scrolling cleanly on smaller screens

### Project grid

The project grid should be more spacious and editorial:

- Taller cards with better title and metadata spacing
- Clear status and category treatments
- Progress information that is easier to scan
- Stronger hover and focus affordances for clickability
- Empty and loading states that align visually with the redesigned surface language

### Side rail

If activity and related summary content appear alongside the grid, they should share the same glass system and spacing rhythm. These components should feel visually connected to the dashboard shell rather than appended after the fact.

## Component-Level Changes

### Dashboard page

- Add decorative background layers inside the page container.
- Wrap main content in a centered shell with more generous width and vertical spacing.
- Rebuild section wrappers so cards do not visually collapse into the page background.

### Focus tasks

- Upgrade task item presentation with better spacing and clearer text hierarchy.
- Keep the interaction light and readable, with hover states that reveal click direction without overwhelming the content.

### Global progress

- Convert the progress panel into a stronger hero stat with a richer gradient and better supporting text treatment.
- Ensure the panel does not dominate the layout on smaller screens.

### Project creation controls

- Add heading, supporting copy, and cleaner grouping.
- Ensure inputs and call-to-action align well on both stacked and inline layouts.

### Project cards

- Increase padding and card height consistency.
- Improve spacing between title, description, labels, and progress.
- Refine borders, shadows, and hover transitions.

## Motion and Interaction

- Use restrained entrance motion for major sections.
- Use subtle lift and border emphasis on hover.
- Keep animations short and unobtrusive.
- Avoid flashy movement that competes with dashboard readability.

## Responsive Behavior

- Preserve a single-column flow on smaller screens with comfortable padding.
- Allow the hero area and composer to stack naturally without cramped controls.
- Keep filters horizontally scrollable when needed.
- Ensure glass effects do not reduce legibility on mobile.

## Accessibility and Readability

- Maintain readable text contrast within translucent surfaces.
- Ensure button and input states remain visually distinct.
- Keep semantic structure unchanged where possible.
- Avoid overusing blur where it could soften important content.

## Implementation Scope

Expected implementation should primarily touch dashboard presentation and closely related shared styling surfaces. The work should stay focused on:

- Dashboard page layout and utility classes
- Shared theme tokens if the redesign needs new surface or glow variables
- Minor supporting component class updates where required for consistency

No data-fetching or business-logic changes should be required.

## Validation

- Run a production build after the visual refactor.
- Perform a focused dashboard smoke check in the browser for desktop and mobile-width layouts.
- Confirm existing interactions still work: search, category filter, create project, and project navigation.