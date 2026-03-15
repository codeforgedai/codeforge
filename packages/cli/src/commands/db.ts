import { Command } from 'commander';

export const dbCommand = new Command('db')
  .description('Database management');

dbCommand
  .command('migrate')
  .description('Run database migrations')
  .action(async () => {
    console.log('Running migrations...');
    console.log('Use "pnpm db:migrate" from the project root');
  });

dbCommand
  .command('seed')
  .description('Seed the database with sample data')
  .action(async () => {
    console.log('Seeding database...');
    console.log('Use "pnpm db:seed" from the project root');
  });
