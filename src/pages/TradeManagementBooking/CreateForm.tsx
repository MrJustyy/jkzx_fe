import { DatePicker, Form2, Input, Loading, ModalButton, Select, SmartTable } from '@/containers';
import {
  cliAccountListByLegalNames,
  refSalesGetByLegalName,
  refSimilarLegalNameList,
} from '@/services/reference-data-service';
import { refPartyGetByLegalName, trdBookListBySimilarBookName } from '@/services/trade-service';
import { Input as AntInput, Typography } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import moment, { isMoment } from 'moment';
import React, { memo, useState } from 'react';

const InputGroup = AntInput.Group;
const { Title } = Typography;

const CreateForm = memo<any>(props => {
  const { setCreateModalVisible, createFormData, setCreateFormData } = props;
  const [tradeInfo, settradeInfo] = useState({});
  const [tradeTableData, settradeTableData] = useState([]);
  const [tradeBaseLoading, setTradeBaseLoading] = useState(false);

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
          : refPartyGetByLegalNameRsp.data.authorizers
      );
    }

    if (!cliAccountListByLegalNamesRsp.error) {
      settradeInfo(pre => ({
        ...pre,
        cash: Form2.createField(cliAccountListByLegalNamesRsp.data[0].cash),
      }));
    }
  };

  const [loading, setLoading] = useState(false);
  return (
    <Form2
      footer={false}
      dataSource={createFormData}
      onFieldsChange={(props, changedFields, allFields) => {
        if (changedFields.counterPartyCode) {
          featchTradeData(Form2.getFieldValue(changedFields.counterPartyCode));
        }

        setCreateFormData(allFields);
      }}
      columns={[
        {
          dataIndex: 'bookName',
          title: '交易簿',
          render: (val, record, index, { form }) => {
            return (
              <FormItem>
                {form.getFieldDecorator()(
                  <Select
                    {...{
                      editing: true,
                      showSearch: true,
                      allowClear: true,
                      fetchOptionsOnSearch: true,
                      placeholder: '请输入内容搜索',
                      options: async (value: string = '') => {
                        const { data, error } = await trdBookListBySimilarBookName({
                          similarBookName: value,
                        });
                        if (error) return [];
                        return data.map(item => ({
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
          title: '交易编号',
          dataIndex: 'tradeId',
          render: (val, record, index, { form }) => {
            return <FormItem>{form.getFieldDecorator()(<Input />)}</FormItem>;
          },
        },
        {
          title: '交易对手',
          dataIndex: 'counterPartyCode',
          render: (val, record, index, { form }) => {
            return (
              <FormItem>
                <InputGroup compact={true}>
                  {form.getFieldDecorator()(
                    <Select
                      {...{
                        style: {
                          width: '60%',
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
                    />
                  )}
                  <ModalButton
                    type="primary"
                    style={{
                      width: '40%',
                    }}
                    onClick={async () => {
                      setLoading(true);
                      await featchTraderInfo();
                      setLoading(false);
                    }}
                    modalProps={{
                      title: `${Form2.getFieldValue(createFormData.counterPartyCode)} 的基本信息`,
                      width: 800,
                      maskClosable: false,
                      okText: '确认并继续',
                      onCancel: () => {
                        setCreateFormData(pre => ({
                          ...pre,
                          counterPartyCode: undefined,
                        }));
                      },
                    }}
                    disabled={!createFormData.counterPartyCode}
                    content={
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
                                    } else if (value === 'SELL') {
                                      return '卖';
                                    } else {
                                      return '买卖';
                                    }
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
                                    } else if (value === 'LIMITED') {
                                      return '限制交易';
                                    } else {
                                      return '交易标的';
                                    }
                                  };
                                  return <FormItem>{val()}</FormItem>;
                                },
                              },
                              {
                                dataIndex: 'tradingPermissionNote',
                                title: '交易权限备注',
                                render: (value, record, index) => {
                                  return <FormItem>{value}</FormItem>;
                                },
                              },
                              {
                                dataIndex: 'tradingUnderlyers',
                                title: '交易标的',
                                render: value => {
                                  const val = () => {
                                    if (value === 'COMMODITY') {
                                      return '商品';
                                    } else {
                                      return '个股商品';
                                    }
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
                                render: value => <FormItem>{'¥ ' + value}</FormItem>,
                              },
                            ]}
                          />
                          <Title level={4} style={{ fontSize: 14, marginBottom: 20 }}>
                            交易授权人
                          </Title>
                          <SmartTable
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
                                render: (value, record, index, { form }) => {
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
                    }
                  >
                    查看交易对手
                  </ModalButton>
                </InputGroup>
              </FormItem>
            );
          },
        },
        {
          title: '销售',
          dataIndex: 'salesCode',
          render: (value, record, index, { form }) => {
            return (
              <Loading loading={tradeBaseLoading}>
                <FormItem>{form.getFieldDecorator()(<Input disabled={true} />)}</FormItem>
              </Loading>
            );
          },
        },
        {
          title: '交易日',
          dataIndex: 'tradeDate',
          render: (value, record, index, { form }) => {
            return (
              <FormItem>{form.getFieldDecorator()(<DatePicker format="YYYY-MM-DD" />)}</FormItem>
            );
          },
        },
      ]}
    />
  );
});

export default CreateForm;
