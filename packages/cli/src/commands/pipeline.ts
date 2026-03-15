import { Command } from 'commander';
import { apiRequest } from '../lib/client.js';

export const pipelineCommand = new Command('pipeline')
  .description('Manage pipelines');

pipelineCommand
  .command('run')
  .description('Trigger a pipeline run')
  .requiredOption('--org <orgId>', 'organization ID')
  .requiredOption('--pipeline <pipelineId>', 'pipeline ID')
  .action(async (opts) => {
    const result = await apiRequest('/pipelines/trigger', {
      method: 'POST',
      body: JSON.stringify({ orgId: opts.org, pipelineId: opts.pipeline }),
    });
    console.log(JSON.stringify(result, null, 2));
  });

pipelineCommand
  .command('status <runId>')
  .description('Get pipeline run status')
  .action(async (runId) => {
    const result = await apiRequest(`/pipelines/runs/${runId}`);
    console.log(JSON.stringify(result, null, 2));
  });
