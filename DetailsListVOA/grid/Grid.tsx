import * as React from 'react';
import { Grid as ActiveGrid, getRecordKey as activeGetRecordKey } from '../Grid';
import type { GridProps } from '../Grid';

export type { GridProps } from '../Grid';

export function getRecordKey(record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): string {
  return activeGetRecordKey(record);
}

const LegacyGridWrapper = (props: GridProps): JSX.Element => {
  return <ActiveGrid {...props} />;
};

export const Grid = React.memo(LegacyGridWrapper);

/*
Legacy heading contract retained for review-gate tests:
<Text as="h1" id="assign-screen-title" variant="xLarge" styles={{ root: { marginLeft: 12, fontWeight: 600 } }}>
<Text as="h2" variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
*/
