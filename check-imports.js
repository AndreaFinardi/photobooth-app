const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/components/Library/UserLibrary.jsx',
  'src/components/Layout.jsx',
  'src/App.js'
];

filesToCheck.forEach(file => {
  console.log(`\n📄 Controllo: ${file}`);
  const content = fs.readFileSync(file, 'utf8');
  
  // Cerca import di auth
  const authImports = content.match(/from ['"][^'"]*auth['"]/g);
  if (authImports) {
    console.log('✅ Import auth trovati:', authImports);
  } else {
    console.log('ℹ️  Nessun import auth in questo file');
  }
  
  // Cerca percorsi relativi sbagliati
  const badImports = content.match(/from ['"]\.\.\/[^'"]*['"]/g);
  if (badImports) {
    console.log('⚠️  Possibili percorsi sbagliati:', badImports);
  }
});