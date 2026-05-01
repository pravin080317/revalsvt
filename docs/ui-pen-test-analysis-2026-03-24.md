# UI Pen Test Analysis - SVT PCF (2026-03-24)

## Purpose

This document captures the penetration-testing view of the SVT PCF UI, the code-level controls currently in place, new hardening added on 2026-03-24, and test evidence that can be showcased during security reviews.

## Executive Summary

- Overall UI posture: **Good baseline with targeted hardening added**.
- High-risk DOM XSS sinks are guarded by existing security gate checks.
- Input sanitization for key search fields is present and tested.
- New hardening now blocks unsafe URL schemes from backend-driven links before rendering.

## What We Reviewed

- Grid and filter input sanitization paths.
- Sale details external link rendering paths.
- SharePoint-driven reference image/link mapping.
- Local storage persistence behavior for filters/prefilters.
- Existing security gate tests and runtime logging behavior.

## Current Code Controls (What Exists in Code)

1. Static security gate contract test:
   - `DetailsListVOA/tests/security-review-gate.test.ts`
   - Enforces no `dangerouslySetInnerHTML`, `.innerHTML =`, `eval`, `new Function` in grid surface.
   - Enforces sanitizer wiring for key ID and UPRN inputs.

2. Input sanitization and validation:
   - `DetailsListVOA/Filters.ts`
   - `DetailsListVOA/Grid.tsx`
   - Sanitizes and validates task ID, sale ID, UPRN, postcode, and numeric/date filters.

3. Identity/authorization contract checks (plugin side):
   - `VOA.SVT.Plugins/Plugins/CustomAPI/SvtGetUserContext.cs`
   - `VOA.SVT.Plugins/Helpers/UserContextResolver.cs`
   - Covered by tests in `DetailsListVOA/tests/security-review-gate.test.ts`.

4. New external-link hardening (added 2026-03-24):
   - `DetailsListVOA/components/SaleDetailsShell/utils.ts`
   - `sanitizeExternalUrl(...)` introduced to only allow `http/https`, optionally allow rooted relative paths with trusted base.
   - Applied in:
     - `DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts`
     - `DetailsListVOA/components/SaleDetailsShell/shared/ExternalLinkCard.tsx`

## Issue Identified and Fixed

Issue:
- Backend/SharePoint-driven URL fields could be rendered as links with insufficient scheme restrictions, creating a click-based injection/phishing risk for unsafe schemes.

Fix:
- Introduced centralized URL sanitization that blocks non-http schemes (`javascript:`, `data:`, `ftp:`, protocol-relative `//...`, and bare values).
- Relative URLs are accepted only when explicitly allowed and resolved against a trusted base URL.

## Test Coverage Added

1. New unit tests:
   - `DetailsListVOA/tests/external-url-safety.test.ts`

2. Cases covered:
   - Allows `HTTP` and `HTTPS` URLs.
   - Blocks `javascript:`, `data:`, `ftp:`, and `//protocol-relative` URLs.
   - Resolves rooted relative URL only when allowRelative+baseUrl are provided.
   - Blocks bare/unknown URL forms.

3. Existing gate evidence:
   - `npx jest DetailsListVOA/tests/security-review-gate.test.ts --no-coverage`
   - Result: pass (13 tests).

## How Testers Should Validate (Pen Test Checklist)

1. XSS injection payloads in search and filter fields:
   - Validate no script execution in grid cells, modal content, and labels.

2. Unsafe-link injection in backend payload:
   - Attempt `javascript:`, `data:`, `//host`, encoded variants in URL fields.
   - Confirm links are not rendered/clickable when unsafe.

3. Local storage tampering:
   - Modify prefilter JSON in `localStorage`.
   - Verify server-side authorization still governs data returned.

4. IDOR and privilege checks:
   - Alter request identifiers and role-sensitive parameters in API traffic.
   - Confirm unauthorized data is rejected by backend controls.

5. Resilience checks:
   - Fuzz oversized/invalid values and malformed JSON.
   - Confirm UI fails safely and does not expose stack traces.

## Showcase Talking Points

- Security gate enforces anti-XSS coding constraints and sanitizer presence.
- Authorization contracts are tested for initiating-user identity and allowlist role/team logic.
- New URL sanitization closes click-based unsafe link vectors for data-driven UI links.
- Test suite now includes explicit URL safety unit tests for regression prevention.
- Combined approach: static gate + unit tests + pen-test checklist for operational validation.

## Commands

```bash
npx jest DetailsListVOA/tests/security-review-gate.test.ts --no-coverage
npx jest DetailsListVOA/tests/external-url-safety.test.ts --no-coverage
```
