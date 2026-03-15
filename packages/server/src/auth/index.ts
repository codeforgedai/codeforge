export function createAuth(db: any) {
  return {
    handler: (req: any, res: any, next: any) => next(),
  };
}
