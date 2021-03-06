import React, { memo, useState, useRef } from 'react';
import { InputBase } from '@/components/type';
import { Row, Modal, Col, Tag } from 'antd';
import { Form2, Select, InputNumber, Table2, Input } from '@/containers';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import FormItem from 'antd/lib/form/FormItem';
import {
  mktInstrumentSearch,
  mktInstrumentWhitelistListPaged,
  mktInstrumentWhitelistSearch,
  mktInstrumentInfo,
  mktQuotesListPaged,
} from '@/services/market-data-service';
import useLifecycles from 'react-use/lib/useLifecycles';
import { LEG_FIELD, BIG_NUMBER_CONFIG } from '@/constants/common';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

export const Import2 = memo<{
  value?: Array<{
    name?: string;
    underlyerInstrumentId?: string;
    underlyerMultiplier?: number;
    initialSpot?: number;
    weight?: number;
  }>;
}>(props => {
  const { value, onChange, onValueChange } = props;
  if (!Array.isArray(value)) {
    throw new Error('value 必须是数组类型');
  }

  const [tableDataSource, setTableDataSource] = useState(
    value.length
      ? value.map(item => Form2.createFields(item, ['name']))
      : [{ name: '标的物1' }, { name: '标的物2' }]
  );

  const [visible, setVisible] = useState(true);

  const hideModal = () => {
    setVisible(false);
  };

  const onCellFieldsChange = async params => {
    const { changedFields, rowIndex } = params;
    setTableDataSource(prev => {
      return prev.map((item, index) => {
        if (index === rowIndex) {
          return {
            ...item,
            ...changedFields,
          };
        }
        return item;
      });
    });
  };

  return (
    <Modal
      closable={false}
      width={1000}
      visible={visible}
      onCancel={() => {
        hideModal();
      }}
      onOk={() => {
        hideModal();
        if (onChange) {
          onChange(tableDataSource.map(item => Form2.getFieldsValue(item)));
        }

        if (onValueChange) {
          onValueChange(tableDataSource.map(item => Form2.getFieldsValue(item)));
        }
      }}
    >
      <Table2
        onCellFieldsChange={onCellFieldsChange}
        onCellEditingChanged={async params => {
          const { dataIndex, rowIndex, value } = params;
          if (dataIndex === 'underlyerInstrumentId') {
            const [multipleRsp, initialSpotRsp] = await Promise.all([
              mktInstrumentInfo({
                instrumentId: value,
              }),
              mktQuotesListPaged({
                instrumentIds: [value],
              }),
            ]);
            if (initialSpotRsp.error) return;
            const multiple =
              multipleRsp.error || multipleRsp.data.instrumentInfo.multiplier === undefined
                ? 1
                : new BigNumber(multipleRsp.data.instrumentInfo.multiplier)
                    .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
                    .toNumber();
            const initialSpot = new BigNumber(
              _.chain(initialSpotRsp)
                .get('data.page[0]')
                .omitBy(_.isNull)
                .get('last', 1)
                .value()
            )
              .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
              .toNumber();

            const weight = new BigNumber(1)
              .div(initialSpot)
              .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
              .toNumber();
            const fetchData = tableDataSource.map((item, index) => {
              if (index === rowIndex) {
                return {
                  ...item,
                  //   ...params.changedFields,
                  underlyerMultiplier: Form2.createField(multiple),
                  initialSpot: Form2.createField(initialSpot),
                  weight: Form2.createField(weight),
                };
              }
              return item;
            });
            return setTableDataSource(fetchData);
          }
          if (dataIndex === 'initialSpot') {
            const weight = new BigNumber(1)
              .div(value)
              .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
              .toNumber();
            const fetchData = tableDataSource.map((item, index) => {
              if (index === rowIndex) {
                return {
                  ...item,
                  weight: Form2.createField(weight),
                };
              }
              return item;
            });
            return setTableDataSource(fetchData);
          }
        }}
        rowKey="name"
        dataSource={tableDataSource}
        pagination={false}
        columns={[
          {
            title: '标的物编号',
            dataIndex: 'name',
          },
          {
            title: '标的物',
            dataIndex: 'underlyerInstrumentId',
            editable: true,
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <Select
                      editing={editing}
                      autoSelect={true}
                      style={{ minWidth: 180 }}
                      {...{
                        fetchOptionsOnSearch: true,
                        placeholder: '请输入内容搜索',
                        autoSelect: true,
                        showSearch: true,
                        options: async (value: string) => {
                          const { data, error } = await mktInstrumentWhitelistSearch({
                            instrumentIdPart: value,
                          });
                          if (error) return [];
                          return data.slice(0, 50).map(item => ({
                            label: item,
                            value: item,
                          }));
                        },
                      }}
                    />
                  )}
                </FormItem>
              );
            },
          },
          {
            title: '合约乘数',
            dataIndex: 'underlyerMultiplier',
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(<InputNumber disabled={true} editing={editing} />)}
                </FormItem>
              );
            },
          },
          {
            title: '期初价格(￥)',
            dataIndex: 'initialSpot',
            editable: true,
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <UnitInputNumber editing={editing} autoSelect={true} />
                  )}
                </FormItem>
              );
            },
          },
          {
            title: '权重',
            dataIndex: 'weight',
            editable: true,
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <UnitInputNumber editing={editing} autoSelect={true} unit="" />
                  )}
                </FormItem>
              );
            },
          },
        ]}
      />
    </Modal>
  );
});

export const Import3 = memo<{
  value?: Array<{
    name?: string;
    instrumentId?: string;
    multiple?: number;
    initialSpot?: number;
  }>;
}>(props => {
  const { value, onChange, onValueChange, record } = props;
  const [visible, setVisible] = useState(true);
  if (!Array.isArray(value)) {
    throw new Error('value 必须是数组类型');
  }

  const instrumentId = _.get(record, [LEG_FIELD.UNDERLYER_INSTRUMENT_ID, 'value']).map(item => {
    return item[LEG_FIELD.UNDERLYER_INSTRUMENT_ID];
  });

  const [tableDataSource, setTableDataSource] = useState(
    value.length
      ? value.map(item => Form2.createFields(item, ['name']))
      : [{ name: '标的物1' }, { name: '标的物2' }]
  );

  useLifecycles(() => {
    setTableDataSource(prev => {
      prev.map((item, index) => {
        return {
          ...item,
          instrumentId: instrumentId[index],
        };
      });
    });
  });

  const onCellFieldsChange = async params => {
    const { changedFields, rowIndex } = params;
    setTableDataSource(prev => {
      return prev.map((item, index) => {
        if (index === rowIndex) {
          return {
            ...item,
            ...changedFields,
          };
        }
        return item;
      });
    });
  };

  return (
    <Modal
      closable={false}
      width={1000}
      visible={visible}
      onCancel={() => {
        setVisible(false);
      }}
      onOk={() => {
        setVisible(false);
        if (onChange) {
          onChange(tableDataSource.map(item => Form2.getFieldsValue(item)));
        }

        if (onValueChange) {
          onValueChange(tableDataSource.map(item => Form2.getFieldsValue(item)));
        }
      }}
    >
      <Table2
        onCellFieldsChange={onCellFieldsChange}
        rowKey="name"
        dataSource={tableDataSource}
        pagination={false}
        columns={[
          {
            title: '标的物编号',
            dataIndex: 'name',
          },
          {
            title: '标的物',
            dataIndex: 'instrumentId',
            editable: false,
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <Select
                      editing={false}
                      autoSelect={true}
                      style={{ minWidth: 180 }}
                      {...{
                        fetchOptionsOnSearch: true,
                        placeholder: '请输入内容搜索',
                        autoSelect: true,
                        showSearch: true,
                        options: async (value: string) => {
                          const { data, error } = await mktInstrumentWhitelistSearch({
                            instrumentIdPart: value,
                          });
                          if (error) return [];
                          return data.slice(0, 50).map(item => ({
                            label: item,
                            value: item,
                          }));
                        },
                      }}
                    />
                  )}
                </FormItem>
              );
            },
          },
          {
            title: '波动率(%)',
            dataIndex: 'vol',
            editable: true,
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <UnitInputNumber editing={editing} autoSelect={true} unit={'%'} />
                  )}
                </FormItem>
              );
            },
          },
          {
            title: '分红/融券(%)',
            dataIndex: 'q',
            editable: true,
            defaultEditing: false,
            render: (val, record, index, { form, editing }) => {
              return (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <UnitInputNumber editing={editing} autoSelect={true} unit={'%'} />
                  )}
                </FormItem>
              );
            },
          },
        ]}
      />
    </Modal>
  );
});
