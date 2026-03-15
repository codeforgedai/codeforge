import { Router } from 'ultimate-express';

export function githubRouter(db: any) {
  const router = Router();

  router.post('/install', async (req: any, res: any) => {
    const { installationId, orgId } = req.body;
    if (!installationId || !orgId) {
      return res.status(400).json({ error: 'installationId and orgId required' });
    }

    // In production, store installation_id in github_installations table
    // For now, acknowledge the installation
    void db;
    res.status(201).json({
      installationId,
      orgId,
      status: 'installed',
    });
  });

  router.get('/repos', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }

    // In production: get token via token-manager, call GitHub API
    void db;
    res.json({ repos: [], message: 'GitHub App not configured' });
  });

  return router;
}
