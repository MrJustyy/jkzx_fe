import React from 'react';
import moment from 'moment';
import { formatNumber } from '@/tools';

export const MarketSizeDefs = [
  {
    title: '日期',
    width: 140,
    dataIndex: 'statDate',
    render: value => {
      if (value) {
        return <span>{moment(value).format('YYYY-MM-DD')}</span>;
      }
      return <span>{value}</span>;
    },
  },
  {
    title: '成交名义金额',
    align: 'right',
    width: 150,
    dataIndex: 'trdNotionAmount',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '成交笔数',
    width: 150,
    align: 'right',
    dataIndex: 'trdTransNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '期权费金额',
    align: 'right',
    width: 150,
    dataIndex: 'optFeeAmount',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '成交客户数',
    align: 'right',
    width: 150,
    dataIndex: 'trdCusNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '持仓名义金额',
    width: 150,
    align: 'right',
    dataIndex: 'posNotionAmount',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '持仓笔数',
    align: 'right',
    width: 150,
    dataIndex: 'posTransNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '持仓市值',
    align: 'right',
    width: 150,
    dataIndex: 'posValue',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '持仓客户数',
    align: 'right',
    width: 150,
    dataIndex: 'posCusNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '参与交易客户数',
    align: 'right',
    width: 180,
    dataIndex: 'inMarketCusNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '全市场客户数',
    align: 'right',
    width: 150,
    dataIndex: 'fullMarketCusNum',
    render: val => <span>{val}</span>,
  },
];

const DISTTYPE_OPTION = {
  CUS: '对手方持仓集中度',
  SUBCOMPANY: '子公司',
  VARIETY: '品种集中度',
};

export const MarketConcentrationDefs = [
  {
    title: '日期',
    width: 140,
    dataIndex: 'statDate',
    render: value => {
      if (value) {
        return <span>{moment(value).format('YYYY-MM-DD')}</span>;
      }
      return <span>{value}</span>;
    },
  },
  {
    title: '指标',
    width: 150,
    dataIndex: 'distType',
    render: value => <span>{value && DISTTYPE_OPTION[value]}</span>,
  },
  {
    title: '前三名持仓名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'top3Pos',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '前三名集中度',
    align: 'right',
    width: 200,
    dataIndex: 'top3PosDist',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '前五名持仓名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'top5Pos',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '前五名集中度',
    align: 'right',
    width: 200,
    dataIndex: 'top5PosDist',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '前十名持仓名义金额',
    align: 'right',
    width: 250,
    dataIndex: 'top10Pos',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '前十名集中度',
    align: 'right',
    width: 200,
    dataIndex: 'top10PosDist',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
];
