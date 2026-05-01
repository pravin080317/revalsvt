import { type GridFilterState, isValidUkPostcode, normalizeUkPostcode } from '../Filters';

export interface SalesSearchErrors {
  address?: string;
  postcode?: string;
  street?: string;
  townCity?: string;
  saleId?: string;
  taskId?: string;
  uprn?: string;
  billingAuthority?: string;
  bacode?: string;
  summaryFlag?: string;
  searchField?: string;
}

export const ID_FIELD_MAX_LENGTH = 15;
export const UPRN_MAX_LENGTH = 12;
export const ADDRESS_FIELD_MAX_LENGTH = 150;
export const MIN_ADDRESS_TEXT_LENGTH = 3;
export const SALE_ID_REGEX = /^S-\d+$/i;
export const TASK_ID_REGEX = /^(?:\d+|[AM]-\d+)$/i;
export const TASK_ID_MIN_LENGTH = 3;

export const sanitizeAlphaNumHyphen = (value?: string, maxLength = ID_FIELD_MAX_LENGTH): string =>
  (value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, maxLength);

export const sanitizeTaskIdInput = (value?: string, maxLength = ID_FIELD_MAX_LENGTH): string =>
  (value ?? '')
    .toUpperCase()
    .replace(/[^AM0-9-]/g, '')
    .slice(0, maxLength);

export const sanitizeDigits = (value?: string, maxLength = UPRN_MAX_LENGTH): string =>
  (value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength);

const validateSaleIdSearch = (searchBy: GridFilterState['searchBy'], saleId: string): string | undefined => {
  if (searchBy !== 'saleId' || saleId.length === 0) {
    return undefined;
  }

  return !SALE_ID_REGEX.test(saleId) || saleId.length < 3
    ? 'Please enter a valid Sale ID'
    : undefined;
};

const validateTaskIdSearch = (searchBy: GridFilterState['searchBy'], taskId: string): string | undefined => {
  if (searchBy !== 'taskId' || taskId.length === 0) {
    return undefined;
  }

  if (taskId.length < TASK_ID_MIN_LENGTH) {
    return `Enter at least ${TASK_ID_MIN_LENGTH} characters`;
  }

  return !TASK_ID_REGEX.test(taskId)
    ? 'Please enter a valid Task ID Use A- or M- prefix (e.g. A-1000001) or numbers only.'
    : undefined;
};

const validateUprnSearch = (searchBy: GridFilterState['searchBy'], uprn: string, uprnRaw: string): string | undefined => {
  if (searchBy !== 'uprn' || uprnRaw.length === 0) {
    return undefined;
  }

  return uprn.length === 0 || /[^0-9]/.test(uprnRaw)
    ? 'Please enter a valid UPRN'
    : undefined;
};

const validateAddressSearch = (args: {
  searchBy: GridFilterState['searchBy'];
  building: string;
  street: string;
  town: string;
  postcode: string;
}): Pick<SalesSearchErrors, 'address' | 'postcode' | 'street' | 'townCity'> => {
  const { searchBy, building, street, town, postcode } = args;
  if (searchBy !== 'address') {
    return {};
  }

  const hasPostcode = postcode.length > 0;
  const postcodeValid = hasPostcode ? isValidUkPostcode(postcode, false) : false;
  const postcodeError = hasPostcode && !postcodeValid ? 'Please enter a valid postcode' : undefined;
  const requiresOtherCriteria = !postcodeValid;

  if (!requiresOtherCriteria) {
    return { postcode: postcodeError };
  }

  const streetError = street.length > 0 && street.length < MIN_ADDRESS_TEXT_LENGTH
    ? `Enter at least ${MIN_ADDRESS_TEXT_LENGTH} characters`
    : undefined;
  const townError = town.length > 0 && town.length < MIN_ADDRESS_TEXT_LENGTH
    ? `Enter at least ${MIN_ADDRESS_TEXT_LENGTH} characters`
    : undefined;
  const buildingValid = building.length > 0;
  const streetValid = street.length >= MIN_ADDRESS_TEXT_LENGTH;
  const townValid = town.length >= MIN_ADDRESS_TEXT_LENGTH;
  const criteriaCount = (buildingValid ? 1 : 0) + (streetValid ? 1 : 0) + (townValid ? 1 : 0);
  const addressError = !hasPostcode && criteriaCount === 1
    ? 'Please provide at least two search criteria.'
    : undefined;

  return {
    address: addressError,
    postcode: postcodeError,
    street: streetError,
    townCity: townError,
  };
};

export const getSalesSearchErrors = (fs: GridFilterState): SalesSearchErrors => {
  const saleId = sanitizeAlphaNumHyphen(fs.saleId, ID_FIELD_MAX_LENGTH).trim();
  const taskId = sanitizeTaskIdInput(fs.taskId, ID_FIELD_MAX_LENGTH).trim();
  const uprn = sanitizeDigits(fs.uprn, UPRN_MAX_LENGTH).trim();
  const uprnRaw = (fs.uprn ?? '').trim();
  const building = (fs.buildingNameNumber ?? '').trim();
  const street = (fs.street ?? '').trim();
  const town = (fs.townCity ?? '').trim();
  const postcode = normalizeUkPostcode(fs.postcode ?? '').trim();
  const saleIdError = validateSaleIdSearch(fs.searchBy, saleId);
  const taskIdError = validateTaskIdSearch(fs.searchBy, taskId);
  const uprnError = validateUprnSearch(fs.searchBy, uprn, uprnRaw);
  const addressErrors = validateAddressSearch({
    searchBy: fs.searchBy,
    building,
    street,
    town,
    postcode,
  });

  return {
    address: addressErrors.address,
    postcode: addressErrors.postcode,
    street: addressErrors.street,
    townCity: addressErrors.townCity,
    saleId: saleIdError,
    taskId: taskIdError,
    uprn: uprnError,
    billingAuthority: undefined,
    bacode: undefined,
    summaryFlag: undefined,
    searchField: undefined,
  };
};
