import { LEG_FIELD, RULES_REQUIRED } from '@/constants/common';
import { DatePicker, Select } from '@/design/components';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

export const SettlementDate: ILegColDef = {
  editable: true,
  title: '结算日期',
  dataIndex: LEG_FIELD.SETTLEMENT_DATE,
  render: (val, record, index, { form, editing }) => {
    return (
      <FormItem hasFeedback={true}>
        {form.getFieldDecorator({
          rules: RULES_REQUIRED,
        })(
          <DatePicker format="YYYY-MM-DD" defaultOpen={true} autoSelect={true} editing={editing} />
        )}
      </FormItem>
    );
  },
  //   getValue: {
  //     depends: [LEG_FIELD.EXPIRATION_DATE],
  //     value: record => {
  //       return getMoment(record[LEG_FIELD.EXPIRATION_DATE], true);
  //     },
  //   },
};
