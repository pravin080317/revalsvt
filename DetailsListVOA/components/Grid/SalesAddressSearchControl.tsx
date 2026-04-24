import {
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

interface SalesAddressSearchTextLike {
  fields: {
    buildingNameNumber: string;
    street: string;
    townCity: string;
    postcode: string;
  };
  placeholders: {
    buildingNameNumber: string;
    street: string;
    townCity: string;
    postcode: string;
  };
}

interface SalesAddressSearchControlProps {
  salesSearchText: SalesAddressSearchTextLike;
  buildingTitle?: string;
  streetTitle?: string;
  townTitle?: string;
  postcodeTitle?: string;
  buildingValue: string;
  streetValue: string;
  townValue: string;
  postcodeValue: string;
  addressError?: string;
  streetError?: string;
  townError?: string;
  postcodeError?: string;
  addressFieldMaxLength: number;
  onBuildingNameChange: (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value?: string,
  ) => void;
  onStreetChange: (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value?: string,
  ) => void;
  onTownCityChange: (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value?: string,
  ) => void;
  onPostcodeChange: (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value?: string,
  ) => void;
}

export const SalesAddressSearchControl = ({
  salesSearchText,
  buildingTitle,
  streetTitle,
  townTitle,
  postcodeTitle,
  buildingValue,
  streetValue,
  townValue,
  postcodeValue,
  addressError,
  streetError,
  townError,
  postcodeError,
  addressFieldMaxLength,
  onBuildingNameChange,
  onStreetChange,
  onTownCityChange,
  onPostcodeChange,
}: SalesAddressSearchControlProps): JSX.Element => {
  return (
    <>
      <Stack.Item styles={{ root: { minWidth: 220 } }}>
        <TextField
          id="sales-buildingnamenumber"
          label={salesSearchText.fields.buildingNameNumber}
          placeholder={salesSearchText.placeholders.buildingNameNumber}
          title={buildingTitle}
          value={buildingValue}
          onChange={onBuildingNameChange}
          errorMessage={addressError}
          maxLength={addressFieldMaxLength}
        />
      </Stack.Item>
      <Stack.Item styles={{ root: { minWidth: 220 } }}>
        <TextField
          id="sales-street"
          label={salesSearchText.fields.street}
          placeholder={salesSearchText.placeholders.street}
          title={streetTitle}
          value={streetValue}
          onChange={onStreetChange}
          errorMessage={streetError}
          maxLength={addressFieldMaxLength}
        />
      </Stack.Item>
      <Stack.Item styles={{ root: { minWidth: 220 } }}>
        <TextField
          id="sales-towncity"
          label={salesSearchText.fields.townCity}
          placeholder={salesSearchText.placeholders.townCity}
          title={townTitle}
          value={townValue}
          onChange={onTownCityChange}
          errorMessage={townError}
          maxLength={addressFieldMaxLength}
        />
      </Stack.Item>
      <Stack.Item styles={{ root: { minWidth: 200 } }}>
        <TextField
          id="sales-postcode"
          label={salesSearchText.fields.postcode}
          placeholder={salesSearchText.placeholders.postcode}
          title={postcodeTitle}
          value={postcodeValue}
          onChange={onPostcodeChange}
          errorMessage={postcodeError}
          maxLength={12}
        />
      </Stack.Item>
    </>
  );
};
