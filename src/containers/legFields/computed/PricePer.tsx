import { COMPUTED_LEG_FIELD_MAP } from '@/constants/global';
import { COMPUTED_HEADER_CELL_STYLE } from '@/constants/legs';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

export const PricePer: ILegColDef = {
  title: '百分比价格',
  dataIndex: COMPUTED_LEG_FIELD_MAP.PRICE_PER,
  defaultEditing: false,
  onHeaderCell: () => {
    return {
      style: COMPUTED_HEADER_CELL_STYLE,
    };
  },
  getUnit: () => '%',
  render: (value, record, index, { form, editing, colDef }) => {
    return (
      <FormItem>{form.getFieldDecorator()(<UnitInputNumber unit="%" editing={false} />)}</FormItem>
    );
  },
};
