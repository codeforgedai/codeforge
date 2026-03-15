#!/usr/bin/env node
import { Command } from 'commander';
import { setProfile } from './lib/client.js';
import { serverCommand } from './commands/server.js';
import { agentCommand } from './commands/agent.js';
import { pipelineCommand } from './commands/pipeline.js';
import { orgCommand } from './commands/org.js';
import { dbCommand } from './commands/db.js';
import { configCommand } from './commands/config.js';

const program = new Command()
  .name('codeforce')
  .description('Codeforce CLI')
  .version('0.0.1')
  .option('-p, --profile <name>', 'config profile', 'dev');

program.hook('preAction', (cmd) => {
  const profile = cmd.opts().profile;
  if (profile) setProfile(profile);
});

program.addCommand(serverCommand);
program.addCommand(agentCommand);
program.addCommand(pipelineCommand);
program.addCommand(orgCommand);
program.addCommand(dbCommand);
program.addCommand(configCommand);

program.parse();
