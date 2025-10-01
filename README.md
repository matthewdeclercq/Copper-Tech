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
- `styles.css` - Main stylesheet with responsive design and modern UI
- `script.js` - JavaScript functionality for interactive features
- `sitemap.xml` - XML sitemap for search engine optimization
- `CNAME` - GitHub Pages custom domain configuration (coppertech.co)
- `update-sitemap.js` - Utility script for updating sitemap lastmod dates
- `components/` - Reusable HTML components
  - `nav.html` - Navigation component
  - `footer.html` - Footer component
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

### Updating Sitemap

The sitemap includes both pages with proper priority and change frequency. To update the last modified dates:

```bash
# Run the update script
node update-sitemap.js
```

The script automatically updates all `lastmod` dates to today's date and is designed to be run before deployment.

## Deployment

This site is configured for GitHub Pages deployment with the custom domain `coppertech.co`.

### Deployment Process
1. Make your changes
2. Update the sitemap: `node update-sitemap.js`
3. Commit and push changes to the `main` branch
4. GitHub Pages will automatically deploy the updated site

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
