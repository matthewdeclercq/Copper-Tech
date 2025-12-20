#!/usr/bin/env node
/**
 * Head Common Content Injector
 *
 * Usage: node build/inject-head-common.js [--dry-run]
 * This script injects content from components/head-common.html into HTML files,
 * replacing duplicated common head content with a single source of truth.
 *
 * Options:
 *   --dry-run    Preview changes without writing files
 */

const fs = require('fs');
const path = require('path');

// HTML files to process
const HTML_FILES = [
    'index.html',
    'military-defense.html',
    'remote-businesses.html',
    'homes.html',
    'emergency-response.html',
    'job-sites.html'
];

/**
 * Validates that a file exists and is readable.
 * @param {string} filePath - Path to the file to validate.
 * @returns {boolean} True if file exists and is readable, false otherwise.
 */
function validateFileExists(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return false;
        }
        // Check if file is readable
        fs.accessSync(filePath, fs.constants.R_OK);
        return true;
    } catch (error) {
        console.error(`❌ Cannot read file ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Validates that the HTML content contains required elements.
 * @param {string} htmlContent - The HTML content to validate.
 * @param {string} fileName - Name of the file being validated (for error messages).
 * @returns {boolean} True if HTML is valid, false otherwise.
 */
function validateHTMLContent(htmlContent, fileName) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        console.error(`❌ Invalid HTML content in ${fileName}: content is empty or not a string`);
        return false;
    }

    if (!htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('<html')) {
        console.warn(`⚠️  Warning: ${fileName} may not be a valid HTML file (missing DOCTYPE or html tag)`);
    }

    return true;
}

/**
 * Injects common head content into HTML files.
 * @param {boolean} dryRun - If true, preview changes without writing files.
 * @returns {boolean} True if all files were processed successfully, false otherwise.
 */
function injectHeadCommon(dryRun = false) {
    const projectRoot = path.join(__dirname, '..');
    const headCommonPath = path.join(projectRoot, 'components', 'head-common.html');

    // Validate head-common.html exists
    if (!validateFileExists(headCommonPath)) {
        console.error('❌ Cannot proceed without head-common.html file');
        return false;
    }

    // Read the common head content
    let headCommonContent;
    try {
        headCommonContent = fs.readFileSync(headCommonPath, 'utf8').trim();
        
        if (!headCommonContent) {
            console.error(`❌ Error: ${headCommonPath} is empty`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error reading ${headCommonPath}:`, error.message);
        return false;
    }

    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Process each HTML file
    HTML_FILES.forEach(htmlFile => {
        const htmlFilePath = path.join(projectRoot, htmlFile);
        
        try {
            // Validate file exists
            if (!validateFileExists(htmlFilePath)) {
                errors.push(`File not found: ${htmlFile}`);
                failCount++;
                return;
            }

            let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            
            // Validate HTML content
            if (!validateHTMLContent(htmlContent, htmlFile)) {
                errors.push(`Invalid HTML content in ${htmlFile}`);
                failCount++;
                return;
            }
            
            // Pattern to match: from the placeholder comment to just before Open Graph tags
            // This includes the comment, all common meta tags, links, and scripts
            const placeholderPattern = /(<!-- Common head content injected by build script -->\s*)([\s\S]*?)(\s*<!-- Page-Specific Open Graph)/;
            
            // Check if placeholder exists
            if (!placeholderPattern.test(htmlContent)) {
                console.warn(`⚠️  Placeholder comment not found in ${htmlFile}. Skipping.`);
                errors.push(`Missing placeholder comment in ${htmlFile}`);
                failCount++;
                return;
            }
            
            // Replace the content between placeholder and Open Graph with head-common.html content
            // Ensure proper spacing: newline after injected content, then indented comment
            const updatedContent = htmlContent.replace(
                placeholderPattern,
                (match, p1, p2, p3) => {
                    // Ensure headCommonContent ends with a newline
                    const normalizedContent = headCommonContent.endsWith('\n') 
                        ? headCommonContent 
                        : headCommonContent + '\n';
                    // p3 starts with whitespace (\s*) which may include newline, so we normalize it
                    const normalizedP3 = p3.replace(/^\s+/, '\n    ');
                    return `${p1}${normalizedContent}${normalizedP3}`;
                }
            );

            // Verify replacement occurred
            if (updatedContent === htmlContent) {
                console.warn(`⚠️  No changes made to ${htmlFile} - content may already be up to date`);
            }
            
            // Write the updated content back (unless dry run)
            if (!dryRun) {
                fs.writeFileSync(htmlFilePath, updatedContent, 'utf8');
                console.log(`✅ Updated ${htmlFile}`);
            } else {
                console.log(`🔍 Would update ${htmlFile}`);
            }
            
            successCount++;
            
        } catch (error) {
            const errorMsg = `Error processing ${htmlFile}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
            failCount++;
        }
    });
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (dryRun) {
        console.log('🔍 DRY RUN SUMMARY');
    } else {
        console.log('✅ INJECTION SUMMARY');
    }
    console.log('='.repeat(50));
    console.log(`Processed: ${HTML_FILES.length} files`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    
    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (dryRun) {
        console.log('\n💡 Run without --dry-run to apply changes');
    } else if (successCount === HTML_FILES.length) {
        console.log('\n✅ Head common content injection complete');
    } else {
        console.log('\n⚠️  Some files were not updated. Please review errors above.');
    }
    
    return failCount === 0;
}

// Run the injection if this script is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    const success = injectHeadCommon(dryRun);
    process.exit(success ? 0 : 1);
}

module.exports = { injectHeadCommon };

