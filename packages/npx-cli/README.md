# stateguard (npx CLI)

Zero-install static trace auditor and security scanner for LLM reasoning states.

## Usage

Scan execution trajectories and agent logs for leaked credentials, prompt injections, and unredacted reasoning envelopes:

```bash
npx stateguard scan ./agent_logs
```

Generate GitHub Actions SARIF reports for automated CI/CD blocking:

```bash
npx stateguard scan ./runs --sarif output.sarif --fail-on-error
```

Batch re-sign legacy logs:

```bash
npx stateguard migrate --input ./legacy_logs --output ./sanitized_logs
```

For full documentation, visit [stateguard.io](https://stateguard.io).
