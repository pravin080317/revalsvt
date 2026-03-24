# SVT PCF Performance Review Checklist

## Load Test Scenarios

| Scenario | User Count | Context | Benchmark |
|----------|-----------|---------|-----------|
| **Personas** | 20 users | Fixed user personas | Baseline |
| **Sales Search Page** | 20-200+ users (random) | Variable/unpredictable | 200 users as benchmark |
| **All Other Screens** | 20-50 users | Caseworker, Manager, QC views | Standard ops |

---

## 1. PAGE SIZE & PAGINATION 🔧

### Current Config
- **Default Page Size**: 500 records
- **Location**: `ControlManifest.Input.xml` (line 284) & `DetailsListHost.tsx` (line 291)
- **Server-Driven Threshold**: 2000 records

### Checklist Items

- [ ] **Page Size Tuning**
  - [ ] Confirm 500 records per page is optimal for 20-200 concurrent users
  - [ ] Test memory usage with 500-item pages on low-end devices
  - [ ] Consider reducing to 250-300 for mobile/tablet scenarios
  - [ ] Measure initial page load time (FCP, LCP) with 500 items

- [ ] **Pagination Strategy**
  - [ ] Current: Uses `currentPage * pageSize` offset-based pagination
  - [ ] **For 20 users**: Acceptable (light load)
  - [ ] **For 200 users**: Monitor API response times; consider cursor-based pagination if offsets slow down
  - [ ] Verify server can handle concurrent pagination requests at 200-user scale

- [ ] **Server-Driven Mode**
  - [ ] Threshold: 2000 records triggers server-driven vs client-side filtering
  - [ ] At 200 users querying sales: Likely to hit this threshold
  - [ ] Verify server-driven filtering logic doesn't cause N+1 API calls

---

## 2. FILTERING & SEARCH PERFORMANCE ⚡

### Current Implementation
- **Client-Side Filtering**: `filterItemsByColumnFilters()` in `GridColumnFilters.ts`
- **Server-Side Search**: `loadGridData()` in `GridDataController.ts`
- **Search By Options**: Address, JobID, UARN, Postcode
- **Multi-column Filters**: Numeric ranges, date ranges, dropdown selections

### Checklist Items

- [ ] **Client-Side Filtering Impact**
  - [ ] At 20 users: Filter 500 items locally = ~10-50ms (acceptable)
  - [ ] At 200 users: Each user filtering could spike to 100-200ms
  - [ ] Measure filter response time with `logPerf('[Grid Perf] Client filteredItems')`
  - [ ] Enable SVT_PERF=true in console to benchmark: `localStorage.setItem('SVT_PERF', 'true')`

- [ ] **Search Performance**
  - [ ] Monitor `voa_GetAllSalesRecord` API response times
  - [ ] At 200 concurrent users: Expect API latency increases
  - [ ] Check APIM rate limits / throttling at peak load
  - [ ] Postcode search validation (`isValidUkPostcode`) should be fast

- [ ] **Prefilter Auto-Apply**
  - [ ] Screen: Manager Assignment, QC Assignment, QC View
  - [ ] Auto-apply heavy on first load with many concurrent users
  - [ ] Check storage access time (localStorage) at scale
  - [ ] Consider debouncing prefilter hydration

- [ ] **Column Filter Caching**
  - [ ] Filter options built from records: `getDistinctOptions()` in `Grid.tsx` (line 795)
  - [ ] At 500-item pages: ~5-20ms calculation
  - [ ] At 5000 items (if user scrolls): ~50-100ms
  - [ ] Use `useMemo` to prevent recalculation ✓ (already implemented)

---

## 3. RENDERING & DOM PERFORMANCE 📊

### Current Implementation
- **Grid Library**: Fluent UI `DetailsList` (ShimmeredDetailsList for loading state)
- **Memoization**: Extensive use of `useMemo` (50+ instances) and `useCallback` (30+ instances)
- **Virtual Scrolling**: ✓ Fluent DetailsList handles this internally
- **Column Rendering**: GridCell component with conditional rendering

### Checklist Items

- [ ] **DetailsList Performance**
  - [ ] Current: Renders full page (500 items) or virtual subset
  - [ ] Test rendering 500 items: Target <200ms for tree paint
  - [ ] At 200 concurrent users: Monitor browser memory per user
  - [ ] Check `ConstrainMode.horizontalConstrained` CSS impact

- [ ] **Column Building**
  - [ ] `buildColumns()` in `DetailsListHost.tsx` (line 986)
  - [ ] Perf log: `[Grid Perf] Build columns (ms)`
  - [ ] At 20-50 columns per screen: Should be <50ms
  - [ ] Verify memoization prevents rebuild on every prop change

- [ ] **Row Rendering (GridCell)**
  - [ ] Custom cell component: Check for unoptimized child renders
  - [ ] `isViewSalesRecordEnabledFor()` lookup called per cell?
  - [ ] Row selection visual updates: Should not re-render all rows

- [ ] **Selection & Multi-Select**
  - [ ] `Selection` hook from Fluent UI: Should be O(1) per row
  - [ ] Batch assignment (500 items max): Verify UI doesn't freeze
  - [ ] At 200 users performing bulk actions: Test concurrent selections

- [ ] **Spinner & Loading States**
  - [ ] `ShimmeredDetailsList` loading skeleton: Test render time
  - [ ] Data fetch timeout / cancellation: Prevent zombie requests

---

## 4. API & NETWORK PERFORMANCE 🌐

### Current API Calls

| API | Type | Scenario | Expected Response |
|-----|------|----------|-------------------|
| `voa_GetAllSalesRecord` | Function | Grid load, filter, sort | 30-500 items |
| `voa_SvtGetAssignableUsers` | Function | Assignment panel open | 50-200 users |
| `voa_GetViewSaleRecordById` | Function | Row click → detail view | 1 sale record |
| `voa_SvtSubmitSalesVerification` | Action | Submit verification | Status update |
| `voa_SvtTaskAssignment` | Action | Batch assign | Max 500 records |
| Metadata APIs | Function | Grid init | Columns, filters |
| User Context API | Function | Session init | Current user info |

### Checklist Items

- [ ] **Request Deduplication**
  - [ ] No duplicate API calls for same filter/sort with same params?
  - [ ] Test: Users 20, 50, 100, 200 rapid-fire same search
  - [ ] Check if APIM caching reduces backend load

- [ ] **Assignable Users Cache**
  - [ ] Cached per: `buildAssignableUsersCacheKey()` (apiName + screenName)
  - [ ] Cache key: Valid for session? Or per-screen change?
  - [ ] At 200 users opening assignment panel concurrently: Monitor cache hits

- [ ] **Batch API Calls**
  - [ ] Assignment batch size: Max 500 (line 21 in `ControlConfig.ts`)
  - [ ] At 200 users assigning 500+ tasks: Verify batching works
  - [ ] Measure total time: Split across 2 API calls vs 1 large call?

- [ ] **Connection Pool**
  - [ ] Verify WebAPI executor reuses connections
  - [ ] At 200 users: Monitor connection pool exhaustion
  - [ ] Check for connection leaks in error scenarios

- [ ] **Error Handling & Retries**
  - [ ] Failed API call: Does it retry exponentially?
  - [ ] At high load, API failure cascade to multiple users?
  - [ ] Graceful degradation to sample data if API unavailable?

- [ ] **Network Waterfall**
  - [ ] Metadata API → Grid data API: Parallel or serial?
  - [ ] User context API: Blocking or async?
  - [ ] Measure critical path on slow 3G: Target <5 seconds to interactive

---

## 5. MEMORY & GC PERFORMANCE 💾

### Current Memory Profile

- **React Version**: 16.14.0 (older; minimal overhead)
- **State Management**: React hooks (useState, useContext)
- **Large State Objects**:
  - `filteredIds`: Array of record IDs
  - `records`: Map<ID, Record> for all loaded items
  - `userDisplayNameMap`: User GUID → display name cache
  - `headerFilters`: Filter state across columns
  - `prefilters`: Stored in localStorage (serialized)

### Checklist Items

- [ ] **Heap Size Under Load**
  - [ ] Baseline (no load): Measure heap on developer tools
  - [ ] At 20 concurrent users: Compare heap growth
  - [ ] At 200 concurrent users: Monitor memory leak risk
  - [ ] Garbage collection pauses: Target <100ms per GC

- [ ] **State Cleanup**
  - [ ] Unmount component: Verify cleanup functions run
  - [ ] Navigation away from grid: Release `records`, `filteredIds`, filters
  - [ ] localStorage usage: Prefilters stored indefinitely?
  - [ ] Session storage: Clear after session end?

- [ ] **Array/Map Growth**
  - [ ] `filteredIds`: Max size = page size (500 at load)
  - [ ] If user pages through 10 pages: Keep old data or discard?
  - [ ] Long session (8 hours): Does map grow unbounded?

- [ ] **Memoization Overhead**
  - [ ] 50+ useMemo() calls: Check if excessive object creation
  - [ ] Dependencies array: Verify only necessary deps included
  - [ ] Memoized objects: Do they live longer than needed?

---

## 6. LOAD TEST RESULTS TRACKING 📈

### Test Matrix (To be populated)

#### Scenario A: 20 Persona Users (Baseline)
- **Grid Load Time**: _____ ms (FCP), _____ ms (LCP)
- **Filter Apply Time**: _____ ms (50 items), _____ ms (500 items)
- **Row Click → Detail Load**: _____ ms
- **Memory (Peak)**: _____ MB
- **CPU (Peak)**: _____ %

#### Scenario B: 50 Users (Manager/QC Screens)
- **Concurrent Grid Loads**: _____ req/sec
- **API Response Time (p50)**: _____ ms
- **API Response Time (p95)**: _____ ms
- **Grid Perf (Build columns)**: _____ ms
- **Grid Perf (Filter IDs)**: _____ ms
- **Memory (Peak)**: _____ MB
- **Failed Requests**: _____ %

#### Scenario C: 200 Users (Sales Search Benchmark)
- **Concurrent Grid Loads**: _____ req/sec
- **API Response Time (p50)**: _____ ms
- **API Response Time (p95)**: _____ ms
- **API Response Time (p99)**: _____ ms
- **Server-Driven Filtering Activated**: Yes / No
- **Batch Assignment Requests**: _____ / _____ succeeded
- **Memory (Peak)**: _____ MB
- **Failed Requests**: _____ %
- **Timeout Rate**: _____ %

---

## 7. OPTIMIZATION RECOMMENDATIONS 🚀

### Quick Wins (Low Effort, High Impact)

- [ ] **Enable Performance Monitoring**
  ```javascript
  // In browser console
  localStorage.setItem('SVT_PERF', 'true');
  // Then observe console logs: [Grid Perf] Build columns, [Grid Perf] Filter ids, etc.
  ```

- [ ] **Tune Page Size**
  - Current: 500 (might be too large for 200 users)
  - Try: 250 or 150 (if network latency is primary constraint)
  - Monitor: Trade-off between load time and pagination clicks

- [ ] **Optimize API Timeouts**
  - Default timeout: Check if any hung requests at high load
  - Increase from 30s → 60s? Or reduce to 20s for faster failure?

- [ ] **Prefilter Storage Expiry**
  - Currently: localStorage persists indefinitely
  - Add: TTL (time-to-live) for cached prefilters (e.g., 24 hours)

### Medium-Term Optimizations (1-2 weeks)

- [ ] **Investigate Server-Driven Mode Threshold**
  - Current: 2000 records
  - For 200-user load, consider lowering to 1000 to offload client filtering

- [ ] **Batch API Requests**
  - If multiple concurrent grid loads: Batch metadata calls
  - Use Promise.all() for parallel independent calls

- [ ] **React 18+ Migration** (if feasible)
  - Current: React 16.14 (no concurrent rendering, automatic batching)
  - React 18: Better concurrent updates, Suspense support
  - Measure: Could reduce jank under high load

- [ ] **Virtual Scrolling Fine-Tuning**
  - Verify Fluent DetailsList overscan buffer size
  - Higher buffer → smoother scroll, more memory
  - Lower buffer → less memory, possible scroll flicker

### Long-Term Optimizations (1-2 months)

- [ ] **Cursor-Based Pagination**
  - Replace offset-based (current) with cursor-based
  - Benefits: Consistent pagination at scale, better API caching
  - Backend: Requires server implementation

- [ ] **Incremental Data Loading (Infinite Scroll)**
  - If users typically don't page through 10+ pages
  - Load next page only on scroll near bottom
  - Reduce memory: Discard off-screen pages

- [ ] **GraphQL / Batch API**
  - Reduce waterfall: Load grid data + assignable users in 1 request
  - Backend: Requires new API endpoint

- [ ] **Service Worker Caching**
  - Cache: Metadata, userDisplayNameMap, filter options
  - Offline: Show cached data if network unavailable
  - Test: Impact on 200-user load (less network traffic)

---

## 8. TESTING STRATEGY 🧪

### Unit Tests
- [ ] Filter performance: `filterItemsByColumnFilters()` with 1000+ items
- [ ] Sort performance: Client-side sort timing
- [ ] Memoization: Verify useMemo dependencies are correct

### Load Tests
- [ ] Tool: Apache JMeter / K6.io / Artillery
- [ ] Scenario A: 20 concurrent users, 10 min duration
- [ ] Scenario B: 50 concurrent users, 10 min duration
- [ ] Scenario C: 200 concurrent users, 15 min duration
- [ ] Ramp-up: Linear over 2 minutes to avoid connection pool shock

### Browser Performance Tests
- [ ] Chrome DevTools Lighthouse: Target 60+ FPS during interactions
- [ ] Profiler: Identify slowest react component re-renders
- [ ] Memory Profiler: Check for detached DOM nodes, growing arrays
- [ ] Network Tab: Verify no waterfall bottlenecks, parallel requests

### Real User Monitoring (RUM)
- [ ] Application Insights / Datadog: Monitor 20, 50, 200 user cohorts
- [ ] Metrics to track:
  - Custom events: Grid load start → display completion
  - Performance timings: FCP, LCP, TTI, CLS
  - Errors: API failures, timeouts, rendering exceptions
  - User actions: Filter time, sort time, assignment time

---

## 9. BASELINE MEASUREMENTS 📊

*Document existing perf baseline before load testing*

- [ ] **Development Environment**
  - Grid load time (1 page, 500 items): _____ ms
  - Filter 500 items client-side: _____ ms
  - Build columns (50 cols): _____ ms
  - Render DetailsList: _____ ms

- [ ] **Production Environment** (if available)
  - API response time (10th percentile): _____ ms
  - API response time (50th percentile): _____ ms
  - API response time (95th percentile): _____ ms
  - Error rate: _____ %

---

## 10. PERFORMANCE STANDARDS 📋

| Metric | Target (20-50 users) | Target (200 users) | Critical |
|--------|---------------------|-------------------|----------|
| Grid FCP | <1s | <2s | >3s |
| Grid LCP | <2s | <3s | >5s |
| Filter response | <100ms | <300ms | >1s |
| API response (p95) | <500ms | <2s | >5s |
| Memory per user | <50MB | <50MB | >100MB |
| CPU during load | <50% | <70% | >85% |

---

## Notes & Observations

1. **Server-Driven Threshold (2000 records)**
   - When grid loading >2000 records, system switches from client-side filtering to server-driven
   - At 200-user load with sales search, likely to hit this

2. **Cached Components**
   - Assignable users cache: Per screen, per API name (helps at scale)
   - User display name map: Shared across sessions (good for repeated lookups)

3. **Page Size Default (500)**
   - Reasonable for 20-50 users
   - May need reduction to 250 for 200-user sales search load

4. **React 16 Limitations**
   - No automatic batching across async operations
   - No concurrent rendering (all renders block DOM)
   - Consider React 18 upgrade for better concurrent load handling

5. **APIM / API Management**
   - If APIs go through APIM gateway: Verify rate limits, throttling policies
   - Caching policies: Ensure metadata is cached, grid data is not (stale risks)

---

## Document Version

- **Created**: 2026-03-24
- **Last Updated**: 2026-03-24
- **Load Test Scenarios**: 20 personas, 20-50 users (other screens), 200 users (sales search)
