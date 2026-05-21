const fs = require('fs');
const path = require('path');

function listDir(dir, indent) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries.slice(0, 20)) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        console.log(indent + e.name + '/');
        listDir(full, indent + '  ');
      } else {
        console.log(indent + e.name);
      }
    }
  } catch(err) {
    console.log(indent + 'ERROR: ' + err.message);
  }
}

console.log('build exists:', fs.existsSync('build'));
if (fs.existsSync('build')) listDir('build', '');
