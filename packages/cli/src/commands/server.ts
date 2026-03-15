import { Command } from 'commander';

export const serverCommand = new Command('server')
  .description('Manage the Codeforce server');

serverCommand
  .command('start')
  .description('Start the Codeforce server')
  .option('--port <port>', 'port to listen on', '3100')
  .action(async (opts) => {
    console.log(`Starting server on port ${opts.port}...`);
    console.log('Use "pnpm --filter @codeforce/server dev" to start in dev mode');
  });
