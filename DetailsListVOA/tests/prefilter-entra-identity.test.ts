import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('prefilter identity uses Entra IDs only', () => {
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');
  const journeySource = readRepoFile('DetailsListVOA/components/HomeShell/ManagerJourneyShell.tsx');
  const pluginSource = readRepoFile('VOA.SVT.Plugins/Plugins/CustomAPI/SvtGetAssignableUsers.cs');
  const salesRecordModelsSource = readRepoFile('VOA.SVT.Plugins/Plugins/CustomAPI/DataAccessLayer/Model/SalesRecordModels.cs');

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
    expect(hostSource).toContain('const apiPrefilters = requestedBy ? undefined : normalizedPrefilters;');
    expect(hostSource).toContain('prefilters: apiPrefilters,');
    expect(salesRecordModelsSource).toContain('var preFilter = useRequestedBy ? null : PreFilter;');
    expect(salesRecordModelsSource).toContain('var searchBy = useRequestedBy ? null : SearchBy;');
    expect(salesRecordModelsSource).toContain('["RequestedBy"] = requestedBy,');
  });

  test('assignable users plugin returns both systemuserid and entra oid for remapping', () => {
    expect(pluginSource).toContain('SystemUserId = id.ToString()');
    expect(pluginSource).toContain('EntraObjectId = entraOid != Guid.Empty ? entraOid.ToString() : string.Empty');
    expect(pluginSource).toContain('public string SystemUserId { get; set; }');
    expect(pluginSource).toContain('public string EntraObjectId { get; set; }');
  });
});