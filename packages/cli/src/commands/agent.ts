import { Command } from 'commander';
import { apiRequest } from '../lib/client.js';

export const agentCommand = new Command('agent')
  .description('Manage agents');

agentCommand
  .command('list')
  .description('List agents')
  .requiredOption('--org <orgId>', 'organization ID')
  .action(async (opts) => {
    const agents = await apiRequest(`/agents?orgId=${opts.org}`);
    console.log(JSON.stringify(agents, null, 2));
  });

agentCommand
  .command('create')
  .description('Create an agent')
  .requiredOption('--org <orgId>', 'organization ID')
  .requiredOption('--name <name>', 'agent name')
  .requiredOption('--shortname <shortname>', 'agent shortname')
  .requiredOption('--role <role>', 'agent role')
  .option('--model <model>', 'model to use', 'claude-sonnet-4-5')
  .action(async (opts) => {
    const agent = await apiRequest('/agents', {
      method: 'POST',
      body: JSON.stringify({
        orgId: opts.org,
        name: opts.name,
        shortname: opts.shortname,
        role: opts.role,
        model: opts.model,
      }),
    });
    console.log(JSON.stringify(agent, null, 2));
  });

agentCommand
  .command('status <id>')
  .description('Get agent status')
  .action(async (id) => {
    const agent = await apiRequest(`/agents/${id}`);
    console.log(JSON.stringify(agent, null, 2));
  });
