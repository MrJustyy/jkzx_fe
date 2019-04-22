export const ROW_KEY = 'tradeId';
import {
  DIRECTION_TYPE_ZHCN_MAP,
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP,
  LCM_EVENT_TYPE_OPTIONS,
  LCM_EVENT_TYPE_ZHCN_MAP,
  PRODUCTTYPE_ZHCH_MAP,
} from '@/constants/common';
import { IColumnDef } from '@/design/components/Table/types';
import { Timeline } from 'antd';
import React from 'react';
import Operations from './CommonModel/Operations';
import styles from './index.less';
const TimelineItem = Timeline.Item;

export const BOOKING_TABLE_COLUMN_DEFS = onSearch => [
  {
    title: '交易ID',
    dataIndex: 'tradeId',
    fixed: 'left',
    // width: 150,
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
          <div style={{ position: 'relative' }}>
            <Timeline
              style={{ position: 'absolute', left: '-20px', top: '5px' }}
              className={styles.timelines}
            >
              {record.positions.map((item, index) => {
                return <TimelineItem style={{ marginBottom: '27px' }} key={index} />;
              })}
            </Timeline>
            <span>{record.tradeId}</span>
          </div>
        );
      }
      return <span>{record.tradeId}</span>;
    },
  },
  {
    title: '持仓ID',
    dataIndex: 'positionId',
  },
  {
    title: '交易簿',
    dataIndex: 'bookName',
  },
  {
    title: '标的物',
    dataIndex: 'underlyerInstrumentId',
    // width: 150,
  },
  {
    title: '买/卖',
    dataIndex: 'direction',
    render: (text, record, index) => {
      return DIRECTION_TYPE_ZHCN_MAP[text];
    },
  },
  {
    title: '期权类型',
    dataIndex: 'productType',
    // width: 150,
    render: (text, record, index) => {
      return PRODUCTTYPE_ZHCH_MAP[text];
    },
  },
  {
    title: '涨/跌',
    dataIndex: 'optionType',
    // width: 60,
    render: (text, record, index) => {
      return EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP[text];
    },
  },
  {
    title: '交易日',
    dataIndex: 'tradeDate',
    // width: 120,
  },
  {
    title: '到期日',
    dataIndex: 'expirationDate',
    // width: 120,
  },
  {
    title: '持仓状态',
    dataIndex: 'lcmEventType',
    // width: 130,
    render: (text, record, index) => {
      return LCM_EVENT_TYPE_ZHCN_MAP[text];
    },
  },
  {
    title: '交易对手',
    dataIndex: 'counterPartyName',
  },
  {
    title: '销售',
    dataIndex: 'salesName',
    // width: 100,
  },
  {
    title: '所属投资组合',
    dataIndex: 'portfolioNames',
  },
  {
    title: '操作',
    fixed: 'right',
    width: 100,
    render: (value, record, index) => {
      return <Operations record={record} onSearch={onSearch} />;
    },
  },
];

export const OVERVIEW_TABLE_COLUMNDEFS: IColumnDef[] = [
  {
    headerName: '交易编号',
    field: 'tradeId',
    width: 150,
  },
  {
    headerName: '持仓编号',
    field: 'positionId',
    width: 150,
  },
  {
    headerName: '操作用户',
    field: 'userLoginId',
    width: 150,
  },
  {
    headerName: '操作时间',
    field: 'createdAt',
    width: 150,
    input: {
      type: 'date',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    headerName: '生命周期事件',
    field: 'lcmEventType',
    width: 150,
    input: {
      type: 'select',
      options: LCM_EVENT_TYPE_OPTIONS,
    },
  },
];
