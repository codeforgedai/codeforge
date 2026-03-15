# Contributing Guide

Thanks for wanting to contribute!

We appreciate both small fixes and thoughtful larger changes.

## Two Paths to Get Your Pull Request Accepted

### Path 1: Small, Focused Changes (Fastest way to get merged)
- Pick **one** clear thing to fix/improve
- Touch the **smallest possible number of files**
- Make sure the change is very targeted and easy to review
- All automated checks pass
- No new lint/test failures

These almost always get merged quickly when they're clean.

### Path 2: Bigger or Impactful Changes
- **First** open a discussion or issue to describe what you're trying to solve
- Share rough ideas / approach
- Once there's rough agreement, build it
- In your PR include:
  - Before / After screenshots (or short video if UI/behavior change)
  - Clear description of what & why
  - Proof it works (manual testing notes)
  - All tests passing

PRs that follow this path are **much** more likely to be accepted, even when they're large.

## General Rules (both paths)
- Write clear commit messages
- Keep PR title + description meaningful
- One PR = one logical change
- Run tests locally first (`pnpm typecheck && pnpm test && pnpm build`)
- Be kind in discussions

## Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for the full development guide.

Questions? Just open an issue — we're happy to help.
