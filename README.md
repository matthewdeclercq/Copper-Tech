# Copper Tech Website

Static website for Copper Tech LLC. Deployed via GitHub Pages at coppertech.us.

## File Structure

```
├── index.html                    # Homepage
├── industries/
│   ├── military-defense.html    # Military & defense page
│   ├── homes.html               # Residential page
│   ├── remote-businesses.html   # Remote businesses page
│   ├── commercial-buildings.html # Commercial buildings page
│   ├── emergency-response.html  # Emergency response page
│   └── job-sites.html           # Job sites page
├── css/                         # Stylesheets
│   ├── styles.css              # Main stylesheet (imports others)
│   ├── base.css                # Base styles
│   ├── components.css          # Component styles
│   ├── layout.css              # Layout styles
│   └── utilities.css           # Utility classes
├── js/
│   ├── config.js               # Component paths and project cards
│   └── script.js               # Component loading and interactivity
├── components/                  # Reusable HTML components
│   ├── nav.html
│   ├── footer.html
│   ├── cta.html
│   ├── head-common.html        # Common head content (injected by build)
│   ├── project-navy-pacific.html
│   └── project-camper-van.html
├── assets/                      # Images and media
├── build/                       # Build scripts
│   ├── inject-head-common.js
│   ├── update-sitemap.js
│   └── optimize-images.js
└── sitemap.xml
```

## Development

Open `index.html` in a browser for local development. No build step required for development.

### Adding a New Project

1. Create `components/project-name.html` with an `<article class="project-showcase">` element
2. Add the path to `js/config.js` in the `projectCards` array:
   ```javascript
   projectCards: [
       'components/project-navy-pacific.html',
       'components/project-camper-van.html',
       'components/project-name.html'  // Add here
   ]
   ```

### Configuration

`js/config.js` controls:
- Component paths (`components` object)
- Project cards list (`projectCards` array)
- CSS selectors and error messages

## Build Process

Run before deploying:

```bash
npm run build
```

This runs three scripts:

1. **`inject-head-common.js`** - Injects `components/head-common.html` into all HTML files
    ```bash
    npm run build:inject
    npm run build:dry-run  # Preview only
    ```

2. **`update-sitemap.js`** - Updates all `<lastmod>` dates to today
    ```bash
    npm run build:sitemap
    ```

3. **`optimize-images.js`** - Compresses images and generates WebP versions
    ```bash
    npm run optimize-images
    npm run optimize-images:dry-run      # Preview only
    npm run optimize-images:webp-only    # WebP only
    npm run optimize-images:compress-only # Compression only
    ```

**Important:** 
- If you change `components/head-common.html`, run `npm run build:inject` before committing
- If you add/modify images, run `npm run optimize-images` before committing

## Deployment

1. Run `npm run build`
2. Commit and push to `main` branch
3. GitHub Pages auto-deploys

## Banner Images

Banner images are set in `css/layout.css`:

- Homepage: `assets/bg.jpg` / `assets/bg_mobile.jpg`
- Military: `assets/military+defense.jpg`
- Remote Businesses: `assets/logging-office.jpg`
- Homes: `assets/off-grid-home-2.jpg`
- Emergency Response: `assets/emergency-response.jpg`
- Job Sites: `assets/mobile-power.jpg`

## Requirements

- Node.js 14+ (for build scripts)
- `sharp` package (installed via `npm install`)
