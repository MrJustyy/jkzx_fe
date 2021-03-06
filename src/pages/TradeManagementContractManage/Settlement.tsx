import { Button, Col, Icon, message, Modal, Pagination, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import BigNumber from 'bignumber.js';
import { connect } from 'dva';
import _, { get } from 'lodash';
import moment from 'moment';
import React, { forwardRef, memo, useEffect, useRef, useState } from 'react';
import {
  BIG_NUMBER_CONFIG,
  DIRECTION_ZHCN_MAP,
  LCM_EVENT_TYPE_MAP,
  LEG_FIELD,
  LEG_TYPE_MAP,
  OPTION_TYPE_ZHCN_MAP,
  PRODUCTTYPE_ZHCH_MAP,
  SPECIFIED_PRICE_MAP,
  SPECIFIED_PRICE_ZHCN_MAP,
  STRIKE_TYPES_MAP,
} from '@/constants/common';
import { PAGE_SIZE } from '@/constants/component';
import { Form2, InputNumber, Loading, SmartTable, Table2 } from '@/containers';
import { mktQuotesListPaged } from '@/services/market-data-service';
import { cliTasksGenerateByTradeId } from '@/services/reference-data-service';
import {
  tradeExercisePreSettle,
  trdTradeLCMEventProcess,
  trdTradeSettleablePaged,
} from '@/services/trade-service';
import { formatMoney, formatNumber, getRequiredRule } from '@/tools';
import { getNumOfOptionsByNotionalAmount } from '@/tools/getNumOfOptions';

const ALREADY = 'ALREADY';

const SettleInputNumber = memo<any>(
  forwardRef(props => {
    const { onReload, editing, showReload, ...restProps } = props;

    return editing ? (
      <InputNumber {...restProps} editing={editing} />
    ) : (
      <Row type="flex" justify="space-between" align="middle">
        <InputNumber {...restProps} editing={editing} style={{ width: 'auto', flexGrow: 1 }} />
        {!!showReload && (
          <Icon
            type="reload"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (onReload) {
                onReload();
              }
            }}
            style={{ paddingLeft: 5, color: '#1890ff' }}
          />
        )}
      </Row>
    );
  }),
);

const Settlement = props => {
  const POSITION_ID = 'positionId';
  const { modalVisible, setModalVisible, currentUser = {} } = props;
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);

  const [settLoading, setSettLoading] = useState(false);
  const [setted, setSetted] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const tableEl = useRef<Table2>(null);
  const [cacheTableDataMapCurrent, setCacheTableDataMapCurrent] = useState({});

  const startTradeExercisePreSettle = record => {
    const values = Form2.getFieldsValue(record);

    const underlyerPrice = parseFloat(get(values, `${LEG_FIELD.UNDERLYER_PRICE}`));

    return tradeExercisePreSettle({
      positionId: record[POSITION_ID],
      eventDetail: {
        underlyerPrice: Number.isNaN(underlyerPrice) ? '' : String(underlyerPrice),
        numOfOptions: String(
          getNumOfOptionsByNotionalAmount(
            get(values, `asset.${LEG_FIELD.NOTIONAL_AMOUNT}`),
            get(values, `asset.${LEG_FIELD.INITIAL_SPOT}`),
            get(values, `asset.${LEG_FIELD.UNDERLYER_MULTIPLIER}`),
          ),
        ), // 名义本金(手数)
        notionalAmount: String(get(values, `asset.${LEG_FIELD.NOTIONAL_AMOUNT}`)), // 名义本金
      },
      eventType: LCM_EVENT_TYPE_MAP.EXERCISE,
    });
  };

  const canSett = record => {
    if (record[ALREADY]) {
      return false;
    }

    if (
      record[LEG_FIELD.LCM_EVENT_TYPE] === LCM_EVENT_TYPE_MAP.EXPIRATION || // 到期
      record[LEG_FIELD.LCM_EVENT_TYPE] === LCM_EVENT_TYPE_MAP.EXERCISE || // 行权
      record[LEG_FIELD.LCM_EVENT_TYPE] === LCM_EVENT_TYPE_MAP.SETTLE || // 结算
      record[LEG_FIELD.LCM_EVENT_TYPE] === LCM_EVENT_TYPE_MAP.UNWIND // 平仓
    ) {
      return false;
    }

    // 未结算：持仓状态 != 到期 or 行权 or 结算 or 平仓
    if (record[LEG_FIELD.PRODUCT_TYPE] === LEG_TYPE_MAP.VANILLA_EUROPEAN) {
      const expirationDate = get(record, `asset.${LEG_FIELD.EXPIRATION_DATE}`);
      if (moment(expirationDate).isAfter(moment().format('YYYY-MM-DD'))) {
        return false;
      }
    }
    return true;
  };

  const fetch = async (paramsPagination = undefined) => {
    setLoading(true);
    const { error, data = {} } = await trdTradeSettleablePaged({
      page: (paramsPagination || pagination).current - 1,
      pageSize: (paramsPagination || pagination).pageSize,
    });

    if (error) return;
    if (_.isEmpty(data)) return;

    const { page = [], totalCount } = data;

    const priceBySpecifedType = (type, priceInfo = {}) => {
      if (type === SPECIFIED_PRICE_MAP.CLOSE) {
        return priceInfo.close;
      }
      if (type === SPECIFIED_PRICE_MAP.TWAP) {
        return priceInfo.settle;
      }
      return undefined;
    };

    const tableDataSource = _.flatten(
      page.map(item =>
        item.positions.map((node, key) => ({
          ...node,
          ...item,
          ...(item.positions.length > 1 ? { style: { background: '#f2f4f5' } } : null),
          ...(item.positions.length > 1 && key === 0
            ? { timeLineNumber: item.positions.length }
            : null),
        })),
      ),
    );

    const nextPagination = {
      ...pagination,
      total: totalCount,
      current: (paramsPagination || pagination).current,
      pageSize: (paramsPagination || pagination).pageSize,
    };

    const canSettTableData = tableDataSource.filter(record => canSett(record));

    const instrumentIds = canSettTableData
      .filter(item => !!_.get(item, 'asset.underlyerInstrumentId'))
      .map(item => _.get(item, 'asset.underlyerInstrumentId'));
    const mktQuotesListPagedRsp = await mktQuotesListPaged({
      instrumentIds,
    });

    // 如果标的物价格获取失败，结算金额就停止获取
    if (mktQuotesListPagedRsp.error) {
      setLoading(false);
      return;
    }

    const quotes = _.get(mktQuotesListPagedRsp, 'data.page', []);

    const nextCanSettTableData = canSettTableData.map(item => {
      const result = quotes.find(
        quote => _.get(item, 'asset.underlyerInstrumentId') === quote.instrumentId,
      );
      if (result) {
        return {
          ...item,
          [LEG_FIELD.UNDERLYER_PRICE]: Form2.createField(
            formatNumber(
              priceBySpecifedType(_.get(item, `asset.${LEG_FIELD.SPECIFIED_PRICE}`), result),
              4,
            ),
          ),
        };
      }
      return item;
    });

    const startTradeExercisePreSettleRsps = await Promise.all(
      nextCanSettTableData.map(item => startTradeExercisePreSettle(item)),
    ).then(rsps =>
      rsps.map((rsp, index) => ({
        rsp,
        record: nextCanSettTableData[index],
      })),
    );

    setLoading(false);

    const successDtas = startTradeExercisePreSettleRsps.filter(item => !item.rsp.error);
    const distTableData = nextCanSettTableData.map(item => {
      const findItem = successDtas.find(meta => meta.record[POSITION_ID] === item[POSITION_ID]);
      if (findItem) {
        return {
          ...item,
          [LEG_FIELD.SETTLE_AMOUNT]: Form2.createField(
            new BigNumber(findItem.rsp.data)
              .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
              .toNumber(),
          ),
        };
      }
      return item;
    });

    setTableData(distTableData);

    setPagination(nextPagination);
  };

  const onPagination = (current, pageSize) => {
    fetch({
      current,
      pageSize,
    });
  };

  const onShowSizeChange = (current, pageSize) => {
    onPagination(current, pageSize);
  };

  const onChange = (current, pageSize) => {
    onPagination(current, pageSize);
  };

  const generateEvent = async record => {
    if (!record) return;
    const { error, data } = await cliTasksGenerateByTradeId({
      tradeId: record.tradeId,
      legalName: record.counterPartyCode,
    });
  };

  const settlement = async () => {
    const validates = await tableEl.current.validate({}, selectedRowKeys);

    if (validates.some(item => !_.isEmpty(item.errors))) {
      return;
    }

    if (_.isEmpty(selectedRowKeys)) {
      message.warn('请先选择结算对象');
      return;
    }

    if (!currentUser.username) {
      message.error('用户名未成功获取，无法结算');
      return;
    }

    setSettLoading(true);
    const fetchDatas = tableData.filter(item => selectedRowKeys.indexOf(item[POSITION_ID]) !== -1);
    const rsps = await Promise.all(
      fetchDatas.map(record => {
        const values = Form2.getFieldsValue(record);

        const settleAmount = parseFloat(get(values, `${LEG_FIELD.SETTLE_AMOUNT}`));
        const underlyerPrice = parseFloat(get(values, `${LEG_FIELD.UNDERLYER_PRICE}`));
        const positionId = record[POSITION_ID];

        return trdTradeLCMEventProcess({
          positionId,
          tradeId: record.tradeId,
          eventType: LCM_EVENT_TYPE_MAP.EXERCISE,
          userLoginId: currentUser.username,
          eventDetail: {
            underlyerPrice: Number.isNaN(underlyerPrice) ? '' : String(underlyerPrice),
            settleAmount: Number.isNaN(settleAmount) ? '' : String(settleAmount),
            numOfOptions: String(
              getNumOfOptionsByNotionalAmount(
                get(record, `asset.${LEG_FIELD.NOTIONAL_AMOUNT}`),
                get(record, `asset.${LEG_FIELD.INITIAL_SPOT}`),
                get(record, `asset.${LEG_FIELD.UNDERLYER_MULTIPLIER}`),
              ),
            ), // 名义本金(手数)
            notionalAmount: String(get(values, `asset.${LEG_FIELD.NOTIONAL_AMOUNT}`)), // 名义本金
          },
        }).then(rsp => ({
          ...rsp,
          positionId,
        }));
      }),
    );

    const successRsps = rsps.filter(item => !item.error);
    const successPositionIds = successRsps.map(item => item.positionId);

    if (!_.isEmpty(successRsps)) {
      message.success(`批量结算成功：${successPositionIds.join(',')}`);
    }

    // 根据接口返回的 positionIds 判断是否结算成功
    setTableData(pre =>
      pre.map(record => {
        if (successPositionIds.indexOf(record[POSITION_ID]) !== -1) {
          return {
            ...record,
            [ALREADY]: true,
          };
        }
        return record;
      }),
    );

    successPositionIds.forEach(positionId => {
      generateEvent(tableData.find(item => item[POSITION_ID] === positionId));
    });

    setSelectedRowKeys(pre =>
      _.reject(pre, key => successPositionIds.some(positionId => positionId === key)),
    );

    setSettLoading(false);
    setSetted(true);
  };

  const preSettlement = async (record): Promise<boolean> => {
    const validates = await tableEl.current.validate(
      {},
      [record[POSITION_ID]],
      [LEG_FIELD.UNDERLYER_PRICE],
    );

    if (validates.some(item => !_.isEmpty(item.errors))) {
      return true;
    }

    const { error, data } = await startTradeExercisePreSettle(record);

    if (error) return false;

    setTableData(pre =>
      pre.map(item => {
        if (item[POSITION_ID] === record[POSITION_ID]) {
          return {
            ...item,
            [LEG_FIELD.SETTLE_AMOUNT]: Form2.createField(
              new BigNumber(data).decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES).toNumber(),
            ),
          };
        }
        return item;
      }),
    );

    return error;
  };

  useEffect(() => {
    if (!modalVisible) {
      setSetted(false);
      setSelectedRowKeys([]);
      return;
    }
    fetch();
  }, [modalVisible]);

  const handleRowSelectChange = selectedRowKey => {
    setSelectedRowKeys(selectedRowKey);
  };

  const getFooter = () => {
    if (setted) {
      return (
        <Row type="flex" gutter={10} justify="end">
          <Col>
            <Button onClick={() => setModalVisible(false)}>关闭</Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => {
                fetch();
                setSetted(false);
                setSelectedRowKeys([]);
              }}
            >
              刷新
            </Button>
          </Col>
        </Row>
      );
    }

    if (settLoading) {
      return (
        <Row type="flex" gutter={10} justify="end">
          <Button type="primary" loading>
            结算中
          </Button>
        </Row>
      );
    }

    return (
      <Row type="flex" gutter={10} justify="end">
        <Col>
          <Button
            onClick={() => {
              setModalVisible(false);
            }}
          >
            取消
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => {
              settlement();
            }}
          >
            批量结算所选持仓
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="批量结算"
      width={1300}
      visible={modalVisible}
      onCancel={() => {
        setModalVisible(false);
      }}
      footer={getFooter()}
    >
      <Loading loading={loading}>
        <SmartTable
          ref={node => {
            tableEl.current = node;
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelectChange,
            getCheckboxProps: record => ({
              disabled: !canSett(record),
            }),
          }}
          onCellEditingChanged={({ record, rowIndex, dataIndex, rowId }) => {
            if (dataIndex === LEG_FIELD.UNDERLYER_PRICE) {
              preSettlement(record);
            }
          }}
          onCellFieldsChange={({ record, rowIndex, value, rowId, changedFields, allFields }) => {
            setTableData(pre =>
              pre.map(item => {
                if (item[POSITION_ID] === rowId) {
                  return {
                    ...item,
                    ...changedFields,
                  };
                }
                return item;
              }),
            );
          }}
          pagination={false}
          rowKey={POSITION_ID}
          dataSource={tableData}
          scroll={{ x: 2000 }}
          columns={[
            {
              title: '交易簿',
              dataIndex: LEG_FIELD.BOOK_NAME,
            },
            {
              title: '交易ID',
              dataIndex: LEG_FIELD.TRADE_ID,
            },
            {
              title: '交易日',
              dataIndex: LEG_FIELD.TRADE_DATE,
            },
            {
              title: '买/卖',
              dataIndex: `asset.${LEG_FIELD.DIRECTION}`,
              render: val => DIRECTION_ZHCN_MAP[val],
            },
            {
              title: '涨/跌',
              dataIndex: `asset.${LEG_FIELD.OPTION_TYPE}`,
              render: val => OPTION_TYPE_ZHCN_MAP[val],
            },
            {
              title: '期权类型',
              width: 100,
              dataIndex: LEG_FIELD.PRODUCT_TYPE,
              render: val => PRODUCTTYPE_ZHCH_MAP[val],
            },
            {
              title: '行权价',
              align: 'right',
              dataIndex: `asset.${LEG_FIELD.STRIKE}`,
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
              title: '到期日',
              width: 150,
              dataIndex: `asset.${LEG_FIELD.EXPIRATION_DATE}`,
              render: (value, record, index, { form, editing }) => value,
            },
            {
              title: '标的物',
              fixed: 'right',
              width: 150,
              dataIndex: `asset.${LEG_FIELD.UNDERLYER_INSTRUMENT_ID}`,
            },
            {
              title: '结算方式',
              fixed: 'right',
              width: 100,
              dataIndex: `asset.${LEG_FIELD.SPECIFIED_PRICE}`,
              render: val => SPECIFIED_PRICE_ZHCN_MAP[val],
            },
            {
              title: '标的物结算价格',
              fixed: 'right',
              align: 'right',
              width: 150,
              editable: record => canSett(record),
              defaultEditing: false,
              dataIndex: LEG_FIELD.UNDERLYER_PRICE,
              render: (val, record, index, { form, editing }) => {
                if (!record[ALREADY] && !canSett(record)) {
                  return null;
                }
                return (
                  <FormItem>
                    {form.getFieldDecorator({
                      rules: [getRequiredRule()],
                    })(<InputNumber autoFocus autoSelect editing={editing} />)}
                  </FormItem>
                );
              },
            },
            {
              title: '结算金额',
              fixed: 'right',
              align: 'right',
              width: 150,
              editable: record => canSett(record),
              defaultEditing: false,
              dataIndex: LEG_FIELD.SETTLE_AMOUNT,
              render: (val, record, index, { form, editing }) => {
                if (!record[ALREADY] && !canSett(record)) {
                  return null;
                }
                return (
                  <FormItem>
                    {form.getFieldDecorator({
                      rules: [getRequiredRule()],
                    })(
                      <SettleInputNumber
                        autoSelect
                        showReload={!record[ALREADY]}
                        editing={editing}
                        onReload={async () => {
                          const error = await preSettlement(record);
                          if (error) return;
                          message.success('刷新试结算成功');
                        }}
                      />,
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '结算状态',
              fixed: 'right',
              width: 150,
              dataIndex: LEG_FIELD.SETTLE_STATUS,
              render: (val, record, dataIndex) => {
                if (canSett(record)) {
                  return '可结算';
                }
                if (record[ALREADY]) {
                  return '已结算';
                }
                return '无法结算';
              },
            },
          ]}
        />
        <Row type="flex" justify="end" style={{ marginTop: 15 }}>
          <Pagination
            {...{
              size: 'small',
              pageSize: pagination.pageSize,
              current: pagination.current,
              onChange,
              total: pagination.total,
              simple: true,
            }}
          />
        </Row>
      </Loading>
    </Modal>
  );
};

export default memo<any>(
  connect(state => ({
    currentUser: state.user.currentUser,
  }))(Settlement),
);
