import { COMPUTED_LEG_FIELD_MAP } from '@/constants/global';
import { COMPUTED_HEADER_CELL_STYLE } from '@/constants/legs';
import { Input } from '@/components';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

export const Gamma: ILegColDef = {
  title: 'GAMMA',
  dataIndex: COMPUTED_LEG_FIELD_MAP.GAMMA,
  defaultEditing: false,
  onHeaderCell: () => {
    return {
      style: COMPUTED_HEADER_CELL_STYLE,
    };
  },
  render: (value, record, index, { form, editing, colDef }) => {
    return <FormItem>{form.getFieldDecorator()(<Input editing={false} />)}</FormItem>;
  },
};
