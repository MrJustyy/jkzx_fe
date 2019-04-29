import { LEG_FIELD, RULES_REQUIRED } from '@/constants/common';
import { Input } from '@/design/components/Input';
import { getLegEnvs } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

export const Comment: ILegColDef = {
  title: '备注',
  dataIndex: LEG_FIELD.COMMENT,
  editable: record => {
    const { isBooking, isPricing, isEditing } = getLegEnvs(record);
    if (isEditing) {
      return false;
    }
    return true;
  },
  defaultEditing: record => {
    return false;
  },
  render: (val, record, index, { form, editing, colDef }) => {
    // const { isBooking, isPricing, isEditing } = getLegEnvs(record);

    return (
      <FormItem>
        {form.getFieldDecorator({
          rules: RULES_REQUIRED,
        })(<Input autoSelect={true} editing={editing} />)}
      </FormItem>
    );
  },
};
