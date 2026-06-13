const fs=require('fs');
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist',{recursive:true});
fs.copyFileSync('index.html','dist/index.html');
console.log('AURA OS V20 Universe + Google Connector build complete');
