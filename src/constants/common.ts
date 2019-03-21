import { AllInputProps } from '@/lib/components/_Form2/Input';
import { convertOptions } from '@/utils';

export const BOOK_NAME_FIELD = 'bookName';

export const TRADE_ID_FIELD = 'tradeId';

export const LEG_TYPE_FIELD = '$legType';

export const LEG_ID_FIELD = 'id';

export const LEG_NAME_FIELD = '$legName';

export const LEG_ANNUALIZED_FIELD = '$isAnnualized';

export const RULES_REQUIRED = [
  {
    required: true,
  },
];

export const INPUT_NUMBER_DATE_CONFIG: AllInputProps = {
  type: 'date',
};

export const INPUT_NUMBER_DATE_TIME_CONFIG: AllInputProps = {
  type: 'date',
  showTime: true,
  format: 'YYYY-MM-DD HH:mm:ss',
};

export const INPUT_NUMBER_DIGITAL_CONFIG: AllInputProps = {
  type: 'number',
  precision: 4,
  format: '0,0.0000 de',
};

export const INPUT_NUMBER_DAYS_CONFIG: AllInputProps = {
  type: 'number',
  format: '0 days',
};

export const INPUT_NUMBER_CURRENCY_CNY_CONFIG: AllInputProps = {
  type: 'number',
  precision: 4,
  format: '¥ 0,0.0000',
};

export const INPUT_NUMBER_CURRENCY_USD_CONFIG: AllInputProps = {
  type: 'number',
  precision: 4,
  format: '$ 0,0.0000',
};

export const INPUT_NUMBER_PERCENTAGE_CONFIG: AllInputProps = {
  type: 'number',
  precision: 4,
  format: '0.0000 pe',
};

export const INPUT_NUMBER_PERCENTAGE_DECIMAL_CONFIG: AllInputProps = {
  type: 'number',
  precision: 4,
  format: '0.0000 pde',
};

export const INPUT_NUMBER_LOT_CONFIG: AllInputProps = {
  type: 'number',
  precision: 4,
  format: '0.0000 ss',
};

export const EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP = {
  FIXED: 'FIXED',
  CALL: 'CALL',
  PUT: 'PUT',
};

export const EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP = {
  FIXED: '固定',
  CALL: '看涨',
  PUT: '看跌',
};

export const EXPIRE_NO_BARRIER_PREMIUM_TYPE_OPTIONS = convertOptions(
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP,
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP
);

export const DIRECTION_TYPE_MAP = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
};

export const DIRECTION_TYPE_ZHCN_MAP = {
  BUYER: '买',
  SELLER: '卖',
};

export const DIRECTION_TYPE_OPTIONS = convertOptions(DIRECTION_TYPE_MAP, DIRECTION_TYPE_ZHCN_MAP);

// 事件通知类型
export const EVENT_TYPE_MAP = {
  EXPIRATION: 'EXPIRATION',
  KNOCK_OUT: 'KNOCK_OUT',
  PAYMENT: 'PAYMENT',
  OBSERVATION: 'OBSERVATION',
};

export const EVENT_TYPE_ZHCN_MAP = {
  EXPIRATION: '到期',
  KNOCK_OUT: '敲出',
  PAYMENT: '支付',
  OBSERVATION: '观察',
};

export const EVENT_TYPE_OPTIONS = convertOptions(EVENT_TYPE_MAP, EVENT_TYPE_ZHCN_MAP);

export const LCM_EVENT_TYPE_MAP = {
  OPEN: 'OPEN',
  UNWIND: 'UNWIND',
  EXPIRATION: 'EXPIRATION',
  EXERCISE: 'EXERCISE',
  KNOCK_OUT: 'KNOCK_OUT',
  KNOCK_IN: 'KNOCK_IN',
  DIVIDEND: 'DIVIDEND',
  PAYMENT: 'PAYMENT',
  ROLL: 'ROLL',
  CLOSED: 'CLOSED',
  UNWIND_PARTIAL: 'UNWIND_PARTIAL',
  OBSERVE: 'OBSERVE',
};

export const LCM_EVENT_TYPE_ZHCN_MAP = {
  EXPIRATION: '到期',
  KNOCK_OUT: '敲出',
  PAYMENT: '支付',
  OBSERVATION: '观察',
  OPEN: '开仓',
  UNWIND: '平仓',
  EXERCISE: '行权',
  KNOCK_IN: '敲入',
  DIVIDEND: '分红',
  ROLL: '展期',
  CLOSED: '结束',
  UNWIND_PARTIAL: '部分平仓',
  OBSERVE: '观察',
};

export const FREQUENCY_TYPE_MAP = {
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
  '3M': '3M',
  '6M': '6M',
  '1Y': '1Y',
};

export const FREQUENCY_TYPE_ZHCN_MAP = {
  '1D': '1天',
  '1W': '1周',
  '1M': '1月',
  '3M': '3月',
  '6M': '6月',
  '1Y': '1年',
};

export const FREQUENCY_TYPE_NUM_MAP = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

export const FREQUENCY_TYPE_OPTIONS = convertOptions(FREQUENCY_TYPE_MAP, FREQUENCY_TYPE_ZHCN_MAP);

export const LCM_EVENT_TYPE_OPTIONS = convertOptions(LCM_EVENT_TYPE_MAP, LCM_EVENT_TYPE_ZHCN_MAP);

export const UNIT_ENUM_ZHCN_MAP = {
  CNY: '人民币',
  PERCENT: '百分比',
  USD: '美元',
};

export const UNIT_ENUM_MAP = {
  CNY: 'CNY',
  PERCENT: 'PERCENT',
  USD: 'USD',
};

export const UNIT_ENUM_OPTIONS = Object.keys(UNIT_ENUM_MAP).map(key => ({
  label: UNIT_ENUM_ZHCN_MAP[key],
  value: UNIT_ENUM_MAP[key],
}));

export const UNIT_ENUM_ZHCN_MAP2 = {
  CNY: '人民币',
  PERCENT: '百分比',
};

export const UNIT_ENUM_MAP2 = {
  CNY: 'CNY',
  PERCENT: 'PERCENT',
};

export const UNIT_ENUM_OPTIONS2 = Object.keys(UNIT_ENUM_MAP2).map(key => ({
  label: UNIT_ENUM_ZHCN_MAP2[key],
  value: UNIT_ENUM_MAP2[key],
}));

export const KNOCK_DIRECTION_ZHCN_MAP = {
  UP: '向上',
  DOWN: '向下',
};

export const DIRECTION_MAP = {
  BUY: 'BUYER',
  SELL: 'SELLER',
};

export const DIRECTION_ZHCN_MAP = {
  BUY: '买',
  SELL: '卖',
};

export const DIRECTION_OPTIONS = convertOptions(DIRECTION_MAP, DIRECTION_ZHCN_MAP);

export const KNOCK_DIRECTION_MAP = {
  UP: 'UP',
  DOWN: 'DOWN',
};

export const KNOCK_DIRECTION_OPTIONS = Object.keys(KNOCK_DIRECTION_MAP).map(key => ({
  label: KNOCK_DIRECTION_ZHCN_MAP[key],
  value: KNOCK_DIRECTION_MAP[key],
}));

export const UP_BARRIER_TYPE_MAP = {
  CNY: 'CNY',
  PERCENT: 'PERCENT',
};

export const UP_BARRIER_TYPE_ZHCN_MAP = {
  CNY: '人民币',
  PERCENT: '百分比',
};

export const UP_BARRIER_TYPE_OPTIONS = Object.keys(UP_BARRIER_TYPE_MAP).map(key => ({
  label: UP_BARRIER_TYPE_ZHCN_MAP[key],
  value: UP_BARRIER_TYPE_MAP[key],
}));

export const OPTION_TYPE_ZHCN_MAP = {
  CALL: '看涨',
  PUT: '看跌',
};

export const OPTION_TYPE_MAP = {
  CALL: 'CALL',
  PUT: 'PUT',
};

export const OPTION_TYPE_OPTIONS = Object.keys(OPTION_TYPE_MAP).map(key => ({
  label: OPTION_TYPE_ZHCN_MAP[key],
  value: OPTION_TYPE_MAP[key],
}));

export const OBSERVATION_TYPE_ZHCN_MAP = {
  TERMINAL: '到期观察',
  // DISCRETE: '离散观察',
  DAILY: '每日观察',
  CONTINUOUS: '连续观察',
};

export const OBSERVATION_TYPE_MAP = {
  TERMINAL: 'TERMINAL',
  // DISCRETE: 'DISCRETE',
  CONTINUOUS: 'CONTINUOUS',
  DAILY: 'DAILY',
};

export const OBSERVATION_TYPE_OPTIONS = Object.keys(OBSERVATION_TYPE_MAP).map(key => ({
  label: OBSERVATION_TYPE_ZHCN_MAP[key],
  value: OBSERVATION_TYPE_MAP[key],
}));

export const PAYMENT_TYPE_MAP = {
  CNY: 'CNY',
  PERCENT: 'PERCENT',
};

export const STRIKE_TYPES_MAP = UNIT_ENUM_MAP;

export const NOTIONAL_AMOUNT_TYPE_MAP = {
  LOT: 'LOT',
  CNY: 'CNY',
};

export const PREMIUM_TYPE_MAP = UNIT_ENUM_MAP;

export const PREMIUM_TYPE_ZHCN_MAP = UNIT_ENUM_ZHCN_MAP;

export const PREMIUM_TYPE_OPTIONS = Object.keys(PREMIUM_TYPE_MAP).map(key => ({
  label: PREMIUM_TYPE_ZHCN_MAP[key],
  value: PREMIUM_TYPE_MAP[key],
}));

export const SPECIFIED_PRICE_MAP = {
  CLOSE: 'CLOSE',
  OPEN: 'OPEN',
  OSP: 'OSP',
  TWAP: 'TWAP',
  XETRA: 'XETRA',
  SPECIFIC_TIME: 'SPECIFIC_TIME',
  DERIVATIVES_CLOSE: 'DERIVATIVES_CLOSE',
};

export const SPECIFIED_PRICE_ZHCN_MAP = {
  CLOSE: '收盘价',
  TWAP: '平均价',
  SPECIFIC_TIME: '固定时间',
  OPEN: '开盘价',
  OSP: '交割价',
  XETRA: '交易所交割价',
  DERIVATIVES_CLOSE: '标的收盘价',
};

export const REBATETYPE_TYPE_MAP = {
  PAY_NONE: 'PAY_NONE',
  PAY_WHEN_HIT: 'PAY_WHEN_HIT',
  PAY_AT_EXPIRY: 'PAY_AT_EXPIRY',
};

export const REBATETYPE_TYPE_ZHCN_MAP = {
  PAY_NONE: '不支付',
  PAY_WHEN_HIT: '立即支付',
  PAY_AT_EXPIRY: '到期支付',
};

export const REBATETYPE_TYPE_OPTIONS = Object.keys(REBATETYPE_TYPE_MAP).map(key => ({
  label: REBATETYPE_TYPE_ZHCN_MAP[key],
  value: REBATETYPE_TYPE_MAP[key],
}));

export const REBATETYPE_UNIT_MAP = UNIT_ENUM_MAP;

export const REBATETYPE_UNIT_OPTIONS = UNIT_ENUM_OPTIONS;

/**
 * 多腿字段名
 */
export const LEG_FIELD = {
  /* 观察日 */
  OBSERVATION_DATES: 'OBSERVATION_DATES',
  /* 观察频率 */
  // OBSERVATION_STEP: 'observationDayStep',
  OBSERVATION_STEP: 'observationStep',
  OBSERVE_START_DAY: 'OBSERVE_START_DAY',
  OBSERVE_END_DAY: 'OBSERVE_END_DAY',
  AUTO_CALL_STRIKE: 'autoCallStrike',
  AUTO_CALL_STRIKE_UNIT: 'autoCallStrikeUnit',
  /* 收益/coupon(%) */
  COUPON_PAYMENT: 'couponPayment',
  /* 敲出/coupon观察日 */
  EXPIRE_NO_BARRIEROBSERVE_DAY: 'observationDates',
  /* 到期未敲出收益类型 */
  EXPIRE_NOBARRIER_PREMIUM_TYPE: 'autoCallPaymentType',
  /* 到期未敲出固定收益 */
  EXPIRE_NOBARRIERPREMIUM: 'fixedPayment',
  STEP: 'step',
  UP_BARRIER: 'upBarrier',
  UP_BARRIER_TYPE: 'upBarrierType',
  ALUNWIND_NOTIONAL_AMOUNT: 'historyValue',
  INITIAL_NOTIONAL_AMOUNT: 'initialValue',
  LCM_EVENT_TYPE: 'lcmEventType',
  BARRIER_DIRECTION: 'barrierDirection',
  MINIMUM_PREMIUM: 'minimumPremium',
  FRONT_PREMIUM: 'frontPremium',
  PREMIUM: 'premium',
  DAYS_IN_YEAR: 'daysInYear',
  SETTLEMENT_DATE: 'settlementDate',
  EXPIRATION_DATE: 'expirationDate', // 到期日
  EFFECTIVE_DATE: 'effectiveDate',
  INITIAL_SPOT: 'initialSpot',
  DIRECTION: 'direction',
  PAY_OFF_TYPE: 'payOffType',
  PAY_OFF: 'payOff',
  UNDERLYER_INSTRUMENT_ID: 'underlyerInstrumentId',
  STRIKE_TYPE: 'strikeType',
  NOTIONAL_AMOUNT_TYPE: 'notionalAmountType',
  PREMIUM_TYPE: 'premiumType',
  SPECIFIED_PRICE: 'specifiedPrice',
  UNDERLYER_MULTIPLIER: 'underlyerMultiplier', // 合约乘数
  PAYMENT_TYPE: 'paymentType',
  STRIKE: 'strike',
  STRIKE1: 'strike1',
  STRIKE2: 'strike2',
  STRIKE3: 'strike3',
  STRIKE4: 'strike4',
  PAYMENT: 'payment',
  PAYMENT1: 'payment1',
  PAYMENT2: 'payment2',
  PAYMENT3: 'payment3',
  HIGH_PAYMENT: 'highPayment',
  LOW_PAYMENT: 'lowPayment',
  KNOCK_DIRECTION: 'knockDirection',
  PARTICIPATION_RATE: 'participationRate',
  LOW_PARTICIPATION_RATE: 'lowParticipationRate',
  HIGH_PARTICIPATION_RATE: 'highParticipationRate',
  PARTICIPATION_RATE1: 'participationRate1',
  PARTICIPATION_RATE2: 'participationRate2',
  // 敲出补偿类型
  REBATE_TYPE: 'rebateType',
  REBATE_UNIT: 'rebateUnit',
  // 敲出补偿
  REBATE: 'rebate',
  LOW_REBATE: 'lowRebate',
  HIGH_REBATE: 'highRebate',
  BARRIER_TYPE: 'barrierType',
  OBSERVATION_TYPE: 'observationType',
  OPTION_TYPE: 'optionType',
  TERM: 'term',
  NOTIONAL_AMOUNT: 'notionalAmount',
  LOW_STRIKE: 'lowStrike',
  HIGH_STRIKE: 'highStrike',
  BARRIER: 'barrier',
  LOW_BARRIER: 'lowBarrier',
  HIGH_BARRIER: 'highBarrier',
};

/**
 * 多腿权益
 */
export const ASSET_CLASS_MAP = {
  EQUITY: 'EQUITY',
  COMMODITY: 'COMMODITY',
  RATES: 'RATES',
  FX: 'FX',
  CREDIT: 'CREDIT',
  OTHER: 'OTHER',
};

export const ASSET_CLASS_ZHCN_MAP = {
  EQUITY: '权益',
  COMMODITY: '商品',
  RATES: '利率',
  FX: '外汇',
  CREDIT: '信用',
  OTHER: '其他',
};

export const INSTRUMENT_TYPE_MAP = {
  STOCK: 'STOCK',
  INDEX: 'INDEX',
  INDEX_FUTURES: 'INDEX_FUTURES',
  SPOT: 'SPOT',
  FUTURES: 'FUTURES',
};

export const INSTRUMENT_TYPE_ZHCN_MAP = {
  STOCK: '股票',
  INDEX: '股指',
  INDEX_FUTURES: '股指期货',
  SPOT: '现货',
  FUTURES: '期货',
};

export const ASSET_TYPE_MAP = {
  STOCK: 'STOCK',
  COMMODITY: 'COMMODITY',
};

export const ASSET_TYPE_ZHCN_MAP = {
  STOCK: '股票',
  COMMODITY: '商品',
};

export const ASSET_TYPE_OPTIONS = convertOptions(ASSET_TYPE_MAP, ASSET_TYPE_ZHCN_MAP);

// export const SURVIVAL_STATUS_MAP = {
//   LIVE: 'LIVE',
//   MATURED: 'MATURED',
//   CLOSED: 'CLOSED',
// };

// export const SURVIVAL_STATUS_ZHCN_MAP = {
//   LIVE: '股票',
//   MATURED: '商品',
//   CLOSED: '',
// };

// export const SURVIVAL_STATUS_OPTIONS = convertOptions(
//   SURVIVAL_STATUS_MAP,
//   SURVIVAL_STATUS_ZHCN_MAP
// );

export const EXERCISETYPE_MAP = {
  EUROPEAN: 'EUROPEAN',
  AMERICAN: 'AMERICAN',
};

export const EXTRA_FIELDS = ['positionId', 'quantity', 'lcmEventType', 'productType'];

export const LEG_INJECT_FIELDS = [
  LEG_ID_FIELD,
  LEG_TYPE_FIELD,
  LEG_NAME_FIELD,
  LEG_ANNUALIZED_FIELD,
];

export const BIG_NUMBER_CONFIG = {
  DECIMAL_PLACES: 4,
};

/**
 * 多腿类型
 */
export const LEG_TYPE_MAP = {
  ASIAN: 'ASIAN',
  ASIAN_ANNUAL: 'ASIAN_ANNUAL',
  ASIAN_UNANNUAL: 'ASIAN_UNANNUAL',
  AUTO_CALL_SNOW: 'AUTOCALL',
  AUTO_CALL_SNOW_ANNUAL: 'AUTO_CALL_SNOW_ANNUAL',
  AUTO_CALL_SNOW_UNANNUAL: 'AUTO_CALL_SNOW_UNANNUAL',
  GENERIC_SINGLE_ASSET_OPTION: 'GENERIC_SINGLE_ASSET_OPTION',
  VANILLA_EUROPEAN: 'VANILLA_EUROPEAN',
  VANILLA_EUROPEAN_ANNUAL: 'VANILLA_EUROPEAN_ANNUAL',
  VANILLA_EUROPEAN_UNANNUAL: 'VANILLA_EUROPEAN_UNANNUAL',
  VANILLA_AMERICAN: 'VANILLA_AMERICAN',
  VANILLA_AMERICAN_ANNUAL: 'VANILLA_AMERICAN_ANNUAL',
  VANILLA_AMERICAN_UNANNUAL: 'VANILLA_AMERICAN_UNANNUAL',
  CALL_SPREAD: 'CALL_SPREAD',
  CALL_SPREAD_COMBO: 'CALL_SPREAD_COMBO',
  BASKET: 'BASKET',
  CASH_PRODUCT: 'CASH_PRODUCT',
  FUTURE: 'FUTURE',
  Index: 'Index',
  OTHER: 'OTHER',
  DIGITAL: 'DIGITAL',
  DIGITAL_AMERICAN_ANNUAL: 'DIGITAL_AMERICAN_ANNUAL',
  DIGITAL_AMERICAN_UNANNUAL: 'DIGITAL_AMERICAN_UNANNUAL',
  DIGITAL_EUROPEAN_ANNUAL: 'DIGITAL_EUROPEAN_ANNUAL',
  DIGITAL_EUROPEAN_UNANNUAL: 'DIGITAL_EUROPEAN_UNANNUAL',
  VERTICAL_SPREAD: 'VERTICAL_SPREAD',
  VERTICAL_SPREAD_EUROPEAN_UNANNUAL: 'VERTICAL_SPREAD_EUROPEAN_UNANNUAL',
  VERTICAL_SPREAD_EUROPEAN_ANNUAL: 'VERTICAL_SPREAD_EUROPEAN_ANNUAL',
  BARRIER: 'BARRIER',
  BARRIER_ANNUAL: 'BARRIER_ANNUAL',
  BARRIER_UNANNUAL: 'BARRIER_UNANNUAL',
  DOUBLE_SHARK_FIN: 'DOUBLE_SHARK_FIN',
  DOUBLE_SHARK_FIN_ANNUAL: 'DOUBLE_SHARK_FIN_ANNUAL',
  DOUBLE_SHARK_FIN_UNANNUAL: 'DOUBLE_SHARK_FIN_UNANNUAL',
  EAGLE: 'EAGLE',
  EAGLE_ANNUAL: 'EAGLE_ANNUAL',
  EAGLE_UNANNUAL: 'EAGLE_UNANNUAL',
  DOUBLE_TOUCH: 'DOUBLE_TOUCH',
  DOUBLE_TOUCH_ANNUAL: 'DOUBLE_TOUCH_ANNUAL',
  DOUBLE_TOUCH_UNANNUAL: 'DOUBLE_TOUCH_UNANNUAL',
  DOUBLE_NO_TOUCH: 'DOUBLE_NO_TOUCH',
  DOUBLE_NO_TOUCH_ANNUAL: 'DOUBLE_NO_TOUCH_ANNUAL',
  DOUBLE_NO_TOUCH_UNANNUAL: 'DOUBLE_NO_TOUCH_UNANNUAL',
  CONCAVA: 'CONCAVA',
  CONCAVA_ANNUAL: 'CONCAVA_ANNUAL',
  CONCAVA_UNANNUAL: 'CONCAVA_UNANNUAL',
  CONVEX: 'CONVEX',
  CONVEX_ANNUAL: 'CONVEX_ANNUAL',
  CONVEX_UNANNUAL: 'CONVEX_UNANNUAL',
  DOUBLE_DIGITAL: 'DOUBLE_DIGITAL',
  DOUBLE_DIGITAL_ANNUAL: 'DOUBLE_DIGITAL_ANNUAL',
  DOUBLE_DIGITAL_UNANNUAL: 'DOUBLE_DIGITAL_UNANNUAL',
  TRIPLE_DIGITAL: 'TRIPLE_DIGITAL',
  TRIPLE_DIGITAL_ANNUAL: 'TRIPLE_DIGITAL_ANNUAL',
  TRIPLE_DIGITAL_UNANNUAL: 'TRIPLE_DIGITAL_UNANNUAL',
  RANGE_ACCRUALS: 'RANGE_ACCRUALS',
  RANGE_ACCRUALS_ANNUAL: 'RANGE_ACCRUALS_ANNUAL',
  RANGE_ACCRUALS_UNANNUAL: 'RANGE_ACCRUALS_UNANNUAL',
  STRADDLE: 'STRADDLE',
  STRADDLE_ANNUAL: 'STRADDLE_ANNUAL',
  STRADDLE_UNANNUAL: 'STRADDLE_UNANNUAL',
};

export const PRODUCT_TYPE_MAP = {
  ...LEG_TYPE_MAP,
};

export const PRODUCT_TYPE_ZHCN_MAP = {
  ASIA: '亚式',
  [LEG_TYPE_MAP.ASIAN_ANNUAL]: '亚式 - 年化',
  [LEG_TYPE_MAP.ASIAN_UNANNUAL]: '亚式 - 非年化',
  AUTO_CALL_SNOW: 'AutoCall',
  AUTO_CALL_SNOW_ANNUAL: 'AutoCall - 雪球式 - 年化',
  CASH: '现金',
  GENERIC_SINGLE_ASSET_OPTION: '其他单资产期权',
  VANILLA_EUROPEAN: '香草欧式',
  VANILLA_EUROPEAN_ANNUAL: '欧式年化',
  VANILLA_EUROPEAN_UNANNUAL: '欧式非年华',
  VANILLA_AMERICAN: '香草美式',
  VANILLA_AMERICAN_ANNUAL: '美式年化',
  VANILLA_AMERICAN_UNANNUAL: '美式非年化',
  CALL_SPREAD: '价差',
  CALL_SPREAD_COMBO: '价差-分解',
  AUTOCALL: 'AutoCall',
  BASKET: '篮子',
  CASH_PRODUCT: '现货',
  FUTURE: '期货',
  Index: '指数',
  OTHER: '其他',
  DIGITAL: '二元',
  DIGITAL_AMERICAN_ANNUAL: '一触即付年化',
  DIGITAL_AMERICAN_UNANNUAL: '一触即付非年化',
  DIGITAL_EUROPEAN_ANNUAL: '欧式二元年化',
  DIGITAL_EUROPEAN_UNANNUAL: '欧式二元非年化',
  VERTICAL_SPREAD: '价差',
  VERTICAL_SPREAD_EUROPEAN_UNANNUAL: '价差欧式非年化',
  VERTICAL_SPREAD_EUROPEAN_ANNUAL: '价差欧式年化',
  BARRIER: '单鲨',
  BARRIER_ANNUAL: '单鲨年化',
  BARRIER_UNANNUAL: '单鲨非年化',
  DOUBLE_SHARK_FIN: '双鲨',
  DOUBLE_SHARK_FIN_ANNUAL: '双鲨年化',
  DOUBLE_SHARK_FIN_UNANNUAL: '双鲨非年化',
  EAGLE: '鹰式',
  EAGLE_ANNUAL: '鹰式年化',
  EAGLE_UNANNUAL: '鹰式非年化',
  DOUBLE_TOUCH: '美式双触碰',
  DOUBLE_TOUCH_ANNUAL: '美式双触碰年化',
  DOUBLE_TOUCH_UNANNUAL: '美式双触碰非年化',
  DOUBLE_NO_TOUCH: '美式双不触碰',
  DOUBLE_NO_TOUCH_ANNUAL: '美式双不触碰年化',
  DOUBLE_NO_TOUCH_UNANNUAL: '美式双不触碰非年化',
  CONCAVA: '二元凹式',
  CONCAVA_ANNUAL: '二元凹式年化',
  CONCAVA_UNANNUAL: '二元凹式非年化',
  CONVEX: '二元凸式',
  CONVEX_ANNUAL: '二元凸式年化',
  CONVEX_UNANNUAL: '二元凸式非年化',
  DOUBLE_DIGITAL: '三层阶梯',
  DOUBLE_DIGITAL_ANNUAL: '三层阶梯年化',
  DOUBLE_DIGITAL_UNANNUAL: '三层阶梯非年化',
  TRIPLE_DIGITAL: '四层阶梯',
  TRIPLE_DIGITAL_ANNUAL: '四层阶梯年化',
  TRIPLE_DIGITAL_UNANNUAL: '四层阶梯非年化',
  RANGE_ACCRUALS: '区间积累',
  RANGE_ACCRUALS_ANNUAL: '区间积累年化',
  RANGE_ACCRUALS_UNANNUAL: '区间积累非年化',
  STRADDLE: '跨式',
  STRADDLE_ANNUAL: '跨式年化',
  STRADDLE_UNANNUAL: '跨式非年化',
};

export const PRODUCT_TYPE_OPTIONS = convertOptions(PRODUCT_TYPE_MAP, PRODUCT_TYPE_ZHCN_MAP);
