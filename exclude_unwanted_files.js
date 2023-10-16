// const { execSync } = require('child_process');

// async function run() {
//     try {

//         execSync(`echo ${process.env.CHANGEDFILES} > pull_request_files.txt`)
//         execSync('git ls-files > all_files.txt');
//         execSync('grep -Fvxf pull_request_files.txt all_files.txt > non_pull_request_files.txt');

//         execSync('sed -e \'s/^/"/\' -e \'s/$/"/\' -e \'$!s/$/,/\' non_pull_request_files.txt > abaplint_exclude.txt');
//         execSync("sed -i -e '1i \"exclude\": [\n' abaplint_exclude.txt");
//         execSync('sed -i -e "$ a ]," abaplint_exclude.txt');

//         execSync('perl -pe \'s#\"exclude\": \\[\\],#`cat abaplint_exclude.txt`#ge\' -i abaplint.json');

//         execSync('abaplint -f total --outformat json --outfile /result.json');

//     }
//     catch (err) {
//         console.log(err)
//         core.setFailed('General error');
//     }
// }

// run();


const fs = require('fs');

const files = 'src/test/file1.clas.abap src/file2.ddls.asddls src/file3.srfr.xml src/test2/file4.clas.testclasses.abap'
acceptedfileextensions = /((clas.abap)|(ddls.asddls)|(clas.testclasses.abap))/;
const filesArray = files.split(' ');


const filteredfilesbyextension = filesArray.filter( item => acceptedfileextensions.test(item) );
const fileswithfixedpath = filteredfilesbyextension.map( item => {
    return '/' + item
})

const transformedFiles = `{${fileswithfixedpath.join(',')}}` ;

fs.readFile(`abaplint.json`, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data)
  try {  
    const config = JSON.parse(data);
    config.global.files = transformedFiles; 
    const modifiedConfig = JSON.stringify(config, null, 2);
    fs.writeFile('abaplint.json', modifiedConfig, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('abaplint.json has been updated with the "files" property.');
    });
  } catch (parseError) {
    console.error('Error parsing abaplint.json:', parseError);
  }
});

