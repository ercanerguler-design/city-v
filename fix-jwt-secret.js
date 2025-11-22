const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    content = content.replace(/'cityv-business-secret-2024'/g, "'cityv-business-secret-key-2024'");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error in ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let updated = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      updated += walkDir(filePath);
    } else if (file.endsWith('.ts')) {
      if (replaceInFile(filePath)) updated++;
    }
  });
  
  return updated;
}

console.log('🔧 JWT_SECRET güncelleniyor...\n');
const updated = walkDir('app/api/business');
console.log(`\n✅ ${updated} dosya güncellendi!`);
