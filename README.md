# Fabrica

**Auto-generated eval sets from production logs** — mine logs, dedupe near-duplicates, cluster
by intent, and sample into a growing eval set with no manual labeling.

> **Result:** **30 raw logs → 18 eval cases** across **6 intents** with **100% intent
> coverage** and a **20% dedupe rate** (6 near-duplicates removed). The eval set grows by
> sampling what production already saw, not by hand-writing labels.

---

## Result

| Metric | Value |
|---|---|
| Raw logs | 30 |
| Near-duplicates removed | 6 (20% dedupe rate) |
| Unique after dedupe | 24 |
| Intents covered | 6 / 6 (100%) |
| Eval set size | 18 (6 intents × 3 samples) |

The six duplicates are the "base + one extra word" cases (`"cuál es mi saldo"` vs `"cuál es mi
saldo hoy"`) caught by token-Jaccard similarity at threshold 0.8. The eval set is the sample
of 3 per intent from the deduped logs.

---

## Architecture

```
lib/fabrica/                # canonical core (TypeScript, tested)
  similarity.ts             #   tokenize · jaccard · dedupe (greedy, order-preserving)
  generate.ts               #   dedupe → cluster by intent → sample
  benchmark.ts              #   dedupe rate · coverage · eval-set size
  demo.ts                   #   wires logs into every number
  data/                     #   logs.json (committed production logs)
  fixtures/                 #   generator.json (pinned metrics + sampled ids)
backend/                    # same math in Python + pytest (authoritative)
  src/fabrica/              #   similarity.py · generate.py · benchmark.py
  tests/                    #   pinned to tests/fixtures/{logs,generator}.json
app/                        # Next.js landing + demo dashboard (Vercel, demo mode)
```

Dedupe is real token-set Jaccard; clustering uses the committed intent label (a documented
proxy for a real intent classifier). Both languages reproduce the pinned metrics and the exact
sampled id list.

## Design decisions & tradeoffs

1. **Greedy, order-preserving dedupe.** A log is kept only if it is not similar to any
   *previously kept* log. Deterministic and cheap (O(n²) over a bounded set); the tradeoff is
   that a duplicate near the head of the list is the "survivor", which is a reasonable bias for
   a first-seen canonical form.
2. **Jaccard over tokens, not embeddings.** Embeddings catch paraphrases but need a model; token
   Jaccard catches the common near-duplicate (repeated query, small edit) deterministically.
   Production would add an embedding pass for paraphrase-level dedupe.
3. **Clustering is committed labels.** The demo separates "dedupe" (real math) from "intent"
   (a committed label standing in for a classifier), so the coverage metric is honest about what
   is computed vs. what is provided.

## What did not work

- **Token Jaccard misses paraphrase duplicates.** `"cómo pago mi factura"` and `"pagar la cuota"`
   are the same intent with zero token overlap; Jaccard cannot catch that. The demo's threshold
   deliberately trades recall for no-false-positives on the synthetic set.
- **Sampling is uniform, not representative.** Real eval-set mining should oversample rare or
   high-risk intents; the demo samples uniformly to keep the coverage number clean.

## Run it

```bash
# frontend demo + TS tests
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 7 vitest tests

# backend (authoritative math) — Python 3.12+
cd backend && uv sync --extra dev && uv run pytest   # 3 tests, pinned fixtures
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.13 · pytest
