import {
  LEG_FIELD,
  LEG_TYPE_FIELD,
  PREMIUM_TYPE_MAP,
  RULES_REQUIRED,
  STRIKE_TYPES_MAP,
} from '@/constants/common';
import { LEG_ENV } from '@/constants/legs';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { Form2 } from '@/containers';
import { legEnvIsBooking, legEnvIsPricing, getLegEnvs, getRequiredRule } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React from 'react';

export const MinimumPremium: ILegColDef = {
  title: '保底收益',
  dataIndex: LEG_FIELD.MINIMUM_PREMIUM,
  editable: record => {
    const { isBooking, isPricing, isEditing } = getLegEnvs(record);
    if (isEditing) {
      return false;
    }
    return true;
  },
  exsitable: record => {
    if (Form2.getFieldValue(record[LEG_FIELD.IS_ANNUAL])) {
      return true;
    }
    return false;
  },
  defaultEditing: () => false,
  render: (val, record, index, { form, editing, colDef }) => {
    const isBooking = legEnvIsBooking(record);
    const isPricing = legEnvIsPricing(record);

    /**
     * if (默认) {}
     * if (环境默认) {}
     * if (腿类型默认) {}
     * if (腿 + 环境 默认) {}
     * if (腿 + 环境) return;
     * if (腿) return;
     */
    const getProps = () => {
      if (_.get(record, [LEG_FIELD.PREMIUM_TYPE, 'value']) === PREMIUM_TYPE_MAP.CNY) {
        return { unit: '¥' };
      }
      return { unit: '%' };
    };

    return (
      <FormItem>
        {form.getFieldDecorator({
          rules: [getRequiredRule()],
        })(<UnitInputNumber autoSelect={true} editing={editing} {...getProps()} />)}
      </FormItem>
    );
  },
};
