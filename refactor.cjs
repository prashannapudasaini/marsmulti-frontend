const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const configDir = path.join(srcDir, 'config');
const apiConfigFile = path.join(configDir, 'api.js');

// Create config directory if it doesn't exist
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// Create api.js
const apiConfigContent = `const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";\n\nexport default API_BASE_URL;\n`;
fs.writeFileSync(apiConfigFile, apiConfigContent);

let filesModified = 0;
let urlsReplaced = 0;
const modifiedFilesList = [];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasLocalhost = content.includes('http://localhost:8000') || content.includes('http://127.0.0.1:8000');
    
    if (hasLocalhost) {
        let originalContent = content;
        
        // Count occurrences
        const matches = content.match(/http:\/\/(localhost|127\.0\.0\.1):8000/g);
        if (matches) {
            urlsReplaced += matches.length;
        }

        // Add import statement if it's not already there
        if (!content.includes('import API_BASE_URL')) {
            content = `import API_BASE_URL from "@/config/api";\n` + content;
        }

        // Replace literal string concatenations
        content = content.replace(/"http:\/\/(localhost|127\.0\.0\.1):8000(.*?)"/g, '`${API_BASE_URL}$2`');
        content = content.replace(/'http:\/\/(localhost|127\.0\.0\.1):8000(.*?)'/g, '`${API_BASE_URL}$2`');
        
        // Replace inside existing template literals
        content = content.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/g, '${API_BASE_URL}');
        
        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            filesModified++;
            modifiedFilesList.push(file.replace(__dirname, ''));
        }
    }
});

console.log("Refactor Report:");
console.log(`Files modified: ${filesModified}`);
console.log(`URLs replaced: ${urlsReplaced}`);
console.log("Modified files:");
modifiedFilesList.forEach(f => console.log(` - ${f}`));
