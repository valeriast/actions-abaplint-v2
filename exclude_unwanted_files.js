// const fs = require('fs');

// fs.readFile(`abaplint.json`, 'utf8', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
  
//   try {  
//     const config = JSON.parse(data);
    
//     config.global.exclude = filesToExclude; 
//     const modifiedConfig = JSON.stringify(config, null, 2);
//     fs.writeFile('abaplint.json', modifiedConfig, 'utf8', (err) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       console.log('abaplint.json has been updated with the "exclude" property.');
//     });
//   } catch (parseError) {
//     console.error('Error parsing abaplint.json:', parseError);
//   }
// });

const { execSync } = require('child_process');

async function run() {
    try {
   
        execSync('git ls-files > all_files.txt');
        execSync('grep -Fvxf pull_request_files.txt all_files.txt > non_pull_request_files.txt');

        execSync('sed -e \'s/^/"/\' -e \'s/$/"/\' -e \'$!s/$/,/\' non_pull_request_files.txt > abaplint_exclude.txt');
        execSync("sed -i -e '1i \"exclude\": [\n' abaplint_exclude.txt");
        execSync('sed -i -e "$ a ]," abaplint_exclude.txt');

        execSync('perl -pe \'s#\"exclude\": \\[\\],#`cat abaplint_exclude.txt`#ge\' -i abaplint.json');

        execSync('abaplint -f total --outformat json --outfile /result.json');

    }
    catch (err) {
        console.log(err)
        core.setFailed('General error');
    }
}

run();
