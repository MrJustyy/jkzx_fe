import { formatNumber, getMoment } from '@/tools';

export const TABLE_COL_DEFS = [
  {
    title: '交易簿',
    dataIndex: 'bookName',
    sorter: true,
    sortDirections: ['ascend', 'descend'],
    width: 130,
  },
  {
    title: '标的物代码',
    dataIndex: 'underlyerInstrumentId',
    sorter: true,
    sortDirections: ['ascend', 'descend'],
    width: 150,
  },
  {
    title: '更新时间',
    dataIndex: 'createdAt',
    width: 180,
    render: (value, record, index) => (value ? getMoment(value).format('YYYY-MM-DD HH:mm:ss') : ''),
  },
  {
    title: '总盈亏 (¥)',
    dataIndex: 'pnl',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '期权费 (¥)',
    dataIndex: 'optionPremium',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '期权平仓金额 (¥)',
    dataIndex: 'optionUnwindAmount',
    width: 150,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '期权结算金额 (¥)',
    dataIndex: 'optionSettleAmount',
    width: 160,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '期权持仓市值 (¥)',
    dataIndex: 'optionMarketValue',
    width: 150,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '期权盈亏 (¥)',
    dataIndex: 'optionPnl',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物买入金额 (¥)',
    dataIndex: 'underlyerBuyAmount',
    width: 160,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物卖出金额 (¥)',
    dataIndex: 'underlyerSellAmount',
    width: 160,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物持仓 (手)',
    dataIndex: 'underlyerNetPosition',
    width: 140,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物价格 (¥)',
    dataIndex: 'underlyerPrice',
    width: 140,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物市值 (¥)',
    dataIndex: 'underlyerMarketValue',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物盈亏 (¥)',
    dataIndex: 'underlyerPnl',
    render: (value, record, index) => formatNumber(value, 4),
    width: 130,
    align: 'right',
  },
  {
    title: '定价环境',
    dataIndex: 'pricingEnvironment',
    width: 130,
  },
];
