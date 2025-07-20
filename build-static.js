
const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy HTML, CSS, and JS files
fs.copyFileSync('index.html', 'dist/index.html');
fs.copyFileSync('style.css', 'dist/style.css');
fs.copyFileSync('script.js', 'dist/script.js');

console.log('Static build completed! Files copied to dist/ directory');
console.log('Ready for GitHub Pages deployment');
