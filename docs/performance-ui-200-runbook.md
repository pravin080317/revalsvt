# UI Performance Test Runbook (200 Users)

This runbook executes a browser-level load test for the PCF UI only.

## What this tests

- Concurrent browser sessions against the PCF harness
- Front-end rendering and interaction behavior under 200 virtual users
- Web vitals and failed-request thresholds

## Prerequisites

1. Start the PCF harness in one terminal:

```powershell
cd c:\learning\pcf\SVTList
npm run start
```

2. Install k6 (one-time).

If k6 is not installed on Windows, use one of:

- `winget install k6.k6`
- `choco install k6`

## Run the 200-user UI test

In a second terminal:

```powershell
cd c:\learning\pcf\SVTList
npm run perf:ui:200
```

Optional custom target URL:

```powershell
k6 run scripts/perf-ui-200.js -e TARGET_URL=http://localhost:8182
```

## Test profile

The scenario ramps to 200 users and holds:

- 1m -> 50 users
- 2m -> 100 users
- 3m -> 200 users
- 5m hold at 200 users
- 2m ramp down

## Pass/Fail thresholds

- `checks` > 98%
- `browser_http_req_failed` < 1%
- `browser_web_vital_lcp` p95 < 2500ms
- `browser_web_vital_fcp` p95 < 2000ms
- `browser_web_vital_cls` p95 < 0.1

## Notes

- Keep `customApiName` empty when you want UI-only behavior using local/sample mode.
- For app-side timings, also enable `perfLogsEnabled` or set `SVT_PERF=true` in local storage.
