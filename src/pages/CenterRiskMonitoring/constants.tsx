import React from 'react';
import moment from 'moment';
import { formatNumber } from '@/tools';

export const InfectionRiskDefs = [
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
    title: '子公司间交易家数',
    align: 'right',
    width: 200,
    dataIndex: 'interCompNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '子公司间成交金额',
    width: 200,
    align: 'right',
    dataIndex: 'interCompTrdAmount',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '总成交金额',
    align: 'right',
    width: 200,
    dataIndex: 'compTrdAmountTotal',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '成交占比',
    align: 'right',
    width: 200,
    dataIndex: 'trdRatio',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '子公司间持仓金额',
    align: 'right',
    width: 200,
    dataIndex: 'interCompPosAmount',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '总持仓金额',
    align: 'right',
    width: 200,
    dataIndex: 'compPosAmountTotal',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '持仓占比',
    align: 'right',
    width: 200,
    dataIndex: 'posRatio',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
];

export const ControlRiskDefs = [
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
    title: '跨公司交易客户数',
    align: 'right',
    width: 150,
    dataIndex: 'interCompCusNum',
    render: val => <span>{val}</span>,
  },
  {
    title: '跨公司成交规模',
    align: 'right',
    width: 150,
    dataIndex: 'interCompTrd',
    render: val => <span>{val}</span>,
  },
  {
    title: '跨公司持仓规模',
    align: 'right',
    width: 150,
    dataIndex: 'interCompPos',
    render: val => <span>{val}</span>,
  },
];

export const PositionProportionDefs = [
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
    title: '对手方名称',
    width: 200,
    dataIndex: 'analogueName',
    render: val => <span>{val}</span>,
  },
  {
    title: '标的资产品种',
    width: 200,
    dataIndex: 'underAssVarit',
    render: val => <span>{val}</span>,
  },
  {
    title: '在所有子公司的正Delta累加值',
    align: 'right',
    width: 200,
    dataIndex: 'cusPositiveDelta',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '场内空头持仓量',
    align: 'right',
    width: 200,
    dataIndex: 'cusShortPosition',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '在所有子公司的负Delta累加值',
    align: 'right',
    width: 200,
    dataIndex: 'cusNegativeDelta',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '场内多头持仓量',
    align: 'right',
    width: 200,
    dataIndex: 'cusLongPostion',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '场内合并单边最大持仓',
    align: 'right',
    width: 200,
    dataIndex: 'exchangeMaxPos',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '场内单边持仓量',
    align: 'right',
    width: 200,
    dataIndex: 'exchangePos',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
  {
    title: '对手方场内外合并持仓占比',
    align: 'right',
    width: 200,
    dataIndex: 'cusExgOtcRatio',
    render: val => <span>{val && formatNumber(val, 2)}</span>,
  },
];
