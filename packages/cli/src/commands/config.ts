import { Command } from 'commander';
import { setProfile, getProfile } from '../lib/client.js';

export const configCommand = new Command('config')
  .description('Manage CLI configuration');

configCommand
  .command('use <profile>')
  .description('Switch to a config profile')
  .action((profile) => {
    setProfile(profile);
    console.log(`Switched to profile: ${profile}`);
  });

configCommand
  .command('show')
  .description('Show current config')
  .action(() => {
    const profile = getProfile();
    console.log(JSON.stringify(profile, null, 2));
  });
