#!/usr/bin/env node
/*
  tools/export-with-runner.js
  - Reads `exports/sample-runner/questions.json` (or provided path)
  - For each question of type coderunner, runs `node ../lib/runner/run-test.js` to compute got values
  - Updates testcases[*].got and writes `exports/coderunner-with-got.xml` using lib/moodleXml.js

  Usage:
    node tools/export-with-runner.js --in exports/sample-runner/questions.json --out exports/coderunner-with-got.xml
*/

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runNodeScript(scriptPath, args=[]) {
  const res = spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8', maxBuffer: 10*1024*1024 });
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function usageAndExit() {
  console.error('Usage: node tools/export-with-runner.js --in <questions.json> --out <file.xml>');
  process.exit(2);
}

function parseArgs() {
  const argv = require('minimist')(process.argv.slice(2));
  if (!argv.in || !argv.out) usageAndExit();
  return { inPath: argv.in, outPath: argv.out };
}

async function main() {
  const { inPath, outPath } = parseArgs();
  const absIn = path.resolve(inPath);
  const absOut = path.resolve(outPath);
  if (!fs.existsSync(absIn)) {
    console.error('Input file not found:', absIn);
    process.exit(3);
  }

  const raw = fs.readFileSync(absIn, 'utf8');
  const questions = JSON.parse(raw);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.type !== 'coderunner') continue;
    const tmpDir = path.join(process.cwd(), 'exports', 'sample-runner');
    // prepare template and cases files
    const templateFile = path.join(tmpDir, `q${i+1}-template.txt`);
    const casesFile = path.join(tmpDir, `q${i+1}-cases.json`);
    fs.writeFileSync(templateFile, q.template || q.answer || '', 'utf8');
    const cases = (q.testcases || []).map(tc => ({ input: tc.input || tc.stdin || tc.args || '', expected: tc.expected || tc.expectedOutput || '' }));
    fs.writeFileSync(casesFile, JSON.stringify(cases, null, 2), 'utf8');

    console.log(`Running runner for question ${i+1} (${q.language || 'java'})...`);
    const runnerScript = path.join(__dirname, '..', 'lib', 'runner', 'run-test.js');
    const args = ['--lang', q.language || 'java', '--file', templateFile, '--cases', casesFile];
    const r = runNodeScript(runnerScript, args);
    if (r.status !== 0) {
      console.error('Runner failed:', r.stderr || r.stdout);
      process.exit(4);
    }
    let res;
    try {
      res = JSON.parse(r.stdout);
    } catch (e) {
      console.error('Could not parse runner JSON output:', e.message);
      console.error('Runner stdout:', r.stdout);
      process.exit(5);
    }

    // attach got values back into question.testcases
    for (let j = 0; j < (q.testcases || []).length; j++) {
      q.testcases[j].got = res[j] ? res[j].got : '';
    }
  }

  // now import buildMoodleXml and write XML
  const modPath = path.join(process.cwd(), 'lib', 'moodleXml.js');
  const buildPath = pathToFileURL(modPath).href;
  const { buildMoodleXml } = await import(buildPath);
  const xml = buildMoodleXml(questions);
  fs.writeFileSync(absOut, xml, 'utf8');
  console.log('Wrote', absOut);
}

function pathToFileURL(p) {
  const { pathToFileURL } = require('url');
  return pathToFileURL(p);
}

main().catch(err => { console.error(err); process.exit(99); });
