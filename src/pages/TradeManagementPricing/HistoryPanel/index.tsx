/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import {
  DatePicker,
  Divider,
  notification,
  Pagination,
  Popconfirm,
  Row,
  Table,
  Timeline,
  Tooltip,
  Popover,
} from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import TimelineItem from 'antd/lib/timeline/TimelineItem';
import _ from 'lodash';
import moment, { isMoment } from 'moment';
import React, { memo, useState, useEffect } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';
import BigNumber from 'bignumber.js';
import { Form2, Input, Loading, Select, SmartTable } from '@/containers';
import {
  DIRECTION_OPTIONS,
  DIRECTION_TYPE_ZHCN_MAP,
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP,
  LEG_FIELD,
  NOTIONAL_AMOUNT_TYPE_MAP,
  OPTION_TYPE_OPTIONS,
  PRODUCTTYPE_OPTIONS,
  PRODUCTTYPE_ZHCH_MAP,
  STRIKE_TYPES_MAP,
  BIG_NUMBER_CONFIG,
  DATE_ARRAY,
} from '@/constants/common';
import {
  TRADESCOLDEFS_LEG_FIELD_MAP,
  TRADESCOL_FIELDS,
  VERTICAL_GUTTER,
  DEFAULT_TERM,
  COMPUTED_LEG_FIELD_MAP,
} from '@/constants/global';
import { LEG_ENV } from '@/constants/legs';
import { DATE_LEG_FIELDS } from '@/constants/legType';
import { mktInstrumentSearch } from '@/services/market-data-service';
import { createLegDataSourceItem, backConvertPercent } from '@/services/pages';
import { refSimilarLegalNameList } from '@/services/reference-data-service';
import { quotePrcPositionDelete, quotePrcSearchPaged } from '@/services/trade-service';
import styles from '@/styles/index.less';
import { formatMoney, getLegByProductType, formatNumber, getMoment } from '@/tools';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants/component';
import SmartForm from '@/containers/SmartForm';

const RANGE_DATE_KEY = 'RANGE_DATE_KEY';

const TradeManagementPricingManagement = props => {
  const [searchFormData, setSearchFormData] = useState({});
  const { setTableData, setVisible, visible, setCurPricingEnv } = props;
  const [tableDataSource, setTableDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });

  const [loading, setLoading] = useState(false);

  const [pageSizeCurrent, setPageSizeCurrent] = useState(1);

  const onTradeTableSearch = async (params = {}) => {
    const { paramsPagination, paramsSearchFormData } = params as any;
    const newFormData = Form2.getFieldsValue(paramsSearchFormData || searchFormData);
    const formatValues = _.reduce(
      _.mapValues(newFormData, (val, key) => {
        if (isMoment(val)) {
          return val.format('YYYY-MM-DD');
        }
        return val;
      }),
      (prev, curr, key) => {
        if (key === RANGE_DATE_KEY) {
          const [expirationStartDate, expirationEndDate] = curr;
          prev.expirationStartDate = isMoment(expirationStartDate)
            ? expirationStartDate.format('YYYY-MM-DD')
            : expirationStartDate;
          prev.expirationEndDate = isMoment(expirationEndDate)
            ? expirationEndDate.format('YYYY-MM-DD')
            : expirationEndDate;
        } else {
          prev[key] = curr;
        }
        return prev;
      },
      {},
    );

    setLoading(true);

    const { error, data } = await quotePrcSearchPaged({
      page: (paramsPagination || pagination).current - 1,
      pageSize: (paramsPagination || pagination).pageSize,
      ...formatValues,
    });

    setLoading(false);

    if (error) return;
    if (_.isEmpty(data)) return;

    const tableSource = _.flatten(
      data.page.map(item =>
        item.quotePositions.map((node, key) => ({
          ...node,
          ...item,
          ...(item.quotePositions.length > 1 ? { style: { background: '#f2f4f5' } } : null),
          ...(item.quotePositions.length <= 1
            ? null
            : key === 0
            ? { timeLineNumber: item.quotePositions.length }
            : null),
        })),
      ),
    );

    setTableDataSource(tableSource);
    setPagination({
      ...pagination,
      ...paramsPagination,
      total: data.totalCount,
    });
    setPageSizeCurrent((paramsPagination || pagination).pageSize);
  };

  const onPagination = (current, pageSize) => {
    onTradeTableSearch({
      paramsPagination: {
        current,
        pageSize,
      },
    });
  };

  const handlePaninationChange = (current, pageSize) => {
    onPagination(current, pageSize);
  };

  const handleShowSizeChange = (current, pageSize) => {
    onPagination(current, pageSize);
  };

  const handleTradescol = params =>
    _.mapValues(params, (value, key) => {
      if (key === TRADESCOLDEFS_LEG_FIELD_MAP.UNDERLYER_PRICE) {
        return value;
      }
      return value ? new BigNumber(value).multipliedBy(100).toNumber() : value;
    });

  const handleTradeNumber = position => {
    const record = position.asset;
    if (
      !record[LEG_FIELD.NOTIONAL_AMOUNT] ||
      !record[LEG_FIELD.NOTIONAL_AMOUNT_TYPE] ||
      !record[LEG_FIELD.UNDERLYER_MULTIPLIER] ||
      !record[LEG_FIELD.INITIAL_SPOT]
    ) {
      return null;
    }
    const notionalAmountType = record[LEG_FIELD.NOTIONAL_AMOUNT_TYPE];
    const multipler = record[LEG_FIELD.UNDERLYER_MULTIPLIER];
    const annualCoefficient =
      record[LEG_FIELD.IS_ANNUAL] &&
      new BigNumber(record[LEG_FIELD.TERM]).div(record[LEG_FIELD.DAYS_IN_YEAR]).toNumber();
    const notionalAmount = record[LEG_FIELD.IS_ANNUAL]
      ? new BigNumber(record[LEG_FIELD.NOTIONAL_AMOUNT]).multipliedBy(annualCoefficient).toNumber()
      : record[LEG_FIELD.NOTIONAL_AMOUNT];

    const notional =
      notionalAmountType === 'LOT'
        ? notionalAmount
        : new BigNumber(notionalAmount)
            .div(record[LEG_FIELD.INITIAL_SPOT])
            .div(multipler)
            .toNumber();
    return new BigNumber(notional)
      .multipliedBy(multipler)
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber();
  };

  useEffect(() => {
    if (!visible) return;
    onTradeTableSearch();
  }, [visible]);

  return (
    <>
      <SmartForm
        spread={3}
        submitText="搜索"
        onSubmitButtonClick={() => {
          onTradeTableSearch({ paramsPagination: { current: 1, pageSize: PAGE_SIZE } });
        }}
        onResetButtonClick={() => {
          setSearchFormData({});
          onTradeTableSearch({
            paramsSearchFormData: {},
            paramsPagination: { current: 1, pageSize: PAGE_SIZE },
          });
        }}
        onFieldsChange={(propsData, changedFields, allFields) => {
          setSearchFormData({
            ...searchFormData,
            ...changedFields,
          });
        }}
        dataSource={searchFormData}
        layout="inline"
        columns={[
          {
            title: '交易对手',
            dataIndex: 'counterPartyCode',
            render: (val, record, index, { form }) => (
              <FormItem>
                {form.getFieldDecorator()(
                  <Select
                    {...{
                      style: {
                        width: '180px',
                      },
                      editing: true,
                      fetchOptionsOnSearch: true,
                      showSearch: true,
                      allowClear: true,
                      placeholder: '请输入内容搜索',
                      options: async (value: string = '') => {
                        const { data, error } = await refSimilarLegalNameList({
                          similarLegalName: value,
                        });
                        if (error) return [];
                        return data.map(item => ({
                          label: item,
                          value: item,
                        }));
                      },
                    }}
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '标的物',
            dataIndex: LEG_FIELD.UNDERLYER_INSTRUMENT_ID,
            render: (val, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="请输入内容搜索"
                    allowClear
                    showSearch
                    fetchOptionsOnSearch
                    options={async (value: string = '') => {
                      const { data, error } = await mktInstrumentSearch({
                        instrumentIdPart: value,
                      });
                      if (error) return [];
                      return data.slice(0, 50).map(item => ({
                        label: item,
                        value: item,
                      }));
                    }}
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '期权类型',
            dataIndex: 'productType',
            render: (value, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="请输入内容搜索"
                    allowClear
                    showSearch
                    fetchOptionsOnSearch
                    options={PRODUCTTYPE_OPTIONS}
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '到期日范围',
            dataIndex: RANGE_DATE_KEY,
            render: (value, record, index, { form, editing }) => (
              <FormItem>{form.getFieldDecorator({})(<DatePicker.RangePicker />)}</FormItem>
            ),
          },
          {
            title: '涨/跌',
            dataIndex: LEG_FIELD.OPTION_TYPE,
            render: (value, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={OPTION_TYPE_OPTIONS}
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '买卖方向',
            dataIndex: LEG_FIELD.DIRECTION,
            render: (value, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="请选择内容"
                    allowClear
                    showSearch
                    options={DIRECTION_OPTIONS}
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '备注',
            dataIndex: LEG_FIELD.COMMENT,
            render: (value, record, index, { form, editing }) => (
              <FormItem>{form.getFieldDecorator({})(<Input placeholder="请输入内容" />)}</FormItem>
            ),
          },
        ]}
      />
      <Divider />
      <div style={{ marginTop: VERTICAL_GUTTER }}>
        <Loading loading={loading}>
          <SmartTable
            pagination={false}
            rowKey="uuid"
            scroll={{ x: 2700 }}
            dataSource={tableDataSource}
            columns={[
              {
                title: '期权类型',
                dataIndex: 'productType',
                width: 150,
                fixed: 'left',
                onCell: record => ({
                  style: { paddingLeft: '20px' },
                }),
                onHeaderCell: record => ({
                  style: { paddingLeft: '20px' },
                }),
                render: (text, record, i) => {
                  if (record.timeLineNumber) {
                    return (
                      <span style={{ position: 'relative' }}>
                        {PRODUCTTYPE_ZHCH_MAP[text] || '--'}
                        <Timeline
                          style={{ position: 'absolute', left: '-15px', top: '5px' }}
                          className={styles.timelines}
                        >
                          {record.quotePositions.map((item, index) => (
                            <TimelineItem
                              style={{
                                paddingBottom:
                                  index === record.quotePositions.length - 1 ? 0 : 30.5,
                              }}
                              key={`${item.positionId}`}
                            />
                          ))}
                        </Timeline>
                      </span>
                    );
                  }
                  return <span>{PRODUCTTYPE_ZHCH_MAP[text] || '--'}</span>;
                },
              },
              {
                title: '交易对手',
                dataIndex: 'counterPartyCode',
                width: 150,
              },
              {
                title: '买/卖',
                dataIndex: 'direction',
                width: 150,
                render: (text, record, index) => DIRECTION_TYPE_ZHCN_MAP[text],
              },
              {
                title: '标的物',
                dataIndex: 'asset.underlyerInstrumentId',
                width: 150,
                // width: 150,
              },
              {
                title: '期初价格（￥）',
                dataIndex: `asset.${LEG_FIELD.INITIAL_SPOT}`,
                width: 150,
                align: 'right',
                render: val => formatMoney(val),
              },
              {
                title: '涨/跌',
                dataIndex: 'asset.optionType',
                width: 150,
                // width: 60,
                render: (text, record, index) => EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP[text],
              },
              {
                title: '起始日',
                dataIndex: `asset.${LEG_FIELD.EFFECTIVE_DATE}`,
                width: 150,
              },
              {
                title: '到期日',
                dataIndex: LEG_FIELD.EXPIRATION_DATE,
                width: 150,
              },
              {
                title: '行权价',
                dataIndex: `asset.${LEG_FIELD.STRIKE}`,
                width: 150,
                align: 'right',
                render: (val, record) => {
                  if (val == null) return null;
                  if (_.get(record, `asset.${LEG_FIELD.STRIKE_TYPE}`) === STRIKE_TYPES_MAP.CNY) {
                    return formatMoney(val, {
                      unit: '￥',
                    });
                  }
                  return `${new BigNumber(val).multipliedBy(100).toNumber()}%`;
                },
              },
              {
                title: '名义本金',
                align: 'right',
                dataIndex: `asset.${LEG_FIELD.NOTIONAL_AMOUNT}`,
                width: 150,
                render: (val, record) => {
                  if (val == null) return null;
                  if (
                    record.asset[LEG_FIELD.NOTIONAL_AMOUNT_TYPE] === NOTIONAL_AMOUNT_TYPE_MAP.CNY
                  ) {
                    return formatMoney(val, {
                      unit: '￥',
                    });
                  }
                  return `${val}手`;
                },
              },
              {
                title: 'vol（%）',
                align: 'right',
                dataIndex: TRADESCOLDEFS_LEG_FIELD_MAP.VOL,
                width: 150,
                render: (val, record) =>
                  _.isNumber(val) ? new BigNumber(val).multipliedBy(100).toNumber() : val,
              },
              {
                title: 'r（%）',
                align: 'right',
                dataIndex: TRADESCOLDEFS_LEG_FIELD_MAP.R,
                width: 150,
                render: (val, record) =>
                  _.isNumber(val) ? new BigNumber(val).multipliedBy(100).toNumber() : val,
              },
              {
                title: 'q（%）',
                align: 'right',
                dataIndex: TRADESCOLDEFS_LEG_FIELD_MAP.Q,
                width: 150,
                render: (val, record) =>
                  _.isNumber(val) ? new BigNumber(val).multipliedBy(100).toNumber() : val,
              },
              {
                title: '定价结果',
                dataIndex: 'prcResult',
                width: 200,
                render: (val, record) => {
                  const groups = _.toPairs(
                    _.mapValues(val, (data = {}, key) => {
                      const unit = _.get(data, 'unit', '');
                      if (key === COMPUTED_LEG_FIELD_MAP.PRICE && data.value < 0) {
                        data.value *= -1;
                      }
                      if (unit === '¥' || unit === '$') {
                        return formatMoney(data.value, {
                          unit,
                        });
                      }
                      return `${formatNumber(data.value, 4)}${unit}`;
                    }),
                  );

                  const str = groups.map(([key, v]) => `${key}: ${v}`).join(',');

                  if (str.length > 20) {
                    return (
                      <Popover
                        content={
                          <div style={{ width: 170 }}>
                            {groups.map(([key, v]) => (
                              <Row key={key} type="flex" justify="space-between">
                                <span>{key}:</span> <span>{v}</span>
                              </Row>
                            ))}
                          </div>
                        }
                        title="计算结果预览"
                      >
                        {str.slice(0, 20)}...
                      </Popover>
                    );
                  }

                  return str;
                },
              },
              {
                title: '备注',
                dataIndex: LEG_FIELD.COMMENT,
                render: (val, record) => val,
              },
              {
                title: '操作',
                dataIndex: 'action',
                width: 150,
                fixed: 'right',
                render: (val, record) => (
                  <div>
                    <Popconfirm
                      title="将会覆盖当前试定价数据，是否继续?"
                      onConfirm={() => {
                        const { quotePositions, pricingEnvironmentId } = record as any;
                        const next = quotePositions.map(position => {
                          const { productType, asset } = position;
                          const leg = getLegByProductType(productType, position.asset.exerciseType);
                          if (!leg) {
                            throw new Error(`${productType} is not defiend!`);
                          }

                          const pageData = leg.getPageData(LEG_ENV.PRICING, position);

                          return {
                            ...createLegDataSourceItem(leg, LEG_ENV.PRICING),
                            ...backConvertPercent({
                              ...Form2.createFields({
                                ..._.mapValues(asset, (v, key) => {
                                  if (v && DATE_ARRAY.indexOf(key) !== -1) {
                                    return moment(v);
                                  }
                                  return v;
                                }),
                                ...handleTradescol(_.pick(position, TRADESCOL_FIELDS)),
                                [LEG_FIELD.TRADE_NUMBER]: handleTradeNumber(position),
                                [LEG_FIELD.TERM]: asset.annualized
                                  ? asset[LEG_FIELD.TERM]
                                  : getMoment(asset[LEG_FIELD.EXPIRATION_DATE]).diff(
                                      getMoment(asset[LEG_FIELD.EFFECTIVE_DATE]),
                                      'days',
                                    ),
                              }),
                              ...pageData,
                            }),
                          };
                        });
                        setTableData(next);
                        setCurPricingEnv(pricingEnvironmentId);
                        setVisible(false);
                      }}
                      okText="是"
                      cancelText="否"
                    >
                      <a>复用</a>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Popconfirm
                      title="确认删除本条数据吗?"
                      onConfirm={async () => {
                        const { error, data } = await quotePrcPositionDelete({
                          uuid: record.uuid,
                        });
                        if (error) return;
                        notification.success({ message: '删除成功' });
                        setTimeout(() => {
                          onTradeTableSearch();
                        });
                      }}
                      okText="是"
                      cancelText="否"
                    >
                      <a style={{ color: 'red' }}>删除</a>
                    </Popconfirm>
                  </div>
                ),
              },
            ]}
            onRow={record => (record.style ? { style: record.style } : null)}
          />
          <Row type="flex" justify="end" style={{ marginTop: 15 }}>
            <Pagination
              {...{
                size: 'small',
                showSizeChanger: true,
                onShowSizeChange: handleShowSizeChange,
                showQuickJumper: true,
                current: pagination.current,
                pageSize: pagination.pageSize,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                onChange: handlePaninationChange,
                total: pagination.total,
              }}
            />
          </Row>
        </Loading>
      </div>
    </>
  );
};

export default memo(TradeManagementPricingManagement);
