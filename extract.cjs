const fs = require('fs');

const code = fs.readFileSync('src/pages/Chorsa999.jsx', 'utf8');

// Simple parser: find indices of "<Dialog" and "</Dialog>"
const dialogStarts = [];
const dialogEnds = [];

const regexStart = /<Dialog[\s\n>]/g;
let match;
while ((match = regexStart.exec(code)) !== null) {
    dialogStarts.push(match.index);
}

const regexEnd = /<\/Dialog>/g;
while ((match = regexEnd.exec(code)) !== null) {
    dialogEnds.push(match.index + '</Dialog>'.length);
}

// Ensure they match up sequentially (Assuming no nested Dialogs!)
if (dialogStarts.length === dialogEnds.length) {
    for (let i = 0; i < dialogStarts.length; i++) {
        const dialogStr = code.substring(dialogStarts[i], dialogEnds[i]);
        fs.writeFileSync(`dialog_${i}.jsx`, dialogStr);
        console.log(`Saved dialog_${i}.jsx, length: ${dialogStr.length}`);
    }
} else {
    console.log(`Mismatch: ${dialogStarts.length} starts, ${dialogEnds.length} ends`);
}
