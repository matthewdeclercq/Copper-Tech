#!/usr/bin/env node
/**
 * Move industry pages to /industries/ folder and update paths
 */

const fs = require('fs');
const path = require('path');

const industryFiles = [
  'emergency-response.html',
  'homes.html',
  'job-sites.html',
  'military-defense.html',
  'remote-businesses.html'
];

const projectRoot = path.join(__dirname, '..');
const industriesDir = path.join(projectRoot, 'industries');

function updateIndustryPage(fileName) {
  const sourcePath = path.join(projectRoot, fileName);
  const targetPath = path.join(industriesDir, fileName);
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Skipping ${fileName} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // Update CSS path
  content = content.replace(/href="css\//g, 'href="../css/');
  
  // Update JS paths
  content = content.replace(/src="js\//g, 'src="../js/');
  
  // Update asset paths (but not in OG image URLs which should stay absolute)
  content = content.replace(/href="assets\//g, 'href="../assets/');
  content = content.replace(/src="assets\//g, 'src="../assets/');
  content = content.replace(/srcset="assets\//g, 'srcset="../assets/');
  
  // Update manifest.json path
  content = content.replace(/href="manifest\.json"/g, 'href="../manifest.json"');
  
  // Update canonical URLs
  content = content.replace(
    new RegExp(`href="https://coppertech\\.us/${fileName}"`, 'g'),
    `href="https://coppertech.us/industries/${fileName}"`
  );
  
  // Update og:url
  content = content.replace(
    new RegExp(`content="https://coppertech\\.us/${fileName}"`, 'g'),
    `content="https://coppertech.us/industries/${fileName}"`
  );
  
  // Write to new location
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`✅ Moved and updated ${fileName}`);
  
  // Remove original file
  fs.unlinkSync(sourcePath);
  console.log(`🗑️  Removed original ${fileName}`);
}

// Ensure industries directory exists
if (!fs.existsSync(industriesDir)) {
  fs.mkdirSync(industriesDir, { recursive: true });
}

console.log('Moving industry pages to /industries/...\n');

industryFiles.forEach(file => {
  try {
    updateIndustryPage(file);
    console.log('');
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('✅ Industry pages migration complete!');
