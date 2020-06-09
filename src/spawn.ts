import { spawn } from 'child_process';

function getLines(data: string) {
  return data
    .toString()
    .replace(/^\s*\n/, '')
    .replace(/\n\s*$/, '')
    .split(/\r?\n/);
}

function run(command: string, opts?: object) {
  let file;
  let args;

  if (process.platform === 'win32') {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
    opts = { ...opts, windowsVerbatimArguments: true };
  } else {
    file = '/bin/sh';
    args = ['-c', command];
  }
  return spawn(file, args, opts);
}

function runCmd(command: string, opts?: object) {
  const proc = run(command, opts);

  proc.stdout.on('data', data => {
    getLines(data).forEach(line => {
      console.log(line);
    });
  });
  proc.stderr.on('data', data => {
    getLines(data).forEach(line => {
      process.stderr.write(`${line}\n`);
    });
  });
  proc.on('error', err => {
    console.error(err);
  });
  proc.on('exit', () => {
    // console.log('Successfully completed');
  });
}

export { run, runCmd };
