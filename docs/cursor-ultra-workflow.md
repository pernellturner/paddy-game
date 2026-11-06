# Cursor Ultra + ChatGPT workflow for Paddy

This document proposes a low-risk way to use Cursor's cloud agents and ChatGPT with the existing GitHub repository. It does **not** connect a Cursor account or start paid agents.

## One-time setup (works from an iPhone)
1. Open https://cursor.com/dashboard/integrations in a browser, sign in, and connect GitHub if it is not connected already.
2. Select the `pernellturner/paddy-game` repository for Cursor's GitHub access.
3. Open https://cursor.com/agents (or the Cursor iOS app), choose `paddy-game`, and configure the agent's environment.
4. Set a conservative spending limit in Cursor before starting agents. Cloud agents consume the plan's usage.
5. After the owner reviews and merges the accompanying rule file, new agents working from `main` will pick up the shared project rules.

## Suggested five-agent split
1. **Studio / integration:** Owns acceptance criteria, reviews PRs, merges only after owner approval; avoids simultaneous modification of feature code.
2. **Paddy movement & combat:** Owns tightly scoped controller/combat fixes. Starts by reading `controls.js`, `kitti47.js`, `kitti48.js`, and tests.
3. **Silverdale Level 1:** Owns scenery, geometry, collision and progression within `levels/silverdale_*.json`; coordinates before editing `level.js`.
4. **Enemies:** Owns enemy movement, attacks, hit reactions and KO behaviour without redesigning Paddy's art.
5. **QA:** Runs practice and Level 1 Playwright tests, checks iPhone landscape touch and screenshots; raises regression tickets rather than changing unrelated code.

Each task gets one branch, one agent and one PR. Never allow overlapping tasks to modify the same file at once. The owner approves final results.

## First safe pilot task
Ask one Cloud Agent:

> Read `README.md`, `docs/sprite-handover.md`, `level.js`, `controls.js`, and the existing tests. Do not change any code or assets. Report: (1) what is implemented in Silverdale Level 1, (2) which existing tests can run, (3) any broken controls or visual issues you can actually reproduce, and (4) a prioritized list of 5 small fixes. Use iPhone landscape 844x390 and keyboard checks where possible. Attach screenshots/logs and create a draft PR only if there are actual proposed changes. Do not merge.

## Verification and costs
- For local review, a simple static server is `python3 -m http.server 8765`; the tests use Python Playwright and require browser dependencies.
- Only run tests that the environment supports; don't claim success when dependencies or a browser are unavailable.
- Start with one agent and one task. Parallel agents share the same account's usage pool and can spend it quickly.
- ChatGPT's GitHub connector can inspect this repo, review changes and help prepare issues and PRs. It is **not** a direct Cursor login and cannot view Cursor's billing or launch its cloud agents here.
