import { LEG_FIELD, RULES_REQUIRED, STRIKE_TYPES_MAP } from '@/constants/common';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { legEnvIsBooking, legEnvIsPricing, getLegEnvs } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React from 'react';
import { Form2 } from '@/design/components';

const getProps = record => {
  const val = Form2.getFieldValue(record[LEG_FIELD.STRIKE_TYPE]);
  if (val === STRIKE_TYPES_MAP.CNY) {
    return { unit: '¥' };
  }
  if (val === STRIKE_TYPES_MAP.USD) {
    return { unit: '$' };
  }
  if (val === STRIKE_TYPES_MAP.PERCENT) {
    return { unit: '%' };
  }
  return { unit: '%' };
};

export const Strike: ILegColDef = {
  title: '行权价',
  dataIndex: LEG_FIELD.STRIKE,
  editable: record => {
    const { isBooking, isPricing, isEditing } = getLegEnvs(record);
    if (isEditing) {
      return false;
    }
    return true;
  },
  render: (val, record, index, { form, editing, colDef }) => {
    const { isBooking, isPricing, isEditing } = getLegEnvs(record);
    const getUnit = () => {
      const val = Form2.getFieldValue(record[LEG_FIELD.STRIKE_TYPE]);
      if (val === STRIKE_TYPES_MAP.CNY) {
        return '¥';
      }
      if (val === STRIKE_TYPES_MAP.USD) {
        return '$';
      }
      if (val === STRIKE_TYPES_MAP.PERCENT) {
        return '%';
      }
      return '%';
    };

    return (
      <FormItem>
        {form.getFieldDecorator({
          rules: RULES_REQUIRED,
        })(
          <UnitInputNumber
            autoSelect={isBooking || isPricing}
            editing={isBooking || isPricing ? editing : false}
            unit={getUnit()}
          />
        )}
      </FormItem>
    );
  },
};
