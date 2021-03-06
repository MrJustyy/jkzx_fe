import { LEG_FIELD, RULES_REQUIRED } from '@/constants/common';
import { DatePicker, Select } from '@/containers';
import { legEnvIsBooking, legEnvIsPricing, getRequiredRule } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

export const EffectiveDate: ILegColDef = {
  title: '起始日',
  dataIndex: LEG_FIELD.EFFECTIVE_DATE,
  editable: record => {
    const isBooking = legEnvIsBooking(record);
    const isPricing = legEnvIsPricing(record);
    if (isBooking || isPricing) {
      return true;
    }
    return false;
  },
  defaultEditing: false,
  render: (value, record, index, { form, editing, colDef }) => {
    return (
      <FormItem>
        {form.getFieldDecorator({
          rules: [getRequiredRule()],
        })(
          <DatePicker
            defaultOpen={true}
            editing={editing}
            {...{
              format: 'YYYY-MM-DD',
            }}
          />
        )}
      </FormItem>
    );
  },
};
