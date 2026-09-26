# PR log

One row per merged PR. This is the short audit trail: RUBRIC wants proof you can click on,
and a list of "step → what proves it" is faster to read than searching every PR body.

The long form (full command output, exit codes, test counts) lives in `docs/evidence/verify/`,
one file per PR, named `<date>-<short-sha>.md` (made by `pnpm verify`).

| PR | Step | One line: what it proves | Verify report |
|----|------|---------------------------|----------------|
| #2 | 02 — scope guard | Blocked a write to `../../README.md`; `.agent-log` shows the proposed-but-not-executed line | `verify/2026-09-27-a1b2c3d.md` |
| TBD | 02 — context and scope guard · `feat/02-context-and-scope-guard` · 2026-09-26 | Write tool blocked out-of-scope path; `.env` Read denied at permission layer; both captured with `pnpm agent:log` | [`scope-guard-blocked.md`](scope-guard-blocked.md) |
