import { LEG_FIELD, PREMIUM_TYPE_MAP, RULES_REQUIRED } from '@/constants/common';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React from 'react';

const getProps = record => {
  if (_.get(record, [LEG_FIELD.PREMIUM_TYPE, 'value']) === PREMIUM_TYPE_MAP.CNY) {
    return { unit: '¥' };
  }
  return { unit: '%' };
};

export const FrontPremium: ILegColDef = {
  editable: true,
  // 权利金总和
  title: '合约期权费',
  dataIndex: LEG_FIELD.FRONT_PREMIUM,
  render: (val, record, index, { form, editing }) => {
    return (
      <FormItem hasFeedback={true}>
        {form.getFieldDecorator({
          rules: RULES_REQUIRED,
        })(<UnitInputNumber autoSelect={true} editing={editing} {...getProps(record)} />)}
      </FormItem>
    );
  },
  //   getValue: {
  //     depends: [LEG_FIELD.PREMIUM, LEG_FIELD.MINIMUM_PREMIUM],
  //     value: record => {
  //       if (record[LEG_FIELD.PREMIUM] === undefined && record[LEG_FIELD.MINIMUM_PREMIUM]) {
  //         return undefined;
  //       }
  //       return new BigNumber(record[LEG_FIELD.PREMIUM] || 0)
  //         .plus(record[LEG_FIELD.MINIMUM_PREMIUM] || 0)
  //         .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
  //         .toNumber();
  //     },
  //   },
};
