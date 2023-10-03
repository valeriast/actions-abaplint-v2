const fs = require('fs');

fs.readFile(`abaplint.json`, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  try {  
    const config = JSON.parse(data);
    const allfiles = process.env.ALLFILES
    .split(/\r?\n/)
    .map(fileName => `"${fileName}"`);
    const filesToExclude = allfiles.filter(file => !process.env.CHANGEDFILES.includes(file));
    console.log(filesToExclude)

    config.global.exclude = filesToExclude; 
    const modifiedConfig = JSON.stringify(config, null, 2);
    fs.writeFile('abaplint.json', modifiedConfig, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('abaplint.json has been updated with the "exclude" property.');
    });
  } catch (parseError) {
    console.error('Error parsing abaplint.json:', parseError);
  }
});