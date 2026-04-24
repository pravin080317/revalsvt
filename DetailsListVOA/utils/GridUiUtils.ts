export const buildAriaDescribedBy = (...ids: (string | undefined)[]): string | undefined => {
  const values = ids.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  return values.length > 0 ? values.join(' ') : undefined;
};

export const joinClassNames = (...classNames: (string | undefined | false)[]): string | undefined => {
  const values = classNames.filter((className): className is string => typeof className === 'string' && className.trim().length > 0);
  return values.length > 0 ? values.join(' ') : undefined;
};

export const formatRequiredAriaLabel = (label: string, required?: boolean): string => (
  required ? `${label}, required` : label
);
