import { Command } from 'commander';
import { apiRequest } from '../lib/client.js';

export const orgCommand = new Command('org')
  .description('Manage organizations');

orgCommand
  .command('list')
  .description('List organizations')
  .action(async () => {
    const orgs = await apiRequest('/orgs');
    console.log(JSON.stringify(orgs, null, 2));
  });

orgCommand
  .command('create')
  .description('Create an organization')
  .requiredOption('--name <name>', 'organization name')
  .action(async (opts) => {
    const org = await apiRequest('/orgs', {
      method: 'POST',
      body: JSON.stringify({ name: opts.name }),
    });
    console.log(JSON.stringify(org, null, 2));
  });
