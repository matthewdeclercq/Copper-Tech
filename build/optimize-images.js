#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * Usage: node build/optimize-images.js [--webp-only] [--compress-only]
 * 
 * This script optimizes images by:
 * - Compressing JPG/PNG images to reduce file sizes
 * - Creating WebP versions for modern browsers
 * - Preserving original images as fallbacks
 *
 * Options:
 *   --webp-only      Only generate WebP versions (skip compression)
 *   --compress-only  Only compress images (skip WebP generation)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error('❌ Error: sharp package not found.');
    console.error('   Please install it with: npm install sharp --save-dev');
    process.exit(1);
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const MAX_WIDTH = 1920; // Max width for images (full HD)
const QUALITY_JPG = 85; // JPG quality (0-100)
const QUALITY_PNG = 90; // PNG quality (0-100)
const QUALITY_WEBP = 85; // WebP quality (0-100)
const METADATA_FILE = path.join(ASSETS_DIR, '.compression-metadata.json');

// Image files to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const SKIP_FILES = ['favicon.ico', 'favicon.png']; // Skip favicons (already optimized)

/**
 * Gets all image files in the assets directory
 * @returns {string[]} Array of image file paths
 */
function getImageFiles() {
    const files = fs.readdirSync(ASSETS_DIR);
    return files
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.includes(ext) && !SKIP_FILES.includes(file);
        })
        .map(file => path.join(ASSETS_DIR, file));
}

/**
 * Loads compression metadata from file
 * @returns {Object} Metadata object with file paths as keys
 */
function loadMetadata() {
    if (!fs.existsSync(METADATA_FILE)) {
        return {};
    }
    try {
        const content = fs.readFileSync(METADATA_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.warn(`Warning: Could not read metadata file: ${error.message}`);
        return {};
    }
}

/**
 * Saves compression metadata to file
 * @param {Object} metadata - Metadata object to save
 */
function saveMetadata(metadata) {
    try {
        fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not write metadata file: ${error.message}`);
    }
}

/**
 * Compresses an image file
 * @param {string} inputPath - Path to input image
 * @param {boolean} dryRun - If true, don't write files
 * @param {Object} compressionMetadata - Metadata object to check/update
 * @returns {Promise<{originalSize: number, newSize: number, saved: number, percent: number, skipped: boolean}>}
 */
async function compressImage(inputPath, dryRun = false, compressionMetadata = {}) {
    const ext = path.extname(inputPath).toLowerCase();
    const isPNG = ext === '.png';
    const relativePath = path.relative(ASSETS_DIR, inputPath);
    
    try {
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;
        const mtime = originalStats.mtime.getTime();
        
        // Check if compression can be skipped
        if (!dryRun && compressionMetadata[relativePath]) {
            const stored = compressionMetadata[relativePath];
            const settingsMatch = 
                stored.maxWidth === MAX_WIDTH &&
                stored.qualityJpg === QUALITY_JPG &&
                stored.qualityPng === QUALITY_PNG &&
                stored.mtime === mtime;
            
            if (settingsMatch) {
                return {
                    originalSize,
                    newSize: originalSize,
                    saved: 0,
                    percent: 0,
                    skipped: true
                };
            }
        }
        
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Resize if too large
        let processedImage = image;
        if (metadata.width > MAX_WIDTH) {
            processedImage = image.resize(MAX_WIDTH, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }
        
        // Apply compression based on format
        if (isPNG) {
            processedImage = processedImage.png({
                quality: QUALITY_PNG,
                compressionLevel: 9,
                adaptiveFiltering: true
            });
        } else {
            processedImage = processedImage.jpeg({
                quality: QUALITY_JPG,
                mozjpeg: true,
                progressive: true
            });
        }
        
        let newSize;
        if (!dryRun) {
            // Write compressed version to temporary file first, then replace original
            const tempPath = inputPath + '.tmp';
            await processedImage.toFile(tempPath);
            fs.renameSync(tempPath, inputPath);
            newSize = fs.statSync(inputPath).size;
            
            // Update metadata
            compressionMetadata[relativePath] = {
                mtime: fs.statSync(inputPath).mtime.getTime(),
                maxWidth: MAX_WIDTH,
                qualityJpg: QUALITY_JPG,
                qualityPng: QUALITY_PNG
            };
        } else {
            // For dry run, estimate size from buffer
            const buffer = await processedImage.toBuffer();
            newSize = buffer.length;
        }
        const saved = originalSize - newSize;
        const percent = ((saved / originalSize) * 100).toFixed(1);
        
        return {
            originalSize,
            newSize,
            saved,
            percent: parseFloat(percent),
            skipped: false
        };
    } catch (error) {
        throw new Error(`Failed to compress ${path.basename(inputPath)}: ${error.message}`);
    }
}

/**
 * Creates a WebP version of an image
 * @param {string} inputPath - Path to input image
 * @param {boolean} dryRun - If true, don't write files
 * @returns {Promise<{webpPath: string, size: number}>}
 */
async function createWebP(inputPath, dryRun = false) {
    const ext = path.extname(inputPath).toLowerCase();
    const webpPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Skip if WebP already exists and is newer
    if (!dryRun && fs.existsSync(webpPath)) {
        const inputStats = fs.statSync(inputPath);
        const webpStats = fs.statSync(webpPath);
        if (webpStats.mtime >= inputStats.mtime) {
            return {
                webpPath,
                size: webpStats.size,
                skipped: true
            };
        }
    }
    
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Resize if too large
        let processedImage = image;
        if (metadata.width > MAX_WIDTH) {
            processedImage = image.resize(MAX_WIDTH, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }
        
        // Convert to WebP
        const webpBuffer = await processedImage
            .webp({ quality: QUALITY_WEBP })
            .toBuffer();
        
        if (!dryRun) {
            fs.writeFileSync(webpPath, webpBuffer);
        }
        
        return {
            webpPath,
            size: webpBuffer.length,
            skipped: false
        };
    } catch (error) {
        throw new Error(`Failed to create WebP for ${path.basename(inputPath)}: ${error.message}`);
    }
}

/**
 * Formats file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Main optimization function
 * @param {boolean} webpOnly - Only generate WebP versions
 * @param {boolean} compressOnly - Only compress images
 * @param {boolean} dryRun - Preview changes without writing
 */
async function optimizeImages(webpOnly = false, compressOnly = false, dryRun = false) {
    const imageFiles = getImageFiles();
    
    if (imageFiles.length === 0) {
        console.log('No images found to optimize.');
        return;
    }
    
    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    // Load compression metadata
    const compressionMetadata = dryRun ? {} : loadMetadata();
    
    console.log(`Found ${imageFiles.length} image(s) to process...\n`);
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let totalWebPSize = 0;
    let skippedCount = 0;
    const results = [];
    
    for (const imagePath of imageFiles) {
        const fileName = path.basename(imagePath);
        console.log(`Processing: ${fileName}`);
        
        try {
            let compressionResult = null;
            let webpResult = null;
            
            // Compress image
            if (!webpOnly) {
                compressionResult = await compressImage(imagePath, dryRun, compressionMetadata);
                totalOriginalSize += compressionResult.originalSize;
                totalNewSize += compressionResult.newSize;
                if (compressionResult.skipped) {
                    console.log(`  Compressed: Already optimized (${formatSize(compressionResult.originalSize)})`);
                    skippedCount++;
                } else {
                    console.log(`  Compressed: ${formatSize(compressionResult.originalSize)} → ${formatSize(compressionResult.newSize)} (saved ${compressionResult.percent}%)`);
                }
            }
            
            // Create WebP version
            if (!compressOnly) {
                webpResult = await createWebP(imagePath, dryRun);
                if (webpResult.skipped) {
                    console.log(`  WebP: Already exists (${formatSize(webpResult.size)})`);
                } else {
                    totalWebPSize += webpResult.size;
                    console.log(`  WebP: Created ${formatSize(webpResult.size)}`);
                }
            }
            
            results.push({
                file: fileName,
                compression: compressionResult,
                webp: webpResult
            });
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            results.push({
                file: fileName,
                error: error.message
            });
        }
        
        console.log('');
    }
    
    // Save compression metadata
    if (!dryRun && !webpOnly) {
        saveMetadata(compressionMetadata);
    }
    
    // Summary
    console.log('='.repeat(60));
    if (dryRun) {
        console.log('🔍 DRY RUN SUMMARY');
    } else {
        console.log('✅ OPTIMIZATION SUMMARY');
    }
    console.log('='.repeat(60));
    console.log(`Processed: ${imageFiles.length} image(s)`);
    if (skippedCount > 0) {
        console.log(`Skipped (already optimized): ${skippedCount} image(s)`);
    }
    
    if (!webpOnly) {
        const totalSaved = totalOriginalSize - totalNewSize;
        const totalPercent = totalOriginalSize > 0 ? ((totalSaved / totalOriginalSize) * 100).toFixed(1) : '0.0';
        console.log(`\nCompression:`);
        console.log(`  Original: ${formatSize(totalOriginalSize)}`);
        console.log(`  Compressed: ${formatSize(totalNewSize)}`);
        if (totalSaved > 0) {
            console.log(`  Saved: ${formatSize(totalSaved)} (${totalPercent}%)`);
        }
    }
    
    if (!compressOnly) {
        console.log(`\nWebP Files:`);
        console.log(`  Total size: ${formatSize(totalWebPSize)}`);
    }
    
    if (dryRun) {
        console.log('\n💡 Run without --dry-run to apply optimizations');
    } else {
        console.log('\n✅ Image optimization complete!');
        console.log('💡 Remember to update HTML files to use WebP with fallbacks.');
    }
}

// Parse command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    const webpOnly = args.includes('--webp-only');
    const compressOnly = args.includes('--compress-only');
    const dryRun = args.includes('--dry-run');
    
    optimizeImages(webpOnly, compressOnly, dryRun).catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { optimizeImages, compressImage, createWebP };

