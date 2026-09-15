# noticer-io

Private-beta product surface for Noticer.

## Product contract

- First interaction: tell Noticer something that matters.
- Value before permission: Noticer explains what would need to be observed before asking for a connection.
- Glass House: Trackables and evidence states.
- Exactly five kernel operators: Claim, Required Outcome, Questioned Observation, Control Observation, Verdict/Receipt.
- Claimant never authors the verdict.
- `WAITING`/open is distinct from `INCONCLUSIVE`/proof stopped.
- Historical proof is never rendered as a current-state assertion after its freshness window expires.

## Current beta surface

This repository is intentionally self-contained and uses browser-local state for beta discovery ideas and feedback. It does **not** fake account connections or generate demo receipts.

The included Stripe → Access record is a saved representation of the real live proof completed 2026-09-15 at 12:47:26 UTC. It is labeled **SAVED PROOF**, not current `ESTABLISHED`, because the proof freshness window has expired.

## Run locally

```bash
python -m http.server 8080
```

Open `http://127.0.0.1:8080`.
