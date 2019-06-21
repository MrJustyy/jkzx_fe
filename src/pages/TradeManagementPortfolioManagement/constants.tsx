export const ROW_KEY = 'tradeId';
import {
  DIRECTION_TYPE_ZHCN_MAP,
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP,
  LCM_EVENT_TYPE_OPTIONS,
  LCM_EVENT_TYPE_ZHCN_MAP,
  PRODUCTTYPE_ZHCH_MAP,
} from '@/constants/common';
import { trdTradePortfolioDelete } from '@/services/trade-service';
import { message, Popconfirm, Timeline } from 'antd';
import React from 'react';
import styles from './Action.less';
const TimelineItem = Timeline.Item;

export const BOOKING_TABLE_COLUMN_DEFS = (portfolioName, onSearch) => [
  {
    title: '交易ID',
    dataIndex: 'tradeId',
    width: 250,
    fixed: 'left',
    onCell: record => {
      return {
        style: { paddingLeft: '20px' },
      };
    },
    onHeaderCell: record => {
      return {
        style: { paddingLeft: '20px' },
      };
    },
    render: (text, record, index) => {
      if (record.timeLineNumber) {
        return (
          <span style={{ position: 'relative' }}>
            {record.tradeId}
            <Timeline
              style={{ position: 'absolute', left: '-20px', top: '5px' }}
              className={styles.timelines}
            >
              {record.positions.map((item, index) => {
                return (
                  <TimelineItem
                    style={{ paddingBottom: index === record.positions.length - 1 ? 0 : 46 }}
                    key={index}
                  />
                );
              })}
            </Timeline>
          </span>
        );
      }
      return <span>{record.tradeId}</span>;
    },
  },
  {
    title: '持仓ID',
    dataIndex: 'positionId',
    width: 250,
  },
  {
    title: '交易簿',
    dataIndex: 'bookName',
    width: 250,
  },
  {
    title: '标的物',
    dataIndex: 'underlyerInstrumentId',
    width: 100,
    // width: 150,
  },
  {
    title: '买/卖',
    dataIndex: 'direction',
    width: 100,
    render: (text, record, index) => {
      return DIRECTION_TYPE_ZHCN_MAP[text];
    },
  },
  {
    title: '期权类型',
    dataIndex: 'productType',
    width: 100,
    // width: 150,
    render: (text, record, index) => {
      return PRODUCTTYPE_ZHCH_MAP[text];
    },
  },
  {
    title: '涨/跌',
    dataIndex: 'optionType',
    width: 100,
    // width: 60,
    render: (text, record, index) => {
      return EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP[text];
    },
  },
  {
    title: '交易日',
    dataIndex: 'tradeDate',
    width: 150,
  },
  {
    title: '到期日',
    dataIndex: 'expirationDate',
    width: 150,
  },
  {
    title: '持仓状态',
    dataIndex: 'lcmEventType',
    width: 150,
    // width: 130,
    render: (text, record, index) => {
      return LCM_EVENT_TYPE_ZHCN_MAP[text];
    },
  },
  {
    title: '交易对手',
    dataIndex: 'counterPartyName',
    width: 150,
  },
  {
    title: '销售',
    dataIndex: 'salesName',
    width: 150,
    // width: 150,
  },
  {
    title: '所属投资组合',
    dataIndex: 'portfolioNames',
    render: (text, record, index) => {
      return text.join(', ');
    },
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'action',
    width: 150,
    render: (value, record, index) => {
      return (
        <Popconfirm
          title="确认移出投资组合？"
          onConfirm={() => onDelete(record, portfolioName, onSearch)}
        >
          <a style={{ color: 'red' }}>移出投资组合</a>
        </Popconfirm>
      );
    },
  },
];

const onDelete = async (record, portfolioName, onSearch) => {
  const { error } = await trdTradePortfolioDelete({
    portfolioName,
    tradeId: record.tradeId,
  });
  if (error) return message.error('移出失败');
  message.success('移出成功');
  onSearch();
};
