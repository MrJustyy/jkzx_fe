import { LEG_FIELD, PREMIUM_TYPE_MAP, RULES_REQUIRED } from '@/constants/common';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { legEnvIsBooking, legEnvIsPricing, getRequiredRule } from '@/tools';
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
  // 权利金总和
  title: '合约期权费',
  dataIndex: LEG_FIELD.FRONT_PREMIUM,
  editable: record => {
    const isBooking = legEnvIsBooking(record);
    const isPricing = legEnvIsPricing(record);
    if (isBooking || isPricing) {
      return true;
    }
    return false;
  },
  exsitable: record => {
    if (_.get(record, [LEG_FIELD.IS_ANNUAL, 'value'])) {
      return true;
    }
    return false;
  },
  render: (val, record, index, { form, editing, colDef }) => {
    const isBooking = legEnvIsBooking(record);
    const isPricing = legEnvIsPricing(record);
    return (
      <FormItem>
        {form.getFieldDecorator({
          rules: [getRequiredRule()],
        })(
          <UnitInputNumber
            autoSelect={isBooking || isPricing}
            editing={isBooking || isPricing ? editing : false}
            {...getProps(record)}
          />
        )}
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
