const fs = require('fs');
let html = fs.readFileSync('d:/kbs-system/packer.html', 'utf8');

html = html.replace(/\/\/ 7\. Orders List Logic \(Tab 3\)[\s\S]*?renderPackerOrders\(e\.target\.value\);\s*\}\);/, '');

fs.writeFileSync('d:/kbs-system/packer.html', html, 'utf8');
console.log('Removed tab 3 logic');
