import {
  LEG_FIELD,
  LEG_TYPE_FIELD,
  LEG_TYPE_MAP,
  PREMIUM_TYPE_MAP,
  RULES_REQUIRED,
  STRIKE_TYPES_MAP,
  REBATETYPE_TYPE_OPTIONS,
  OBSERVATION_TYPE_OPTIONS,
  REBATETYPE_UNIT_OPTIONS,
} from '@/constants/common';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { Form2, Select } from '@/containers';
import { legEnvIsBooking, legEnvIsPricing, getLegEnvs, getRequiredRule } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React from 'react';

export const LowRebate: ILegColDef = {
  title: '低敲出补偿价',
  dataIndex: LEG_FIELD.LOW_REBATE,
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
          rules: [getRequiredRule()],
        })(<UnitInputNumber autoSelect={true} unit="%" editing={editing} />)}
      </FormItem>
    );
  },
};
