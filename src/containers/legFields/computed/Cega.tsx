import { COMPUTED_LEG_FIELD_MAP } from '@/constants/global';
import { COMPUTED_HEADER_CELL_STYLE } from '@/constants/legs';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

export const Cega: ILegColDef = {
  title: 'CEGA',
  dataIndex: COMPUTED_LEG_FIELD_MAP.CEGA,
  defaultEditing: false,
  onHeaderCell: () => {
    return {
      style: COMPUTED_HEADER_CELL_STYLE,
    };
  },
  getUnit: () => '手',
  render: (value, record, index, { form, editing, colDef }) => {
    return (
      <FormItem>{form.getFieldDecorator()(<UnitInputNumber unit="手" editing={false} />)}</FormItem>
    );
  },
};
