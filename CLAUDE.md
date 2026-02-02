# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for Copper Tech LLC deployed via GitHub Pages at coppertech.us. The site uses a component-based architecture with vanilla JavaScript for dynamic content loading and interactive features.

## Build Commands

### Development
No build step required for local development - just open `index.html` in a browser.

### Production Build
```bash
npm run build
```
Runs three build scripts in sequence:
1. `inject-head-common.js` - Injects `components/head-common.html` into all HTML pages
2. `update-sitemap.js` - Updates sitemap lastmod dates to today
3. `optimize-images.js` - Compresses images and generates WebP versions

### Individual Build Scripts
```bash
# Head injection (REQUIRED after editing components/head-common.html)
node build/inject-head-common.js
node build/inject-head-common.js --dry-run  # Preview changes

# Sitemap update
node build/update-sitemap.js

# Image optimization (REQUIRED after adding/modifying images)
node build/optimize-images.js
node build/optimize-images.js --dry-run        # Preview changes
node build/optimize-images.js --webp-only      # WebP generation only
node build/optimize-images.js --compress-only  # Compression only
```

## Architecture

### Component Loading System
The site uses a client-side component loading system (`js/script.js`) that fetches HTML fragments and injects them into placeholder elements. This enables reusable components (nav, footer, CTA) across all pages without a build-time templating system.

**Key files:**
- `js/config.js` - Central configuration for component paths, project cards, and feature settings
- `js/script.js` - Component loader, DOM manipulation, and all interactive features

**Component flow:**
1. HTML pages contain placeholder elements (e.g., `<div id="nav-placeholder"></div>`)
2. On `DOMContentLoaded`, `initializeComponents()` fetches components defined in `AppConfig.components`
3. Project cards are loaded separately into `.project-cards-list` container
4. After components load, interactive features initialize (carousel, menu overlay, etc.)

### Build System Architecture
The build scripts manipulate static HTML files before deployment:

**Head injection pattern:**
- HTML files have a comment marker: `<!-- Common head content injected by build script -->`
- Content between this marker and `<!-- Page-Specific Open Graph` is replaced with `components/head-common.html`
- This ensures consistent meta tags, favicons, and CSS/JS includes across all pages

**Why this matters:** If you modify shared head content (meta tags, CSS links, analytics), edit `components/head-common.html` and run `inject-head-common.js`, not individual HTML files.

### CSS Organization
The main stylesheet `css/styles.css` imports four modular CSS files:
- `base.css` - Typography, resets, global styles
- `layout.css` - Page layout, sections, banner images
- `components.css` - Reusable component styles
- `utilities.css` - Utility classes

Banner images are defined in `css/layout.css` using background-image properties for each page.

### JavaScript Features
All features are self-contained functions in `js/script.js`:
- Component loading (standard components + project cards)
- Smooth scrolling for CTA buttons
- Navigation background change on scroll
- Full-screen menu overlay with focus trap
- Fade-in animations via IntersectionObserver
- Project carousel with touch/swipe support
- Rotating industry heading (homepage only)
- FAQ accordions
- Banner h1 click handler (industry pages)

Each feature handles its own error checking and gracefully degrades if elements don't exist.

## Adding New Content

### Adding a Project Card
1. Create `components/project-{name}.html` with an `<article class="project-showcase">` element
2. Add the file path to `js/config.js`:
   ```javascript
   projectCards: [
       'components/project-navy-pacific.html',
       'components/project-camper-van.html',
       'components/project-{name}.html'  // Add here
   ]
   ```

### Adding a New Page
1. Create the HTML file in the root directory
2. Add placeholder elements for components:
   ```html
   <div id="nav-placeholder"></div>
   <div id="footer-placeholder"></div>
   ```
3. Add to `HTML_FILES` array in `build/inject-head-common.js`
4. Update `sitemap.xml`
5. If the page has a banner image, add background-image CSS in `css/layout.css`

### Modifying Shared Components
- **Navigation/Footer/CTA:** Edit the component file directly (e.g., `components/nav.html`)
- **Common head content:** Edit `components/head-common.html` then run `node build/inject-head-common.js`

## Deployment

GitHub Pages auto-deploys from the `main` branch. The deployment workflow:
1. Run `npm run build` to inject head content, update sitemap, and optimize images
2. Commit and push to `main`
3. GitHub Pages serves the site from the root directory

## Key Constraints

- **No build-time templating:** Components are loaded at runtime, not during build
- **Static hosting:** All features must work client-side (no server-side rendering)
- **Head injection timing:** The build script must run before deployment if `head-common.html` changed
- **Image optimization:** New/modified images should be optimized before commit to reduce page load times
