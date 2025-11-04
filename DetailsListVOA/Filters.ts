export type SearchByOption =
  | 'uprn'
  | 'taskId'
  | 'address'
  | 'manualCheck'
  | 'postcode'
  | 'street'
  | 'town'
  | 'taskStatus'
  | 'source';

export type ManualCheckFilter = 'yes' | 'no' | 'all';

export interface GridFilterState {
  searchBy: SearchByOption;
  uprn?: string;
  taskId?: string;
  buildingNameNumber?: string;
  street?: string;
  townCity?: string;
  postcode?: string;
  manualCheck?: ManualCheckFilter;
  taskStatus?: string;
  source?: string;
}

export const createDefaultGridFilters = (): GridFilterState => ({
  searchBy: 'address',
  manualCheck: 'all',
});

export const sanitizeFilters = (filters: GridFilterState): GridFilterState => {
  const sanitized: GridFilterState = {
    searchBy: filters.searchBy,
    manualCheck: filters.manualCheck ?? 'all',
  };

  if (filters.uprn) {
    const digits = filters.uprn.replace(/\D/g, '');
    sanitized.uprn = digits.length > 0 ? digits : undefined;
  }

  if (filters.taskId) {
    const trimmed = filters.taskId.trim();
    sanitized.taskId = trimmed.length > 0 ? trimmed : undefined;
  }

  if (filters.buildingNameNumber) {
    const trimmed = filters.buildingNameNumber.trim();
    sanitized.buildingNameNumber = trimmed.length > 0 ? trimmed : undefined;
  }

  if (filters.street) {
    const trimmed = filters.street.trim();
    sanitized.street = trimmed.length > 0 ? trimmed : undefined;
  }

  if (filters.townCity) {
    const trimmed = filters.townCity.trim();
    sanitized.townCity = trimmed.length > 0 ? trimmed : undefined;
  }

  if (filters.postcode) {
    const trimmed = filters.postcode.trim().toUpperCase();
    sanitized.postcode = trimmed.length > 0 ? trimmed : undefined;
  }

  if (filters.taskStatus) {
    const trimmed = filters.taskStatus.trim();
    sanitized.taskStatus = trimmed.length > 0 ? trimmed : undefined;
  }

  if (filters.source) {
    const trimmed = filters.source.trim();
    sanitized.source = trimmed.length > 0 ? trimmed : undefined;
  }

  return sanitized;
};
