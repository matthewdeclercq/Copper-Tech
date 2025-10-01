#!/usr/bin/env node
/**
 * Sitemap Last Modified Date Updater
 *
 * Usage: node update-sitemap.js
 * This script updates the lastmod dates in sitemap.xml to today's date
 */

const fs = require('fs');
const path = require('path');

function updateSitemapDates() {
    const sitemapPath = path.join(__dirname, 'sitemap.xml');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    try {
        // Read the sitemap file
        let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

        // Replace all lastmod dates with today's date
        sitemapContent = sitemapContent.replace(
            /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
            `<lastmod>${today}</lastmod>`
        );

        // Write the updated content back
        fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

        console.log(`✅ Sitemap lastmod dates updated to ${today}`);
        console.log('📄 Updated sitemap.xml');

    } catch (error) {
        console.error('❌ Error updating sitemap:', error.message);
        process.exit(1);
    }
}

// Run the update if this script is executed directly
if (require.main === module) {
    updateSitemapDates();
}

module.exports = { updateSitemapDates };
