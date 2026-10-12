const fs = require('fs');
const path = require('path');

// Create directories
const directories = [
  'backend',
  'backend/config',
  'backend/controllers',
  'backend/models',
  'backend/routes',
  'backend/services',
  'frontend'
];

// Create files
const files = [
  'backend/server.js',
  'backend/config/db.js',
  'frontend/index.html',
  'frontend/styles.css',
  'frontend/script.js'
];

// Create directories
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create files
files.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '');
    console.log(`Created file: ${file}`);
  }
});

console.log('Project scaffold created successfully!');