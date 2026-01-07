# Copper Tech LLC Website

A professional website for Copper Tech LLC, specializing in off-grid energy solutions, network infrastructure, and technology consulting. Rooted in the Keweenaw Peninsula, serving clients nationwide.

## About Copper Tech LLC

Copper Tech LLC provides comprehensive technology and business consulting services with expertise in:

- **Off-Grid Energy Solutions**: Solar systems, battery storage, and renewable energy installations
- **Network Infrastructure**: Custom network design, security systems, and remote connectivity
- **Technology Consulting**: Custom software systems and business process optimization
- **Military & Defense Services**: Specialized technology solutions for defense contractors

## File Structure

- `index.html` - Main homepage showcasing services and company information
- `military-defense.html` - Dedicated page for military and defense services
- `homes.html` - Residential solar solutions page (off-grid and grid-tied systems)
- `remote-businesses.html` - Remote business energy solutions page (farms, logging, mining, heavy industry)
- `emergency-response.html` - Emergency response and disaster relief energy solutions page
- `job-sites.html` - Job site and construction energy solutions page
- `css/` - Modular CSS architecture
  - `styles.css` - Main stylesheet (imports other modules)
  - `base.css` - Base styles and resets
  - `components.css` - Component styles
  - `layout.css` - Layout and grid systems
  - `utilities.css` - Utility classes
- `js/` - JavaScript functionality
  - `config.js` - Centralized configuration for components and project cards
  - `script.js` - Component loading and interactive features
- `sitemap.xml` - XML sitemap for search engine optimization
- `CNAME` - GitHub Pages custom domain configuration (coppertech.us)
- `build/` - Build utilities
  - `update-sitemap.js` - Utility script for updating sitemap lastmod dates
  - `inject-head-common.js` - Build script that injects common head content into HTML files
  - `optimize-images.js` - Image optimization script that generates WebP versions and compresses images
- `components/` - Reusable HTML components
  - `nav.html` - Navigation component
  - `footer.html` - Footer component
  - `cta.html` - Call-to-action component
  - `project-navy-pacific.html` - US Navy Pacific Missile Range Facility project card
  - `project-camper-van.html` - Off-Grid No-Compromise Camper Van project card
  - `head-common.html` - Common head elements (injected into HTML files during build)
- `assets/` - Images, favicons, and media files

## SEO Features

- ✅ Comprehensive meta tags (title, description, keywords)
- ✅ Open Graph and Twitter Card support
- ✅ Schema.org structured data
- ✅ XML sitemap
- ✅ Canonical URLs
- ✅ Performance optimizations

## Local Development

### Prerequisites
- Node.js (for running build scripts: sitemap updates, head injection, and image optimization)

### Getting Started
1. Clone the repository
2. Open `index.html` in your browser for local development
3. Make changes to HTML, CSS, or JavaScript files as needed

### Adding New Projects

To add a new project card to the homepage:

1. Create a new HTML file in the `components/` directory (e.g., `components/project-example.html`)
2. The file should contain a single `<article>` element with the class `project-showcase`
3. Add the file path to the `projectCards` array in `js/config.js`:
   ```javascript
   projectCards: [
       'components/project-navy-pacific.html',
       'components/project-camper-van.html',
       'components/project-example.html'  // Add your new project here
   ]
   ```
4. The project will automatically be loaded on the homepage

### Configuration

The `js/config.js` file centralizes all component paths and configuration:
- **components**: Maps element IDs to component file paths
- **projectCards**: Array of project card file paths (loaded in order)
- **selectors**: CSS selectors for containers
- **messages**: User-facing error messages

Modify this file to add/remove components or update paths without touching the main script.

### Build Process

Before deployment, you need to run the build scripts to prepare the site:

#### Injecting Common Head Content

The common head content (meta tags, stylesheets, scripts) is maintained in `components/head-common.html` and automatically injected into all HTML files. This ensures consistency and reduces duplication.

**Processed files:**
- `index.html`
- `military-defense.html`
- `remote-businesses.html`
- `homes.html`
- `emergency-response.html`
- `job-sites.html`

```bash
# Inject common head content into HTML files
node build/inject-head-common.js

# Preview changes without modifying files
node build/inject-head-common.js --dry-run
```

#### Updating Sitemap

The sitemap includes all pages with proper priority and change frequency. The script automatically updates all `<lastmod>` dates to today's date.

**Pages in sitemap:**
- `index.html` (priority: 1.0)
- `military-defense.html` (priority: 0.8)
- `remote-businesses.html` (priority: 0.8)
- `homes.html` (priority: 0.8)
- `emergency-response.html` (priority: 0.8)
- `job-sites.html` (priority: 0.8)

```bash
# Update sitemap lastmod dates
node build/update-sitemap.js
```

#### Optimizing Images

The image optimization script generates WebP versions of images and compresses them for better performance. It processes all JPG/PNG files in the `assets/` directory (excluding favicons).

**Features:**
- Compresses JPG images (quality: 85, progressive encoding)
- Compresses PNG images (quality: 90, compression level: 9)
- Generates WebP versions (quality: 85) for modern browsers
- Resizes images larger than 1920px width
- Preserves original images as fallbacks

```bash
# Optimize images (generates WebP and compresses)
node build/optimize-images.js

# Dry run to see what would be optimized
node build/optimize-images.js --dry-run

# Only generate WebP versions
node build/optimize-images.js --webp-only

# Only compress existing images
node build/optimize-images.js --compress-only
```

All build scripts are designed to be run before deployment to ensure the site is properly built.

**Build Script Execution Order:**
The scripts can be run in any order, but the recommended workflow is:
1. `inject-head-common.js` - Update HTML files with common head content
2. `update-sitemap.js` - Update sitemap dates
3. `optimize-images.js` - Optimize images (can be run independently)

Or simply run `npm run build` to execute all scripts in the correct order.

### Banner Images

The site uses different banner images for each page, defined in `css/layout.css`:

- **Homepage** (`.banner`): 
  - Desktop: `assets/bg.jpg`
  - Mobile: `assets/bg_mobile.jpg` (via responsive CSS)

- **Military & Defense** (`.banner-military`): 
  - `assets/military+defense.jpg`

- **Remote Businesses** (`.banner-remote-businesses`): 
  - `assets/logging-office.jpg`

- **Residential Homes** (`.banner-homes`): 
  - `assets/off-grid-home-2.jpg`

- **Emergency Response** (`.banner-emergency-response`): 
  - `assets/emergency-response.jpg`

- **Job Sites** (`.banner-job-sites`): 
  - `assets/mobile-power.jpg`

**Note:** When adding new pages, ensure corresponding banner images are added to the assets directory and referenced in the CSS with a `.banner-[page-name]` class.

## Deployment

This site is configured for GitHub Pages deployment with the custom domain `coppertech.us`.

### Deployment Process
1. Make your changes
2. Run the build scripts:
   ```bash
   # Run all build scripts (recommended)
   npm run build
   
   # Or run individually:
   node build/inject-head-common.js
   node build/update-sitemap.js
   node build/optimize-images.js
   ```
3. Commit and push changes to the `main` branch
4. GitHub Pages will automatically deploy the updated site

**Note:** If you modify `components/head-common.html`, you must run `inject-head-common.js` to update all HTML files before committing. If you add or modify images, run `optimize-images.js` to generate WebP versions and compress them.

## Technologies Used

- **Frontend**: HTML5, CSS3 (Grid, Flexbox, Custom Properties)
- **JavaScript**: Vanilla ES6+ for interactive features
- **SEO**: Schema.org structured data, Open Graph, Twitter Cards
- **Performance**: Optimized images, lazy loading, efficient CSS
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Design**: Responsive design, modern UI components

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025 Copper Tech LLC. All rights reserved.
