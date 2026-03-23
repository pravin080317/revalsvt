const SSU_APP_ID = 'cdb5343c-51c1-ec11-983e-002248438fff';
const SSU_FORM_ID = '4176b880-fcc3-4ee7-b915-ab163011bbcb';
const REQUEST_LINE_ITEM_VIEW_ID = 'e949034d-2b76-4a16-b3dc-aad6285025bc';

export const buildDataEnhancementUrl = (environmentUrl: string): string => {
  const baseUrl = environmentUrl.trim().replace(/\/$/, '');
  if (!baseUrl) { return ''; }
  return `${baseUrl}/main.aspx?appid=${SSU_APP_ID}&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=${REQUEST_LINE_ITEM_VIEW_ID}&viewType=1039`;
};

export const buildHereditamentUrl = (environmentUrl: string, suId: string): string => {
  const baseUrl = environmentUrl.trim().replace(/\/$/, '');
  const normalizedSuid = suId.trim();
  if (!baseUrl || !normalizedSuid) {
    return '';
  }

  return `${baseUrl}/main.aspx?appid=${SSU_APP_ID}&newWindow=true&pagetype=entityrecord&etn=voa_ssu&id=${encodeURIComponent(normalizedSuid)}&formid=${SSU_FORM_ID}`;
};
