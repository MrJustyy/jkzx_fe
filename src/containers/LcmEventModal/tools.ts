import BigNumber from 'bignumber.js';
import {
  BIG_NUMBER_CONFIG,
  KNOCK_DIRECTION_MAP,
  LEG_FIELD,
  OB_DAY_FIELD,
  NOTIONAL_AMOUNT_TYPE_MAP,
} from '@/constants/common';
import { isAutocallPhoenix, getMoment } from '@/tools';
import { OB_LIFE_PAYMENT, OB_PRICE_FIELD } from './constants';

// 计算周期收益总和
export const getObLifePayment = (
  alObPrice,
  cuponBarrier,
  preObdays,
  daysInYear,
  cuponPayment,
  notionalAmount,
  knockDirection,
  initialSpot,
) => {
  const computedCouponBarrier = new BigNumber(cuponBarrier)
    .multipliedBy(0.01)
    .multipliedBy(initialSpot)
    .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
    .toNumber();
  if (knockDirection === KNOCK_DIRECTION_MAP.UP) {
    if (alObPrice > computedCouponBarrier) {
      return new BigNumber(preObdays)
        .div(daysInYear)
        .multipliedBy(cuponPayment)
        .multipliedBy(notionalAmount)
        .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
        .toNumber();
    }
    return 0;
  }

  if (alObPrice < computedCouponBarrier) {
    return new BigNumber(preObdays)
      .div(daysInYear)
      .multipliedBy(cuponPayment)
      .multipliedBy(notionalAmount)
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber();
  }

  return 0;
};

export const getObservertionFieldData = data => {
  if (isAutocallPhoenix(data)) {
    const startDate = data[LEG_FIELD.EFFECTIVE_DATE];
    return data[LEG_FIELD.EXPIRE_NO_BARRIEROBSERVE_DAY].map((item, index) => {
      // 已观察到价格
      const alObPrice = item[OB_PRICE_FIELD];
      const cuponBarrier = data[LEG_FIELD.COUPON_BARRIER];
      const curObdays = getMoment(item[OB_DAY_FIELD]);
      const preObdays =
        index === 0
          ? curObdays.diff(getMoment(startDate), 'days')
          : curObdays.diff(
              getMoment(data[LEG_FIELD.EXPIRE_NO_BARRIEROBSERVE_DAY][index - 1][OB_DAY_FIELD]),
              'days',
            );
      const daysInYear = data[LEG_FIELD.DAYS_IN_YEAR];
      const cuponPayment = new BigNumber(data[LEG_FIELD.COUPON_PAYMENT])
        .multipliedBy(0.01)
        .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
        .toNumber();
      const notionalAmount =
        data[LEG_FIELD.NOTIONAL_AMOUNT_TYPE] === NOTIONAL_AMOUNT_TYPE_MAP.CNY
          ? data[LEG_FIELD.NOTIONAL_AMOUNT]
          : new BigNumber(data[LEG_FIELD.NOTIONAL_AMOUNT])
              .multipliedBy(data[LEG_FIELD.INITIAL_SPOT])
              .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
              .toNumber();
      const knockDirection = data[LEG_FIELD.KNOCK_DIRECTION];
      const initialSpot = data[LEG_FIELD.INITIAL_SPOT];

      return {
        ...item,
        [LEG_FIELD.UP_BARRIER]: data[LEG_FIELD.UP_BARRIER],
        [LEG_FIELD.COUPON_BARRIER]: data[LEG_FIELD.COUPON_BARRIER],
        [OB_LIFE_PAYMENT]: getObLifePayment(
          alObPrice,
          cuponBarrier,
          preObdays,
          daysInYear,
          cuponPayment,
          notionalAmount,
          knockDirection,
          initialSpot,
        ),
      };
    });
  }
  return data[LEG_FIELD.OBSERVATION_DATES];
};
