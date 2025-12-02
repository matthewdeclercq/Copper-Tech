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
- `CNAME` - GitHub Pages custom domain configuration (coppertech.co)
- `build/` - Build utilities
  - `update-sitemap.js` - Utility script for updating sitemap lastmod dates
  - `inject-head-common.js` - Build script that injects common head content into HTML files
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
- Node.js (for running the sitemap update script)

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

```bash
# Inject common head content into HTML files
node build/inject-head-common.js
```

#### Updating Sitemap

The sitemap includes both pages with proper priority and change frequency. To update the last modified dates:

```bash
# Update sitemap lastmod dates
node build/update-sitemap.js
```

Both scripts are designed to be run before deployment to ensure the site is properly built.

## Deployment

This site is configured for GitHub Pages deployment with the custom domain `coppertech.co`.

### Deployment Process
1. Make your changes
2. Run the build scripts:
   ```bash
   node build/inject-head-common.js
   node build/update-sitemap.js
   ```
3. Commit and push changes to the `main` branch
4. GitHub Pages will automatically deploy the updated site

**Note:** If you modify `components/head-common.html`, you must run `inject-head-common.js` to update all HTML files before committing.

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
