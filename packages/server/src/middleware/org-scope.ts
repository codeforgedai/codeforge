import type { Request, Response, NextFunction } from 'ultimate-express';

export interface OrgScopedRequest extends Request {
  orgId?: string;
  userId?: string;
  principalType?: 'user' | 'agent';
}

export function orgScopeMiddleware(req: OrgScopedRequest, res: Response, next: NextFunction) {
  const orgId = req.headers['x-org-id'] as string;
  if (!orgId) {
    return res.status(400).json({ error: 'Missing x-org-id header' });
  }
  req.orgId = orgId;
  next();
}
