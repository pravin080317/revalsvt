# Security Evidence Pack - 2026-03-24

## Purpose

This pack is a copy-ready artifact for release notes, CAB review, and security sign-off.

## Scope of this change

- UI link-safety hardening for data-driven URLs in Sale Details.
- Regression tests for unsafe URL schemes.
- Security documentation updates for pen-test traceability.

## Code changes (evidence)

1. URL sanitization utility added:
- `DetailsListVOA/components/SaleDetailsShell/utils.ts`
- Added `sanitizeExternalUrl(...)`.
- Enforces:
  - allow: `http://`, `https://`
  - block: `javascript:`, `data:`, `ftp:`, protocol-relative `//...`
  - rooted relative URLs allowed only with explicit trusted base URL.

2. View-model URL flow hardened:
- `DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts`
- SharePoint/reference URL normalization now uses `sanitizeExternalUrl(...)`.

3. Render-time defense in depth:
- `DetailsListVOA/components/SaleDetailsShell/shared/ExternalLinkCard.tsx`
- Sanitizes before setting `href`.

## Test evidence

1. New test suite:
- `DetailsListVOA/tests/external-url-safety.test.ts`
- Cases:
  - accepts `http/https`
  - blocks `javascript/data/ftp`
  - blocks protocol-relative `//...`
  - resolves rooted relative URLs only when explicitly allowed with base
  - blocks bare unknown URL values

2. Existing gate retained:
- `DetailsListVOA/tests/security-review-gate.test.ts`
- Verifies anti-XSS coding constraints and sanitizer presence in Grid.

3. Command executed:

```bash
npx jest DetailsListVOA/tests/external-url-safety.test.ts DetailsListVOA/tests/security-review-gate.test.ts --no-coverage
```

4. Result:
- Test Suites: `2 passed, 2 total`
- Tests: `17 passed, 17 total`

## Security risk statement

- Prior risk: backend-driven links could potentially carry unsafe URL schemes.
- Mitigation now implemented: centralized URL sanitization plus render-time safety check.
- Residual risk: server-side authorization/data integrity still required and remains out of UI-only scope.

## Pen-test traceability

Primary analysis doc:
- `docs/ui-pen-test-analysis-2026-03-24.md`

Review baseline doc:
- `docs/security-review-readme.md`

## Release notes snippet (copy/paste)

```md
### Security
- Hardened Sale Details external-link handling to block unsafe URL schemes from data-driven content.
- Added centralized URL sanitizer and render-time defense-in-depth for external hyperlinks.
- Added regression tests for URL safety (`external-url-safety.test.ts`) and validated alongside existing security gate.

### Security Validation
- Command: `npx jest DetailsListVOA/tests/external-url-safety.test.ts DetailsListVOA/tests/security-review-gate.test.ts --no-coverage`
- Result: `2 passed, 17/17 tests passed`
```

## Showcase bullets (for demo/review)

- Security-by-contract: static gate blocks risky DOM/script APIs.
- Security-by-design: centralized URL sanitization for all data-driven external links.
- Security-by-regression: dedicated test suite for scheme-level URL abuse cases.
- Security-by-evidence: explicit documentation and reproducible command output.
