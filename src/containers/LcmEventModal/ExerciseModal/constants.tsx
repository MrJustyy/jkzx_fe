import { Button } from 'antd';
import React from 'react';
import {
  INPUT_NUMBER_CURRENCY_CNY_CONFIG,
  INPUT_NUMBER_DIGITAL_CONFIG,
  NOTION_ENUM_MAP,
  LEG_TYPE_MAP,
} from '@/constants/common';
import { IFormControl } from '@/containers/Form/types';

export const EXERCISE_FORM_CONTROLS: (
  notionalType,
  handleSettleAmount,
  productType,
) => IFormControl[] = (notionalType, handleSettleAmount, productType) => {
  const noExerciseArray = [
    'STRADDLE',
    'EAGLE',
    'CONCAVA',
    'CONVEX',
    'TRIPLE_DIGITAL',
    'DOUBLE_TOUCH',
    'DOUBLE_NO_TOUCH',
    'DOUBLE_DIGITAL',
    'DOUBLE_SHARK_FIN',
  ];
  if (productType.includes('SPREAD_EUROPEAN')) {
    return [
      // {
      //   field: 'NUM_OF_OPTIONS',
      //   control: {
      //     label: '期权数量 (手)',
      //   },
      //   input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG, disabled: true },
      //   decorator: {
      //     rules: [
      //       {
      //         required: true,
      //         message: '期权数量 (手)为必填项',
      //       },
      //     ],
      //   },
      // },
      {
        field: 'NOTIONAL_AMOUNT',
        control: {
          label: '名义本金 (￥)',
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
        field: 'UNDERLYER_PRICE1',
        control: {
          label: '标的物结算价格1',
        },
        input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG },
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
        field: 'UNDERLYER_PRICE2',
        control: {
          label: '标的物结算价格2',
        },
        input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG },
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
              message: '结算金额为必填项',
            },
          ],
        },
      },
    ];
  }
  return [
    {
      field: 'NUM_OF_OPTIONS',
      control: {
        label: '期权数量 (手)',
      },
      input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG, disabled: true },
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
      field: 'NOTIONAL_AMOUNT',
      control: {
        label: '名义本金 (￥)',
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
      field: 'UNDERLYER_PRICE',
      control: {
        label: '标的物结算价格',
      },
      input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG },
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
      field: 'SETTLE_AMOUNT',
      control: {
        label: '结算金额',
      },
      input: {
        ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
        ...(noExerciseArray.includes(productType)
          ? {}
          : {
              after: (
                <Button key="upload" type="primary" onClick={handleSettleAmount}>
                  试结算
                </Button>
              ),
            }),
      },
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
};

export const NUM_OF_OPTIONS = 'NUM_OF_OPTIONS';

export const NOTIONAL_AMOUNT = 'NOTIONAL_AMOUNT';

export const UNDERLYER_PRICE = 'UNDERLYER_PRICE';

export const UNDERLYER_PRICE1 = 'UNDERLYER_PRICE1';

export const UNDERLYER_PRICE2 = 'UNDERLYER_PRICE2';

export const SETTLE_AMOUNT = 'SETTLE_AMOUNT';
