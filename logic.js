const childProcess = require("child_process");
const fs = require('fs');
const octokit = require('@octokit/rest')({
    baseUrl: process.env.GITHUB_API_URL,
});

function buildAnnotations() {
  const val = fs.readFileSync("/result.json", "utf-8");
  console.dir(val);
  const issues = JSON.parse(val);
  const annotations = []

  for(let issue of issues) {
      annotations.push({
        path: issue.file.substring(2),
        start_line: issue.start.row,
        end_line: issue.end.row,
        title: issue.description,
        annotation_level: "failure",
        message: issue.key});
    if (annotations.length === 500) {
      break; // only 1000 errors appear, but im limiting to 500 to not exceed api calls see https://docs.github.com/en/rest/checks/runs?apiVersion=2022-11-28
    }
  }
  return annotations;
}

function buildSummary() {
  const actual = childProcess.execSync(`abaplint --version`).toString();

  return annotations.length + " issues found "+ "\n\n" +
    "Issues limit 500." + "\n\n" +
    "Installed @abaplint/cli@" + process.env.INPUT_VERSION + "\n\n" +
    "Actual " + actual + "\n\n" +
    "For additional features, faster feedback, and support use [abaplint.app](https://abaplint.app)";
}

function findJobIdByWorkflowName(data, workflowName) {
  const jobs = data.jobs;
  for (const job of jobs) {
    if (job.workflow_name === workflowName) {
      return job.id;
    }
  }
  return null;
}

async function run() {
  const batchSize = 50; // Github actions limits 50 annotations per API call
  let annotations = buildAnnotations();
  const summary = buildSummary();

  octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN,
  });

  const repo = process.env.GITHUB_REPOSITORY.split("/");
  checkrunid = findJobIdByWorkflowName(process.env.GITHUB_CHECK_RUN_ID, 'Abaplint');
  
  for(let i = 0; i < annotations.length; i += batchSize) {    
      const batch = annotations.slice(i, i + batchSize)
      const update = await octokit.checks.update({
      owner: repo[0],
      repo: repo[1],
      check_run_id: checkrunid, 
      status: statusCheck, 
      conclusion: annotations.length === 0 ? "success" : "failure",
      output: {
        title: annotations.length + " issues found.",
        summary: summary,
        annotations: batch,
      }});
      annotations = []
      annotationCount = 0
  }
}
  
run().then(text => {
  process.exit();
}).catch(err => {
  console.dir(err);
  process.exit(1);
});
