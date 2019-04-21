import {
  LEG_FIELD,
  LEG_TYPE_FIELD,
  LEG_TYPE_MAP,
  PREMIUM_TYPE_MAP,
  RULES_REQUIRED,
} from '@/constants/common';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { Form2 } from '@/design/components';
import { legEnvIsBooking } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React from 'react';

const getProps = record => {
  if (Form2.getFieldValue(record[LEG_TYPE_FIELD]) === LEG_TYPE_MAP.BARRIER) {
    if (Form2.getFieldValue(record[LEG_FIELD.PREMIUM_TYPE]) === PREMIUM_TYPE_MAP.CNY) {
      return { unit: '¥' };
    }
    if (Form2.getFieldValue(record[LEG_FIELD.PREMIUM_TYPE]) === PREMIUM_TYPE_MAP.USD) {
      return { unit: '$' };
    }
    if (Form2.getFieldValue(record[LEG_FIELD.PREMIUM_TYPE]) === PREMIUM_TYPE_MAP.PERCENT) {
      return { unit: '%' };
    }
  }

  if (Form2.getFieldValue(record[LEG_FIELD.PREMIUM_TYPE]) === PREMIUM_TYPE_MAP.CNY) {
    return { unit: '¥' };
  }

  return { unit: '%' };
};

export const Premium: ILegColDef = {
  editable: record => {
    if (_.get(record, [LEG_TYPE_FIELD, 'value']) === LEG_TYPE_MAP.DIGITAL) {
      return false;
    }
    if (legEnvIsBooking(record)) {
      return false;
    }
    return true;
  },
  title: '实际期权费',
  dataIndex: LEG_FIELD.PREMIUM,
  render: (val, record, index, { form, editing, colDef }) => {
    const isBooking = legEnvIsBooking(record);
    return (
      <FormItem hasFeedback={true}>
        {form.getFieldDecorator({
          rules: RULES_REQUIRED,
        })(
          <UnitInputNumber
            autoSelect={!isBooking}
            editing={isBooking ? true : editing}
            {...getProps(record)}
          />
        )}
      </FormItem>
    );
  },
};
