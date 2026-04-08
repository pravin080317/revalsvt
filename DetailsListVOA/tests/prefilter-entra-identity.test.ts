import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('prefilter identity uses Entra IDs only', () => {
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');
  const gridSource = readRepoFile('DetailsListVOA/Grid.tsx');
  const journeySource = readRepoFile('DetailsListVOA/components/HomeShell/ManagerJourneyShell.tsx');

  test('manager journey preserves the current user Entra object id', () => {
    expect(journeySource).toContain("const entraObjectIdValue = findRecordValue(record, 'entraObjectId');");
    expect(journeySource).toContain('entraObjectId: normalizeUserId(normalizeText(entraObjectIdValue))');
    expect(journeySource).toContain('const effectiveEntraObjectId = React.useMemo(');
    expect(journeySource).toContain('entraObjectId={effectiveEntraObjectId}');
  });

  test('details host resolves Entra object id before loading caseworker and QC views', () => {
    expect(hostSource).toContain('const requiresCurrentUserEntra = isCaseworkerView || isQcView;');
    expect(hostSource).toContain('const [currentUserEntraLoading, setCurrentUserEntraLoading] = React.useState(false);');
    expect(hostSource).toContain('setResolvedCurrentUserEntraId(parseUserContextEntraObjectId(rawPayload));');
    expect(hostSource).toContain("setLoadErrorMessage('Unable to resolve current user Entra ID.');");
  });

  test('details host remaps legacy system user ids to Entra ids before sending prefilters', () => {
    expect(hostSource).toContain('const systemUserIdToEntraIdMap = React.useMemo(() => {');
    expect(hostSource).toContain('const normalizePrefilterGuidToEntra = React.useCallback((value: string): string => {');
    expect(hostSource).toContain('resolved = normalizePrefilterStateUserIds(resolved);');
    expect(hostSource).toContain('const normalizedPrefilters = prefilters ? normalizePrefilterStateUserIds(prefilters) : prefilters;');
  });

  test('caseworker and QC browser requests mirror the APIM and store proc contract', () => {
    expect(hostSource).toContain('const apiPrefilters = normalizedPrefilters;');
    expect(hostSource).toContain('prefilters: apiPrefilters,');
  });

  test('grid restores retained prefilters and auto-applies stored searches without fallback loops', () => {
    expect(gridSource).toContain('if (!raw) return;');
    expect(gridSource).toContain('markPrefilterHydrating();');
    expect(gridSource).toContain('setPrefilters(normalizedNext);');
    expect(gridSource).toContain("const shouldAutoApply = storedApplied === false ? false : canAutoApply;");
    expect(gridSource).toContain("onPrefilterApply(normalizedNext, { source: 'auto' });");
    expect(gridSource).not.toContain(':fallback');
  });


  test('load effect checks currentUserEntraLoading before consuming lastRef nonce to allow retry', () => {
    // When the component mounts fresh (home → back to screen), prefilter auto-apply can fire in the
    // same React flush as setCurrentUserEntraLoading(true). The load effect must NOT consume the
    // searchNonce reference (lastRef.current) before the currentUserEntraLoading guard – otherwise
    // when the Entra context resolves, changed=false and the API call never fires.
    const loadEffect = hostSource;
    // The requiresCurrentUserEntra && currentUserEntraLoading return must appear BEFORE the
    // lastRef.current = { ... } assignment inside the same changed-guard block.
    const changedIdx = loadEffect.indexOf('if (!changed) return;');
    const lastRefUpdateIdx = loadEffect.indexOf('lastRef.current = {', changedIdx);
    const entraLoadingGuardIdx = loadEffect.indexOf('requiresCurrentUserEntra && currentUserEntraLoading', changedIdx);
    expect(changedIdx).toBeGreaterThan(-1);
    expect(lastRefUpdateIdx).toBeGreaterThan(-1);
    expect(entraLoadingGuardIdx).toBeGreaterThan(-1);
    // entraLoadingGuard must come BEFORE lastRef update (lower index = earlier in source)
    expect(entraLoadingGuardIdx).toBeLessThan(lastRefUpdateIdx);
  });
});