// Importing required packages
const { execSync } = require('child_process');
const { Octokit } = require("@octokit/rest");
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        // Creating new Octokit instance
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
            baseUrl: process.env.GITHUB_API_URL
        });

        // Getting the current context
        const context = github.context;
        const repo = context.repo.repo;
        const owner = context.repo.owner;
        const issue_number = (context.issue.number || context.payload.pull_request.number);

        // Getting the details of the last commit 
        const { data } = await octokit.repos.getCommit({
            owner,
            repo,
            ref: process.env.GITHUB_SHA
        });

        for (var file of data.files) {
            execSync(`echo ${file} >> pull_request_files.txt`);
        }

        execSync('git ls-files > all_files.txt');
        execSync('grep -Fvxf pull_request_files.txt all_files.txt > non_pull_request_files.txt');

        execSync('sed -e \'s/^/"/\' -e \'s/$/"/\' -e \'$!s/$/,/\' non_pull_request_files.txt > abaplint_exclude.txt');
        execSync("sed -i -e '1i \"exclude\": [\n' abaplint_exclude.txt");
        execSync('sed -i -e "$ a ]," abaplint_exclude.txt');

        execSync('perl -pe \'s#\"exclude\": \\[\\],#`cat abaplint_exclude.txt`#ge\' -i abaplint.json');

        execSync('abaplint -f total --outformat json --outfile /result.json');

    }
    catch (err) {
        // Handling any other unknown errors
        console.log(err)
        core.setFailed('General error');
    }
}

// Run the script
run();
