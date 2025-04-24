var fs = require('fs-extra');
var path = require('path');

async function copyFiles() {
    try {
        const destCompanyDir = path.join(__dirname, 'dist/company');
        
        // Ensure dist/company directory exists
        await fs.ensureDir(destCompanyDir);
        // await fs.copy(path.join(__dirname, 'views'), path.join(__dirname, 'dist/views'));
        await fs.copy(path.join(__dirname, 'package.json'), path.join(__dirname, 'dist/package.json'));
        await fs.copy(path.join(__dirname, './src/company/ism.json'), path.join(destCompanyDir, 'ism.json'));
        console.log('Templates and package.json copied successfully!');
    } catch (err) {
        console.error('Error copying files:', err);
    }
}

copyFiles();