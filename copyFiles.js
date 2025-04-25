var fs = require('fs-extra');
var path = require('path');

async function copyFiles() {
    try {
        const destCompanyDir = path.join(__dirname, 'dist/company');
        
        // Ensure dist/company directory exists
        await fs.ensureDir(destCompanyDir);
        await fs.copy(path.join(__dirname, 'public'), path.join(__dirname, 'dist/public'));
        await fs.copy(path.join(__dirname, 'package.json'), path.join(__dirname, 'dist/package.json'));
        console.log('Templates and package.json copied successfully!');
    } catch (err) {
        console.error('Error copying files:', err);
    }
}

copyFiles();