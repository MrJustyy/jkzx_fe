import { Button, Input as AntInput, Modal, Typography } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import moment, { isMoment } from 'moment';
import React, { memo, useState } from 'react';
import _ from 'lodash';
import { FORM_EDITABLE_STATUS } from '@/constants/global';
import { DatePicker, Form2, Input, Loading, Select, Table2 } from '@/containers';
import {
  cliAccountListByLegalNames,
  refSalesGetByLegalName,
  refSimilarLegalNameList,
  refFuzzyQueryEnabledPartyNames,
} from '@/services/reference-data-service';
import { refPartyGetByLegalName, trdBookListBySimilarBookName } from '@/services/trade-service';
import { getFormEditingMeta } from '@/tools';

const InputGroup = AntInput.Group;
const { Title } = Typography;

const COMMON_FIELD = 'comment';

const BookingBaseInfoForm = memo<any>(props => {
  const {
    createFormData,
    setCreateFormData,
    editableStatus = FORM_EDITABLE_STATUS.EDITING_NO_CONVERT,
    columnNumberOneRow = 1,
    currentCreateFormRef,
    hideRequiredMark,
  } = props;
  const [tradeInfo, settradeInfo] = useState({});
  const [tradeTableData, settradeTableData] = useState([]);
  const [tradeBaseLoading, setTradeBaseLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const featchTradeData = async counterPartyCode => {
    setTradeBaseLoading(true);
    const refSalesGetByLegalNameRsp = await refSalesGetByLegalName({
      legalName: counterPartyCode,
    });
    setTradeBaseLoading(false);
    if (refSalesGetByLegalNameRsp.error) return;
    setCreateFormData(pre => ({
      ...pre,
      salesCode: Form2.createField(refSalesGetByLegalNameRsp.data.salesName),
    }));
  };

  const featchTraderInfo = async () => {
    const [refPartyGetByLegalNameRsp, cliAccountListByLegalNamesRsp] = await Promise.all([
      refPartyGetByLegalName({
        legalName: Form2.getFieldValue(createFormData.counterPartyCode),
      }),
      cliAccountListByLegalNames({
        legalNames: [Form2.getFieldValue(createFormData.counterPartyCode)],
      }),
    ]);

    if (!refPartyGetByLegalNameRsp.error) {
      settradeInfo(pre => ({
        ...pre,
        ...Form2.createFields(refPartyGetByLegalNameRsp.data),
      }));
      settradeTableData(
        !refPartyGetByLegalNameRsp.data.authorizers
          ? []
          : refPartyGetByLegalNameRsp.data.authorizers,
      );
    }

    if (!cliAccountListByLegalNamesRsp.error) {
      settradeInfo(pre => ({
        ...pre,
        cash: Form2.createField(cliAccountListByLegalNamesRsp.data[0].cash),
      }));
    }
  };

  const formEditingMeta = getFormEditingMeta(editableStatus);

  return (
    <>
      <Modal
        {...{
          visible: modalVisible,
          title: `${Form2.getFieldValue(createFormData.counterPartyCode)} 的基本信息`,
          width: 800,
          maskClosable: false,
          closable: false,
          okText: '确认并继续',
          onCancel: () => {
            setCreateFormData(pre => ({
              ...pre,
              counterPartyCode: undefined,
              salesCode: undefined,
            }));
            setModalVisible(false);
          },
          onOk: () => {
            setModalVisible(false);
          },
        }}
      >
        <Loading loading={loading}>
          <Typography>
            <Title level={4} style={{ fontSize: 14 }}>
              交易权限
            </Title>
            <Form2
              footer={false}
              dataSource={tradeInfo}
              columnNumberOneRow={2}
              columns={[
                {
                  dataIndex: 'tradingDirection',
                  title: '交易方向',
                  render: (value, record, index, { form }) => {
                    const val = () => {
                      if (value === 'BUY') {
                        return '买';
                      }
                      if (value === 'SELL') {
                        return '卖';
                      }
                      return '买卖';
                    };
                    return <FormItem>{val()}</FormItem>;
                  },
                },
                {
                  dataIndex: 'tradingPermission',
                  title: '交易权限',
                  render: (value, record, index) => {
                    const val = () => {
                      if (value === 'FULL') {
                        return '交易';
                      }
                      if (value === 'LIMITED') {
                        return '限制交易';
                      }
                      return '交易标的';
                    };
                    return <FormItem>{val()}</FormItem>;
                  },
                },
                {
                  dataIndex: 'tradingPermissionNote',
                  title: '交易权限备注',
                  render: (value, record, index) => <FormItem>{value}</FormItem>,
                },
                {
                  dataIndex: 'tradingUnderlyers',
                  title: '交易标的',
                  render: value => {
                    const val = () => {
                      if (value === 'COMMODITY') {
                        return '商品';
                      }
                      return '个股商品';
                    };
                    return <FormItem>{val()}</FormItem>;
                  },
                },
              ]}
            />
            <Title level={4} style={{ fontSize: 14 }}>
              客户可用资金
            </Title>
            <Form2
              footer={false}
              dataSource={tradeInfo}
              columnNumberOneRow={2}
              columns={[
                {
                  dataIndex: 'cash',
                  title: '可用资金',
                  render: value => <FormItem>{`¥ ${value}`}</FormItem>,
                },
              ]}
            />
            <Title level={4} style={{ fontSize: 14, marginBottom: 20 }}>
              交易授权人
            </Title>
            <Table2
              pagination={false}
              rowKey="tradeAuthorizerIdNumber"
              columns={[
                {
                  title: '姓名',
                  dataIndex: 'tradeAuthorizerName',
                },
                {
                  title: '身份证号',
                  dataIndex: 'tradeAuthorizerIdNumber',
                },
                {
                  title: '证件有效期',
                  dataIndex: 'tradeAuthorizerIdExpiryDate',
                  render: (val, record, index, { form }) => {
                    let value = val;
                    if (isMoment(value)) {
                      value = value.format('YYYY-MM-DD');
                    }
                    const isOverlate = moment(value).isBefore(moment());

                    if (isOverlate) {
                      return (
                        <span>
                          {value}
                          <span style={{ color: 'red' }}>(已过期)</span>
                        </span>
                      );
                    }
                    return value;
                  },
                },
                {
                  title: '电话',
                  dataIndex: 'tradeAuthorizerPhone',
                },
              ]}
              dataSource={tradeTableData}
            />
          </Typography>
        </Loading>
      </Modal>
      <Form2
        hideRequiredMark={hideRequiredMark}
        ref={node => (currentCreateFormRef ? currentCreateFormRef(node) : null)}
        columnNumberOneRow={columnNumberOneRow}
        footer={false}
        dataSource={createFormData}
        onFieldsChange={(params, changedFields, allFields) => {
          setCreateFormData({
            ...createFormData,
            ..._.mapValues<any>(changedFields, (val, key) => {
              if (key === COMMON_FIELD) {
                return {
                  ...val,
                  value: _.last(val.value),
                };
              }
              return val;
            }),
          });
        }}
        onValuesChange={(params, changedValues, allValues) => {
          if (changedValues.counterPartyCode) {
            featchTradeData(Form2.getFieldValue(changedValues.counterPartyCode));
          }
        }}
        columns={[
          {
            ...formEditingMeta,
            dataIndex: 'bookName',
            title: '交易簿',
            render: (val, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({
                  rules: [
                    {
                      required: true,
                      message: '交易簿为必填项',
                    },
                  ],
                })(
                  <Select
                    {...{
                      editing,
                      defaultOpen: !editing,
                      showSearch: true,
                      allowClear: true,
                      fetchOptionsOnSearch: true,
                      placeholder: '请输入内容搜索',
                      options: async (value: string = '') => {
                        const { data, error } = await trdBookListBySimilarBookName({
                          similarBookName: value,
                        });
                        if (error) return [];
                        return data
                          .sort((a, b) => a.localeCompare(b))
                          .map(item => ({
                            label: item,
                            value: item,
                          }));
                      },
                    }}
                    data-test="tradingBook"
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '交易编号',
            ...formEditingMeta,
            dataIndex: 'tradeId',
            render: (val, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({
                  rules: [
                    {
                      required: true,
                      message: '交易编号为必填项',
                    },
                  ],
                })(<Input editing={editing} autoSelect={!editing} data-test="tradingNumber" />)}
              </FormItem>
            ),
          },
          {
            title: '交易对手',
            ...formEditingMeta,
            dataIndex: 'counterPartyCode',
            render: (val, record, index, { form, editing }) => (
              <FormItem>
                {editing ? (
                  <>
                    <InputGroup compact>
                      {form.getFieldDecorator({
                        rules: [
                          {
                            required: true,
                            message: '交易对手为必填项',
                          },
                        ],
                      })(
                        <Select
                          {...{
                            style: {
                              width: '60%',
                            },
                            defaultOpen: !editing,
                            editing,
                            fetchOptionsOnSearch: true,
                            showSearch: true,
                            allowClear: true,
                            placeholder: '请输入内容搜索',
                            options: async (value: string = '') => {
                              const { data, error } = await refFuzzyQueryEnabledPartyNames({
                                similarLegalName: value,
                              });
                              if (error) return [];
                              return data.map(item => ({
                                label: item,
                                value: item,
                              }));
                            },
                          }}
                          data-test="tradingRival"
                        />,
                      )}
                      <Button
                        type="primary"
                        style={{
                          width: '40%',
                        }}
                        onClick={async () => {
                          setModalVisible(true);
                          setLoading(true);
                          await featchTraderInfo();
                          setLoading(false);
                        }}
                        disabled={!Form2.getFieldValue(createFormData.counterPartyCode)}
                      >
                        查看交易对手
                      </Button>
                    </InputGroup>
                  </>
                ) : (
                  form.getFieldDecorator({
                    rules: [
                      {
                        required: true,
                        message: '交易对手为必填项',
                      },
                    ],
                  })(<Input editing={editing} />)
                )}
              </FormItem>
            ),
          },
          {
            title: '销售',
            ...formEditingMeta,
            dataIndex: 'salesCode',
            render: (value, record, index, { form, editing }) => (
              <Loading loading={tradeBaseLoading}>
                <FormItem>
                  {form.getFieldDecorator({
                    rules: [
                      {
                        required: true,
                        message: '销售为必填项',
                      },
                    ],
                  })(<Input editing={editing} disabled />)}
                </FormItem>
              </Loading>
            ),
          },
          {
            title: '交易日',
            ...formEditingMeta,
            dataIndex: 'tradeDate',
            render: (value, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({
                  rules: [
                    {
                      required: true,
                      message: '交易日为必填项',
                    },
                  ],
                })(
                  <DatePicker
                    editing={editing}
                    data-test="tradingDate"
                    format="YYYY-MM-DD"
                    defaultOpen={!editing}
                  />,
                )}
              </FormItem>
            ),
          },
          {
            title: '备注',
            ...formEditingMeta,
            dataIndex: COMMON_FIELD,
            render: (value, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator()(
                  <Select
                    data-test="tradingNote"
                    editing={editing}
                    mode="tags"
                    style={{ width: '100%' }}
                    tokenSeparators={[',']}
                    options={[
                      {
                        label: '期权',
                        value: '期权',
                      },
                      {
                        label: '线性互换',
                        value: '线性互换',
                      },
                      {
                        label: '非线性互换',
                        value: '非线性互换',
                      },
                      {
                        label: '远期',
                        value: '远期',
                      },
                    ]}
                  />,
                )}
              </FormItem>
            ),
          },
        ]}
      />
    </>
  );
});

export default BookingBaseInfoForm;
