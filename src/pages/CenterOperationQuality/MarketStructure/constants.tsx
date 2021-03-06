import React from 'react';
import moment from 'moment';
import { formatNumber } from '@/tools';

export const KnockdownStructureDefs = [
  {
    title: '日期',
    width: 140,
    dataIndex: 'statDate',
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
    render: value => {
      if (value) {
        return <span>{moment(value).format('YYYY-MM-DD')}</span>;
      }
      return <span>{value}</span>;
    },
  },
  {
    title: '实际开仓成交名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'openTrdNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际平仓成交名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'closeTrdNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际终止成交名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'endTrdNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际成交名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'trdNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '开仓期权费金额',
    align: 'right',
    width: 200,
    dataIndex: 'trdOpenPremium',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '平仓期权费金额',
    align: 'right',
    width: 200,
    dataIndex: 'trdClosePremium',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '终止期权费金额',
    align: 'right',
    width: 200,
    dataIndex: 'trdEndPremium',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '期权费金额',
    align: 'right',
    width: 200,
    dataIndex: 'premiumAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '开仓成交客户数',
    align: 'right',
    width: 200,
    dataIndex: 'trdOpenCusNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '平仓成交客户数',
    align: 'right',
    width: 200,
    dataIndex: 'trdCloseCusNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '终止成交客户数',
    align: 'right',
    width: 200,
    dataIndex: 'trdEndCusNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '成交客户数',
    align: 'right',
    width: 200,
    dataIndex: 'trdCusNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
];
export const PositionStructureDefs = [
  {
    title: '日期',
    width: 140,
    dataIndex: 'statDate',
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
    render: value => {
      if (value) {
        return <span>{moment(value).format('YYYY-MM-DD')}</span>;
      }
      return <span>{value}</span>;
    },
  },
  {
    title: '实际买看涨持仓名义金额',
    width: 300,
    align: 'right',
    dataIndex: 'posCallBuyAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际买看跌持仓名义金额',
    width: 300,
    align: 'right',
    dataIndex: 'posPutBuyAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际买其他持仓名义金额',
    align: 'right',
    width: 300,
    dataIndex: 'posOtherBuyAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际买名义金额合计',
    align: 'right',
    width: 250,
    dataIndex: 'posBuyAmountTotal',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际卖看涨持仓名义金额',
    align: 'right',
    width: 300,
    dataIndex: 'posCallSellAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际卖看跌持仓名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'posPutSellAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际卖名义金额合计',
    align: 'right',
    width: 250,
    dataIndex: 'posSellAmountTotal',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '买看涨持仓市值',
    align: 'right',
    width: 200,
    dataIndex: 'posCallBuyCValue',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '买看跌持仓市值',
    align: 'right',
    width: 200,
    dataIndex: 'posPutBuyCValue',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '买其他持仓市值',
    align: 'right',
    width: 200,
    dataIndex: 'posOtherBuyCValue',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '买市值合计',
    align: 'right',
    width: 200,
    dataIndex: 'posBuyValueTotal',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '卖看涨持仓市值',
    align: 'right',
    width: 200,
    dataIndex: 'posCallSellCValue',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '卖看跌持仓市值',
    align: 'right',
    width: 200,
    dataIndex: 'posPutSellCValue',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '卖市值合计',
    align: 'right',
    width: 200,
    dataIndex: 'posSellValueTotal',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
];

export const ToolStructureDefs = [
  {
    title: '日期',
    width: 140,
    dataIndex: 'statDate',
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
    render: value => {
      if (value) {
        return <span>{moment(value).format('YYYY-MM-DD')}</span>;
      }
      return <span>{value}</span>;
    },
  },
  {
    title: '资产类型',
    width: 150,
    dataIndex: 'assetType',
    render: val => <span>{val}</span>,
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
  },
  {
    title: '工具类型',
    width: 150,
    dataIndex: 'toolType',
    render: val => <span>{val}</span>,
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
  },
  {
    title: '成交笔数',
    align: 'right',
    width: 150,
    dataIndex: 'trdTransNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际成交名义金额',
    align: 'right',
    width: 200,
    dataIndex: 'trdNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '持仓笔数',
    width: 150,
    align: 'right',
    dataIndex: 'posTransNum',
    render: val => <span>{val && formatNumber(val, 0)}</span>,
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
  },
  {
    title: '实际持仓名义金额',
    width: 200,
    align: 'right',
    dataIndex: 'posNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '参与交易客户数',
    width: 150,
    align: 'right',
    dataIndex: 'inMarketCusNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
];
export const CustomerTypeStructureDefs = [
  {
    title: '日期',
    width: 140,
    dataIndex: 'statDate',
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
    render: value => {
      if (value) {
        return <span>{moment(value).format('YYYY-MM-DD')}</span>;
      }
      return <span>{value}</span>;
    },
  },
  {
    title: '对手方类型',
    width: 150,
    dataIndex: 'cusType',
    render: val => <span>{val}</span>,
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
  },
  {
    title: '资产类型',
    width: 150,
    dataIndex: 'assetType',
    render: val => <span>{val}</span>,
    onCell: () => ({ style: { color: 'rgba(222,230,240,1)' } }),
  },
  {
    title: '成交笔数',
    align: 'right',
    width: 150,
    dataIndex: 'trdTransNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际成交名义金额',
    align: 'right',
    width: 200,
    dataIndex: 'trdNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '持仓笔数',
    align: 'right',
    width: 150,
    dataIndex: 'posTransNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '实际持仓名义金额',
    align: 'right',
    width: 200,
    dataIndex: 'posNotionAmount',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
  {
    title: '参与交易客户数',
    align: 'right',
    width: 200,
    dataIndex: 'inMarketCusNum',
    onCell: () => ({ style: { color: 'rgba(255,120,42,1)' } }),
    render: val => <span>{val && formatNumber(val, 0)}</span>,
  },
];
