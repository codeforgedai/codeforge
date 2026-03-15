import type { Response, NextFunction } from 'ultimate-express';
import type { OrgScopedRequest } from './org-scope.js';

export function requirePermission(permission: string) {
  return (req: OrgScopedRequest, res: Response, next: NextFunction) => {
    next();
  };
}
