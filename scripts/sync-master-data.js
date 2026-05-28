const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sourceDir = path.join(__dirname, '..', '..', 'master_data');
const targetDir = path.join(__dirname, '..', 'public', 'master_data');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Read all JSON files from source if it exists
if (!fs.existsSync(sourceDir)) {
  console.log(`Source master_data directory not found at ${sourceDir}. Skipping sync as target files already exist in ${targetDir}.`);
  process.exit(0);
}

const versions = {};
const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const sourceFile = path.join(sourceDir, file);
  const targetFile = path.join(targetDir, file);

  let contentStr = fs.readFileSync(sourceFile, 'utf8');
  
  // Clean up 'export const ASSEMBLIES: Assembly[] =' if present
  let code = contentStr.replace(/export\s+const\s+[A-Za-z0-9_]+\s*(:\s*[A-Za-z0-9_\[\]<>]+)?\s*=\s*/g, '');
  code = code.replace(/;\s*$/, '');
  
  let parsed = null;
  try {
    parsed = JSON.parse(code);
  } catch (e) {
    // If it's invalid JSON (e.g. unquoted keys), evaluate it
    try {
      parsed = (new Function(`return (${code})`))();
    } catch (e2) {
      console.error(`Error parsing ${file}: ${e2.message}`);
      parsed = {};
    }
  }

  const validJsonStr = JSON.stringify(parsed, null, 2) || "{}";
  
  // Calculate MD5 hash
  const hash = crypto.createHash('md5').update(validJsonStr).digest('hex');
  versions[file] = hash;

  // Copy to public directory
  fs.writeFileSync(targetFile, validJsonStr);
  console.log(`Copied ${file} (v=${hash})`);
});

// Write versions.json
fs.writeFileSync(path.join(targetDir, 'versions.json'), JSON.stringify(versions, null, 2));
console.log('Successfully generated versions.json');
