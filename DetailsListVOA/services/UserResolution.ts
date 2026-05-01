import { IInputs } from '../generated/ManifestTypes';
import { svtDebug } from '../utils/debug';

/**
 * User cache entry with resolved name and metadata
 */
export interface ResolvedUser {
  name: string;
  isActive?: boolean;
  entraObjectId?: string;
  systemUserId?: string;
}

/**
 * Service to resolve user GUIDs to display names from Dataverse
 * Maintains a cache to avoid duplicate queries
 */
export class UserResolutionService {
  private readonly userCache: Map<string, ResolvedUser> = new Map<string, ResolvedUser>();

  /**
   * Resolve a user GUID to display name by querying Dataverse
   * First checks cache, then queries systemuser table.
   * 
   * @param context - PCF context for Web API access
   * @param userGuid - GUID that could be systemuserid or azureactivedirectoryobjectid
   * @returns Resolved user with name and metadata, or undefined if not found
   */
  async resolveUser(
    context: ComponentFramework.Context<IInputs>,
    userGuid?: string,
  ): Promise<ResolvedUser | undefined> {
    if (!userGuid?.trim()) {
      return undefined;
    }

    const normalizedGuid = userGuid.trim().toLowerCase();

    // Check cache first
    if (this.userCache.has(normalizedGuid)) {
      svtDebug.log('UserResolutionService', 'Cache hit for', normalizedGuid);
      return this.userCache.get(normalizedGuid);
    }

    try {
      svtDebug.log('UserResolutionService', 'Resolving user GUID:', normalizedGuid);
      
      // Try to fetch from systemuser table using the GUID as systemuserid first
      const webApi = this.getWebApi(context);
      if (!webApi) {
        svtDebug.warn('UserResolutionService', 'Web API not available');
        return undefined;
      }

      // Query 1: Try as systemuserid
      let resolved = await this.queryUserBySystemUserId(webApi, normalizedGuid);
      
      // Query 2: If not found, try as azureactivedirectoryobjectid (Entra OID)
      if (!resolved) {
        resolved = await this.queryUserByEntraObjectId(webApi, normalizedGuid);
      }

      if (resolved) {
        // Cache the result
        this.userCache.set(normalizedGuid, resolved);
        svtDebug.log('UserResolutionService', `Resolved user: ${resolved.name}`, resolved);
        return resolved;
      }

      svtDebug.warn('UserResolutionService', 'User not found for GUID:', normalizedGuid);
      return undefined;
    } catch (error) {
      svtDebug.error('UserResolutionService', 'Error resolving user:', error);
      return undefined;
    }
  }

  /**
   * Resolve multiple users in batch
   */
  async resolveUsers(
    context: ComponentFramework.Context<IInputs>,
    userGuids: string[],
  ): Promise<Map<string, ResolvedUser>> {
    const results = new Map<string, ResolvedUser>();

    for (const guid of userGuids) {
      if (!guid?.trim()) continue;
      
      try {
        const resolved = await this.resolveUser(context, guid);
        if (resolved) {
          results.set(guid.toLowerCase().trim(), resolved);
        }
      } catch (error) {
        svtDebug.warn('UserResolutionService', `Failed to resolve user ${guid}:`, error);
      }
    }

    return results;
  }

  /**
   * Clear the cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.userCache.clear();
    svtDebug.log('UserResolutionService', 'Cache cleared');
  }

  /**
   * Get cache size (for debugging)
   */
  getCacheSize(): number {
    return this.userCache.size;
  }

  private getWebApi(context: ComponentFramework.Context<IInputs>): any {
    const webApi = (context as any).webAPI;
    if (webApi?.retrieveRecord || webApi?.retrieveMultipleRecords) {
      return webApi;
    }
    const xrm = (globalThis as any).Xrm;
    if (xrm?.WebApi?.online) {
      return xrm.WebApi.online;
    }
    if (xrm?.WebApi) {
      return xrm.WebApi;
    }
    return undefined;
  }

  private async queryUserBySystemUserId(webApi: any, systemUserId: string): Promise<ResolvedUser | undefined> {
    try {
      const record = await webApi.retrieveRecord(
        'systemuser',
        systemUserId,
        '?$select=systemuserid,fullname,firstname,lastname,azureactivedirectoryobjectid,isdisabled,domainname'
      );

      if (record) {
        const displayName = this.buildDisplayName(
          record.fullname,
          record.firstname,
          record.lastname,
          record.domainname,
        );

        if (displayName) {
          return {
            name: displayName,
            isActive: record.isdisabled !== true,
            systemUserId: record.systemuserid,
            entraObjectId: record.azureactivedirectoryobjectid,
          };
        }
      }
    } catch (error) {
      svtDebug.log('UserResolutionService', 'Query by systemuserid failed (expected fallback):', error);
    }

    return undefined;
  }

  private async queryUserByEntraObjectId(webApi: any, entraObjectId: string): Promise<ResolvedUser | undefined> {
    try {
      const records = await webApi.retrieveMultipleRecords(
        'systemuser',
        `?$filter=azureactivedirectoryobjectid eq '${entraObjectId}'&$select=systemuserid,fullname,firstname,lastname,azureactivedirectoryobjectid,isdisabled,domainname`
      );

      if (records && records.records.length > 0) {
        const record = records.records[0];
        const displayName = this.buildDisplayName(
          record.fullname,
          record.firstname,
          record.lastname,
          record.domainname,
        );

        if (displayName) {
          return {
            name: displayName,
            isActive: record.isdisabled !== true,
            systemUserId: record.systemuserid,
            entraObjectId: record.azureactivedirectoryobjectid,
          };
        }
      }
    } catch (error) {
      svtDebug.log('UserResolutionService', 'Query by entra object id failed (expected fallback):', error);
    }

    return undefined;
  }

  private buildDisplayName(
    fullname?: string,
    firstname?: string,
    lastname?: string,
    domainname?: string,
  ): string | undefined {
    const trimmed = (fullname?.trim() || '').trim();
    if (trimmed) {
      return trimmed;
    }

    const first = (firstname?.trim() || '').trim();
    const last = (lastname?.trim() || '').trim();
    const combined = `${first} ${last}`.trim();
    if (combined) {
      return combined;
    }

    const domain = (domainname?.trim() || '').trim();
    if (domain) {
      return domain;
    }

    return undefined;
  }
}
