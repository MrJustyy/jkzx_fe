import { Button } from 'antd';
import React from 'react';
import {
  INPUT_NUMBER_CURRENCY_CNY_CONFIG,
  INPUT_NUMBER_DIGITAL_CONFIG,
  INPUT_NUMBER_PERCENTAGE_DECIMAL_CONFIG,
  NOTION_ENUM_MAP,
  UNIT_ENUM_MAP,
  INPUT_NUMBER_DATE_CONFIG,
} from '@/constants/common';
import { IFormControl } from '@/containers/Form/types';

export const EXPIRATION_FIXED_FORM_CONTROLS: (notionalType) => IFormControl[] = notionalType => [
  {
    field: 'EXPIRE_NO_BARRIER_PREMIUM_TYPE',
    control: {
      label: '到期未敲出收益类型',
    },
    input: { disabled: true },
    decorator: {
      rules: [
        {
          required: true,
          message: '到期未敲出收益类型为必填项',
        },
      ],
    },
  },
  {
    field: 'NOTIONAL_AMOUNT',
    control: {
      label: notionalType === NOTION_ENUM_MAP.CNY ? '名义本金 (￥)' : '名义本金 (手)',
    },
    input: { ...INPUT_NUMBER_DIGITAL_CONFIG, disabled: true },
    decorator: {
      rules: [
        {
          required: true,
          message: '名义金额为必填项',
        },
      ],
    },
  },
  {
    field: 'MATURES',
    control: {
      label: '到期收益 (%)',
    },
    input: { ...INPUT_NUMBER_PERCENTAGE_DECIMAL_CONFIG, disabled: true },
    decorator: {
      rules: [
        {
          required: true,
          message: '到期收益 (%)为必填项',
        },
      ],
    },
  },
  {
    field: 'SETTLE_AMOUNT',
    control: {
      label: '结算金额',
    },
    input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
    decorator: {
      rules: [
        {
          required: true,
          message: '结算金额为必填项',
        },
      ],
    },
  },
];

export const EXPIRATION_CALL_PUT_FORM_CONTROLS: (
  notionalType,
  premiumType,
  handleSettleAmount,
) => IFormControl[] = (notionalType, premiumType, handleSettleAmount) => [
  {
    field: 'EXPIRE_NO_BARRIER_PREMIUM_TYPE',
    control: {
      label: '到期未敲出收益类型',
    },
    input: { disabled: true },
    decorator: {
      rules: [
        {
          required: true,
          message: '到期未敲出收益类型为必填项',
        },
      ],
    },
  },
  {
    field: 'NOTIONAL_AMOUNT',
    control: {
      label: notionalType === NOTION_ENUM_MAP.CNY ? '名义本金 (￥)' : '名义本金 (手)',
    },
    input: { ...INPUT_NUMBER_DIGITAL_CONFIG, disabled: true },
    decorator: {
      rules: [
        {
          required: true,
          message: '名义本金为必填项',
        },
      ],
    },
  },
  {
    field: 'UNDERLYER_PRICE',
    control: {
      label: '标的物结算价格',
    },
    input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
    decorator: {
      rules: [
        {
          required: true,
          message: '标的物结算价格为必填项',
        },
      ],
    },
  },
  {
    field: 'EXERCISE_PRICE',
    control: {
      label: premiumType === UNIT_ENUM_MAP.CNY ? '行权价 (￥)' : '行权价 (%)',
    },
    input: { ...INPUT_NUMBER_DIGITAL_CONFIG, disabled: true },
    decorator: {
      rules: [
        {
          required: true,
          message: '行权价为必填项',
        },
      ],
    },
  },
  {
    field: 'SETTLE_AMOUNT',
    control: {
      label: '结算金额',
    },
    input: {
      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
      after: (
        <Button key="upload" type="primary" onClick={handleSettleAmount}>
          试结算
        </Button>
      ),
    },
    decorator: {
      rules: [
        {
          required: true,
          message: '期权数量 (手)为必填项',
        },
      ],
    },
  },
  {
    field: 'paymentDate',
    control: {
      label: '支付日期',
    },
    input: INPUT_NUMBER_DATE_CONFIG,
    decorator: {
      rules: [
        {
          required: true,
          message: '支付日期为必填项',
        },
      ],
    },
  },
];

export const NOTIONAL_AMOUNT = 'NOTIONAL_AMOUNT';

export const UNDERLYER_PRICE = 'UNDERLYER_PRICE';

export const SETTLE_AMOUNT = 'SETTLE_AMOUNT';

export const MATURES = 'MATURES';

export const EXPIRE_NO_BARRIER_PREMIUM_TYPE = 'EXPIRE_NO_BARRIER_PREMIUM_TYPE';

export const EXERCISE_PRICE = 'EXERCISE_PRICE';
