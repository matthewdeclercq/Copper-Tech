# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Build Commands

```bash
# Full production build (run before deployment)
npm run build

# Individual build scripts
npm run build:inject          # Inject head-common.html into all HTML files
npm run build:inject --dry-run # Preview head injection without changes
npm run build:sitemap         # Update sitemap.xml lastmod dates to today
npm run optimize-images       # Compress images and generate WebP versions
npm run optimize-images:dry-run      # Preview image optimization
npm run optimize-images:webp-only    # Generate WebP versions only
npm run optimize-images:compress-only # Compress images only
```

**IMPORTANT:** After modifying `components/head-common.html`, you MUST run `npm run build:inject` or `npm run build`.

## Code Style Guidelines

### JavaScript
- **Documentation:** Use JSDoc for all functions with @param, @returns, @example
- **Constants:** Group in a `Constants` object at file top; use UPPER_SNAKE_CASE
- **Naming:** camelCase for functions/variables, PascalCase for config objects
- **Error Handling:** Use try-catch blocks; log errors with `console.error()`
- **Patterns:** Prefer early returns, defensive null checks, async/await
- **Accessibility:** Include ARIA labels, screen reader announcements, focus management
- **Comments:** Use `// === Section Name ===` dividers between logical sections

### CSS
- **Variables:** Use CSS custom properties (e.g., `--color-copper`, `--spacing-md`)
- **Architecture:** Modular files imported by `styles.css` (base, layout, components, utilities)
- **Naming:** kebab-case for classes (e.g., `.nav-container`, `.cta-button`)
- **Comments:** Use `/* ========================================================================== */` block dividers
- **Responsive:** Use hardcoded breakpoints: 480px, 768px, 1024px, 1200px

### HTML
- **Semantics:** Use semantic HTML5 elements (nav, section, article, etc.)
- **Accessibility:** Include ARIA attributes (aria-label, aria-expanded, role)
- **Images:** Use WebP with fallbacks via `<picture>` element
- **Comments:** Mark injection points: `<!-- Common head content injected by build script -->`

### File Organization
- HTML files: Root directory
- Components: `components/` (nav.html, footer.html, cta.html, head-common.html)
- CSS: `css/` (modular: base.css, layout.css, components.css, utilities.css)
- JavaScript: `js/` (config.js, script.js)
- Build scripts: `build/` (Node.js scripts)
- Images: `assets/` (optimized by build script)

## Architecture Notes

**Component Loading:**
- Components are client-side loaded via Fetch API (not build-time templating)
- Placeholder elements (e.g., `<div id="nav-placeholder"></div>`) in HTML files
- Component paths defined in `js/config.js` `AppConfig.components`
- Project cards loaded separately into `.project-cards-list` container

**Head Injection:**
- Build script injects `components/head-common.html` between placeholder comments
- Pattern: `<!-- Common head content injected by build script -->` ... `<!-- Page-Specific Open Graph`
- Ensures consistent meta tags, favicons, CSS/JS includes across all pages

**GitHub Pages:**
- Static hosting (no server-side rendering)
- Auto-deploys from `main` branch
- Run `npm run build` before committing when head-common.html changes

## Testing & Linting

**No test framework or linting tools are currently configured.**

When adding tests:
- Place test files in `tests/` or `__tests__/` directories
- Use descriptive test names following `describe/it` or similar patterns
- To run a single test file, use your test runner's file filter (e.g., `npm test -- path/to/test.js`)

## AI Behavior

**MUST DO:**
- Run `npm run build` after modifying shared components or before deployment
- Follow existing code style patterns in neighboring files
- Add JSDoc to all new JavaScript functions
- Use existing CSS variables from base.css
- Include accessibility attributes (ARIA) in HTML
- Verify file paths in `js/config.js` when adding components

**MUST NOT DO:**
- Edit individual HTML files for shared head content (use `components/head-common.html`)
- Commit without running build if head-common.html was modified
- Use CSS-in-JS or inline styles (use CSS classes with custom properties)
- Add server-side rendering features (static hosting only)
