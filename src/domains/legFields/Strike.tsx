import { LEG_FIELD, RULES_REQUIRED, STRIKE_TYPES_MAP } from '@/constants/common';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React from 'react';

const getProps = record => {
  if (_.get(record, [LEG_FIELD.STRIKE_TYPE, 'value']) === STRIKE_TYPES_MAP.CNY) {
    return { unit: '¥' };
  }

  if (_.get(record, [LEG_FIELD.STRIKE_TYPE, 'value']) === STRIKE_TYPES_MAP.USD) {
    return { unit: '$' };
  }

  if (_.get(record, [LEG_FIELD.STRIKE_TYPE, 'value']) === STRIKE_TYPES_MAP.PERCENT) {
    return { unit: '%' };
  }
  return { unit: '%' };
};

export const Strike: ILegColDef = {
  editable: true,
  title: '行权价',
  dataIndex: LEG_FIELD.STRIKE,
  render: (val, record, index, { form, editing }) => {
    return (
      <FormItem hasFeedback={true}>
        {form.getFieldDecorator({
          rules: RULES_REQUIRED,
        })(<UnitInputNumber autoSelect={true} editing={editing} {...getProps(record)} />)}
      </FormItem>
    );
  },
};
