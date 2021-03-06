import { multiply } from 'mathjs';
import { formatNumber, getMoment } from '@/tools';

export const TABLE_COL_DEFS = [
  {
    title: '交易簿',
    dataIndex: 'bookName',
    width: 130,
    fixed: 'left',
    sorter: true,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '标的物代码',
    dataIndex: 'underlyerInstrumentId',
    width: 130,
    sorter: true,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '更新时间',
    dataIndex: 'createdAt',
    width: 180,
    render: (value, record, index) => (value ? getMoment(value).format('YYYY-MM-DD HH:mm:ss') : ''),
  },
  {
    title: '标的物价格 (¥)',
    dataIndex: 'underlyerPrice',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '标的物价格变化',
    dataIndex: 'underlyerPriceChangePercent',
    width: 150,
    align: 'right',
    render: (value, record, index) => {
      if (value == null) return value;
      return `${formatNumber(multiply(value, 100), 4)}%`;
    },
  },
  {
    title: '标的物持仓 (手)',
    dataIndex: 'underlyerNetPosition',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '期权 Delta (手)',
    dataIndex: 'delta',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '净 Delta (手)',
    dataIndex: 'netDelta',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Delta Cash (￥)',
    dataIndex: 'deltaCash',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Delta Decay (手)',
    dataIndex: 'deltaDecay',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: '预期 Delta (手)',
    dataIndex: 'deltaWithDecay',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Gamma (手)',
    dataIndex: 'gamma',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Gamma 金额 (¥)',
    dataIndex: 'gammaCash',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Vega/1% (¥)',
    dataIndex: 'vega',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Theta/1天 (¥)',
    dataIndex: 'theta',
    width: 130,
    render: (value, record, index) => formatNumber(value, 4),
    align: 'right',
  },
  {
    title: 'Rho/1% (¥)',
    dataIndex: 'rho',
    render: (value, record, index) => formatNumber(value, 4),
    width: 130,
    align: 'right',
  },
  {
    title: '定价环境',
    dataIndex: 'pricingEnvironment',
  },
];
