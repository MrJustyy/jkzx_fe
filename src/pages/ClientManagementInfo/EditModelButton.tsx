/* eslint-disable */
import { Button, Cascader, notification, Row, Spin, Tabs } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import moment from 'moment';
import React, { memo, useRef, useState } from 'react';
import EmailInput from '@/containers/EmailInput';
import Upload from '@/containers/Upload';
import {
  DatePicker,
  Form2,
  Input,
  InputNumber,
  ModalButton,
  Select,
  Table2,
  SmartTable,
} from '@/containers';
import { remove, uuid, getMoment } from '@/tools';
import { getPartyDoc, HREF_UPLOAD_URL, UPLOAD_URL } from '@/services/document';
import { createRefParty, refPartyGetByLegalName } from '@/services/reference-data-service';
import {
  ALL_DATE_FIELD_KEYS,
  BASE_FORM_FIELDS,
  PARTY_DOC_CREATE_OR_UPDATE,
  TRADER_TYPE,
} from './constants';
import { getToken } from '@/tools/authority';
import { queryProcessForm, queryProcessHistoryForm } from '@/services/approval';

const { TabPane } = Tabs;

const useTableData = props => {
  const { record = {}, modelEditable, status } = props;
  const [loading, setLoading] = useState(false);
  const [baseFormData, setBaseFormData] = useState({});
  const [traderList, setTraderList] = useState([]);

  const fetchData = async (param, processInstanceId) => {
    setLoading(true);
    let result = {};
    let data = {};
    if (processInstanceId) {
      const isCompleted = param.processInstanceStatusEnum
        ? !_.toLower(param.processInstanceStatusEnum).includes('unfinished') && status !== 'pending'
        : false;
      const executeMethod = isCompleted ? queryProcessHistoryForm : queryProcessForm;
      const res = await executeMethod({
        processInstanceId,
      });
      if (!res || res.error) {
        this.setState({
          loading: false,
        });
        return;
      }
      data = _.get(res, 'data.process._business_payload');
    } else {
      result = await refPartyGetByLegalName({ legalName: record.legalName });
      data = result.data;
    }
    setLoading(false);
    if (result.error) return;

    const newData = {};
    const authorizers = data.tradeAuthorizer || data.authorizers;
    if (modelEditable !== false) {
      data.salesName = [
        data.subsidiaryName ? data.subsidiaryName : '',
        data.branchName ? data.branchName : '',
        data.salesName ? data.salesName : '',
      ];
    }
    const requests = Object.keys(data).map(async item => {
      newData[item] = Form2.createField(data[item]);
      if (_.includes(ALL_DATE_FIELD_KEYS, item)) {
        newData[item].value = data[item] ? getMoment(data[item]) : undefined;
      }
      if (item.endsWith('Doc') || item === 'creditAgreement') {
        newData[item].value = [];
        if (data[item]) {
          return getPartyDoc({ uuid: data[item] });
        }
      }
    });
    setLoading(true);
    const [...res] = await Promise.all(requests);
    setLoading(false);
    res.forEach((item, index) => {
      if (!item) return;
      const _item = Object.keys(data)[index];
      if (_item.endsWith('Doc') || _item === 'creditAgreement') {
        const { error, data } = item;
        if (!error && data.name) {
          newData[_item].value.push({
            name: data.templates[0].fileName,
            id: data.uuid,
            uid: data.uuid,
          });
          newData[_item].uid = data.uuid;
        }
      }
      // if (ALL_DATE_FIELD_KEYS.indexOf(_item) !== -1 && newData[_item].value != null) {
      //   newData[_item].value = moment(newData[_item].value);
      // }
    });

    setBaseFormData(newData);
    const _traderList = (authorizers || []).map(item => {
      item = {
        name: item.tradeAuthorizerName,
        phoneNumber: item.tradeAuthorizerPhone,
        periodValidity: item.tradeAuthorizerIdExpiryDate
          ? getMoment(item.tradeAuthorizerIdExpiryDate)
          : item.tradeAuthorizerIdExpiryDate,
        IDNumber: item.tradeAuthorizerIdNumber,
      };
      Object.keys(item).forEach(async param => {
        item[param] = {
          name: param,
          value: item[param],
          type: 'field',
        };
      });
      item = { ...item, uuid: uuid() };
      return item;
    });
    setTraderList(_traderList);
  };

  // useLifecycles(() => {
  //   fetchData();
  // });

  return {
    baseFormData,
    setBaseFormData,
    traderList,
    setTraderList,
    fetchData,
    loading,
    setLoading,
  };
};

const EditModalButton = memo<any>(props => {
  let columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (val, record, index, { form, editing }) => (
        <FormItem hasFeedback={!disabled}>
          {form.getFieldDecorator({
            rules: [
              {
                required: false,
              },
            ],
          })(<Input disabled={disabled} editing={editable} />)}
        </FormItem>
      ),
    },
    {
      title: '身份证号',
      dataIndex: 'IDNumber',
      render: (val, record, index, { form, editing }) => (
        <FormItem hasFeedback={!disabled}>
          {form.getFieldDecorator({
            rules: [
              {
                required: false,
              },
            ],
          })(<Input disabled={disabled} editing={editable} />)}
        </FormItem>
      ),
    },
    {
      title: '证件有效期',
      dataIndex: 'periodValidity',
      render: (val, record, index, { form, editing }) => (
        <FormItem hasFeedback={!disabled}>
          {form.getFieldDecorator({
            rules: [
              {
                required: false,
              },
            ],
          })(<DatePicker disabled={disabled} editing={editable} format="YYYY-MM-DD" />)}
        </FormItem>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phoneNumber',
      render: (val, record, index, { form, editing }) => (
        <FormItem hasFeedback={!disabled}>
          {form.getFieldDecorator({
            rules: [
              {
                required: false,
              },
            ],
          })(<Input disabled={disabled} editing={editable} />)}
        </FormItem>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (val, record, index, { form, editing }) => (
        <a
          href="javascript:;"
          style={{ color: 'red' }}
          onClick={() => {
            const next = remove(traderList, (item, iindex) => iindex === index);
            setTraderList(next);
          }}
        >
          删除
        </a>
      ),
    },
  ];

  const { salesCascaderList = [], name, fetchTable, formData, modelEditable, content } = props;
  const formRef = useRef<Form2>(null);
  const initialFormDatas: any = {};
  const {
    baseFormData,
    setBaseFormData,
    traderList,
    setTraderList,
    fetchData,
    loading,
    setLoading,
  } = useTableData(props);

  const tableEl = useRef<Table2>(null);
  let disabled = false;
  let editable = true;
  const [modalVisible, setModalVisible] = useState(false);

  if (modelEditable === false) {
    disabled = true;
    editable = false;
  }

  if (disabled) {
    const cloneColumns = [...columns];
    cloneColumns.pop();
    columns = cloneColumns;
  }

  const handleValue = val => {
    const result = _.get(val, '[0].response.result');
    if (_.isArray(val)) {
      val = (val || []).map(item => {
        if (result) {
          item.url = `${HREF_UPLOAD_URL}${_.get(result, 'uuid')}&partyDoc=true`;
          return item;
        }
        const error = _.get(val, '[0].response.error');
        if (error) {
          item.status = 'error';
        }
        item.url = `${HREF_UPLOAD_URL}${item.uid}&partyDoc=true`;
        return item;
      });
    }
    if (!_.isArray(val)) {
      val = [
        {
          name: val,
          id: val,
          uid: val,
        },
      ];
    }

    return val;
  };

  return (
    <ModalButton
      text
      content={
        <Spin spinning={loading}>
          <>
            <Tabs type="card">
              <TabPane tab="基本信息" key="1">
                <Form2
                  ref={node => {
                    formRef.current = node;
                  }}
                  onFieldsChange={(props, changedFields, allFields) => {
                    setBaseFormData({ ...baseFormData, ...changedFields });
                  }}
                  dataSource={baseFormData}
                  style={{ paddingTop: 20 }}
                  footer={false}
                  columnNumberOneRow={editable ? 3 : 2}
                  layout={editable ? 'vertical' : 'horizontal'}
                  hideRequiredMark={!editable}
                  wrapperCol={{ span: 12 }}
                  labelCol={{ span: 12 }}
                  columns={[
                    {
                      title: (
                        <span>
                          开户名称
                          <span style={{ fontSize: 12 }} />
                        </span>
                      ),
                      dataIndex: BASE_FORM_FIELDS.LEGALNAME,
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled} help="创建后不允许修改">
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(
                            <Input
                              disabled={props.processInstanceId ? false : true}
                              editing={editable}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '交易对手类型',
                      dataIndex: BASE_FORM_FIELDS.TRADER_TYPE,
                      render: (val, record, index, { form }) => (
                        <FormItem
                          hasFeedback={!disabled}
                          extra="产品户 需要在下一步补充产品信息内容"
                        >
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(
                            <Select
                              style={{ width: '100%' }}
                              disabled={disabled}
                              editing={editable}
                              options={[
                                {
                                  label: '产品户',
                                  value: TRADER_TYPE.PRODUCT,
                                },
                                {
                                  label: '机构户',
                                  value: TRADER_TYPE.ENTERPRISE,
                                },
                              ]}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '机构类型',
                      dataIndex: 'investorType',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(
                            <Select
                              disabled={disabled}
                              editing={editable}
                              options={[
                                {
                                  label: ' 一般机构普通投资者',
                                  value: 'NON_PROFESSINAL_INVESTOR',
                                },
                                {
                                  label: '一般机构专业投资者',
                                  value: 'PROFESSIONAL_INVESTOR',
                                },
                                {
                                  label: '金融机构专业投资者',
                                  value: 'FINANCIAL_INSTITUTIONAL_INVESTOR',
                                },
                                {
                                  label: '金融产品',
                                  value: 'FINANCIAL_PRODUCT',
                                },
                              ]}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '开户法人',
                      dataIndex: 'legalRepresentative',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '注册地址',
                      dataIndex: 'address',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '开户销售',
                      dataIndex: 'salesName',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {!disabled ? (
                            form.getFieldDecorator({
                              rules: [
                                {
                                  required: true,
                                  message: '必填',
                                },
                              ],
                            })(
                              <Cascader
                                placeholder="请输入内容"
                                style={{ width: '100%' }}
                                options={salesCascaderList}
                                disabled={disabled}
                                showSearch={{
                                  filter: (inputValue, path) =>
                                    path.some(
                                      option =>
                                        option.label
                                          .toLowerCase()
                                          .indexOf(inputValue.toLowerCase()) > -1,
                                    ),
                                }}
                              />,
                            )
                          ) : (
                            <Input editing={editable} value={val} />
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '担保人',
                      dataIndex: 'warrantor',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '担保人地址',
                      dataIndex: 'warrantorAddress',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '联系人',
                      dataIndex: 'contact',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '交易电话',
                      dataIndex: 'tradePhone',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '交易指定邮箱',
                      dataIndex: 'tradeEmail',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<EmailInput style={{ width: '100%' }} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '主协议编号',
                      dataIndex: 'masterAgreementId',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: true,
                                message: '必填',
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '托管邮箱',
                      dataIndex: 'trustorEmail',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<EmailInput style={{ width: '100%' }} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '补充协议编号',
                      dataIndex: 'supplementalAgreementId',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '授权到期日',
                      dataIndex: 'authorizeExpiryDate',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <DatePicker
                              disabled={disabled}
                              editing={editable}
                              format="YYYY-MM-DD"
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '协议签署授权人姓名',
                      dataIndex: 'signAuthorizerName',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '协议签署授权人身份证号',
                      dataIndex: 'signAuthorizerIdNumber',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '协议签署授权人证件有效期',
                      dataIndex: 'signAuthorizerIdExpiryDate',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <DatePicker
                              disabled={disabled}
                              editing={editable}
                              format="YYYY-MM-DD"
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '主协议编号版本',
                      dataIndex: 'masterAgreementNoVersion',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <Select
                              editing={editable}
                              options={[
                                {
                                  label: ' SAC2014',
                                  value: 'SAC2014',
                                },
                                {
                                  label: 'SAC2015',
                                  value: 'SAC2015',
                                },
                                {
                                  label: 'ISDA',
                                  value: 'ISDA',
                                },
                                {
                                  label: 'OTHER',
                                  value: 'OTHER',
                                },
                                {
                                  label: 'NAFMII',
                                  value: 'NAFMII',
                                },
                              ]}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '主协议签证日期',
                      dataIndex: 'masterAgreementSignDate',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<DatePicker editing={editable} format="YYYY-MM-DD" />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '营业执照',
                      dataIndex: 'businessLicense',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input editing={editable} />)}
                        </FormItem>
                      ),
                    },
                  ]}
                />
              </TabPane>
              <TabPane
                tab="产品信息"
                key="2"
                disabled={
                  _.get(baseFormData, `${BASE_FORM_FIELDS.TRADER_TYPE}.value`) ===
                  TRADER_TYPE.ENTERPRISE
                    ? true
                    : false
                }
              >
                <Form2
                  ref={node => {
                    formRef.current = node;
                  }}
                  onFieldsChange={(props, changedFields, allFields) => {
                    setBaseFormData({ ...baseFormData, ...changedFields });
                  }}
                  dataSource={baseFormData}
                  style={{ paddingTop: 20 }}
                  footer={false}
                  columnNumberOneRow={editable ? 3 : 2}
                  layout={editable ? 'vertical' : 'horizontal'}
                  hideRequiredMark={!editable}
                  wrapperCol={{ span: 12 }}
                  labelCol={{ span: 12 }}
                  columns={[
                    {
                      title: '产品名称',
                      dataIndex: BASE_FORM_FIELDS.PRODUCTNAME,
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '产品代码',
                      dataIndex: 'productCode',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '产品类型',
                      dataIndex: 'productType',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '备案编号',
                      dataIndex: 'recordNumber',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '产品成立日',
                      dataIndex: 'productFoundDate',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <DatePicker
                              disabled={disabled}
                              editing={editable}
                              format="YYYY-MM-DD"
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '产品到期日',
                      dataIndex: 'productExpiringDate',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <DatePicker
                              disabled={disabled}
                              editing={editable}
                              format="YYYY-MM-DD"
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '基金经理',
                      dataIndex: 'fundManager',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                  ]}
                />
              </TabPane>
              <TabPane tab="权限和授信" key="3">
                <Form2
                  ref={node => {
                    formRef.current = node;
                  }}
                  onFieldsChange={(props, changedFields, allFields) => {
                    setBaseFormData({ ...baseFormData, ...changedFields });
                  }}
                  dataSource={baseFormData}
                  style={{ paddingTop: 20 }}
                  footer={false}
                  columnNumberOneRow={editable ? 3 : 2}
                  layout={editable ? 'vertical' : 'horizontal'}
                  hideRequiredMark={!editable}
                  wrapperCol={{ span: 12 }}
                  labelCol={{ span: 12 }}
                  columns={[
                    {
                      title: '交易方向',
                      dataIndex: 'tradingDirection',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <Select
                              disabled={disabled}
                              editing={editable}
                              options={[
                                {
                                  label: '买',
                                  value: 'BUY',
                                },
                                {
                                  label: '卖',
                                  value: 'SELL',
                                },
                                {
                                  label: '买卖',
                                  value: 'BUY_SELL',
                                },
                              ]}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '交易权限',
                      dataIndex: 'tradingPermission',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <Select
                              disabled={disabled}
                              editing={editable}
                              options={[
                                {
                                  label: '交易',
                                  value: 'FULL',
                                },
                                {
                                  label: '限制交易',
                                  value: 'LIMITED',
                                },
                                {
                                  label: '交易标的',
                                  value: 'BY_UNDERLYER',
                                },
                              ]}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: '交易权限备注',
                      dataIndex: 'tradingPermissionNote',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<Input disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                    {
                      title: '交易标的',
                      dataIndex: 'tradingUnderlyers',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(
                            <Select
                              options={[
                                {
                                  label: '个股商品',
                                  value: 'EQUITY_COMMODITY',
                                },
                                {
                                  label: '商品',
                                  value: 'COMMODITY',
                                },
                              ]}
                              disabled={disabled}
                              editing={editable}
                            />,
                          )}
                        </FormItem>
                      ),
                    },
                    {
                      title: (
                        <span>
                          保证金折扣<span style={{ fontSize: 12 }}>（例如：0.8表示八折）</span>
                        </span>
                      ),
                      dataIndex: 'marginDiscountRate',
                      render: (val, record, index, { form }) => (
                        <FormItem hasFeedback={!disabled}>
                          {form.getFieldDecorator({
                            rules: [
                              {
                                required: false,
                              },
                            ],
                          })(<InputNumber disabled={disabled} editing={editable} />)}
                        </FormItem>
                      ),
                    },
                  ]}
                />
              </TabPane>
              <TabPane tab="交易授权人" key="4">
                <SmartTable
                  size="small"
                  rowKey="uuid"
                  pagination={false}
                  dataSource={traderList}
                  ref={node => (tableEl.current = node)}
                  onCellFieldsChange={({ rowIndex, changedFields }) => {
                    setTraderList(
                      traderList.map((item, index) => {
                        if (index === rowIndex) {
                          return {
                            ...item,
                            ...changedFields,
                          };
                        }
                        return item;
                      }),
                    );
                  }}
                  columns={columns}
                />
                {!disabled ? (
                  <Button
                    style={{ marginTop: 10 }}
                    onClick={() => {
                      setTraderList(traderList.concat({ uuid: uuid() }));
                    }}
                    block
                    type="dashed"
                  >
                    添加
                  </Button>
                ) : null}
              </TabPane>
              <TabPane tab="附件" key="5">
                <Form2
                  ref={node => {
                    formRef.current = node;
                  }}
                  onFieldsChange={(props, changedFields, allFields) => {
                    setBaseFormData({ ...baseFormData, ...changedFields });
                  }}
                  dataSource={baseFormData}
                  style={{ paddingTop: 20, paddingLeft: 30 }}
                  footer={false}
                  columnNumberOneRow={editable ? 3 : 2}
                  layout={editable ? 'vertical' : 'horizontal'}
                  hideRequiredMark={!editable}
                  wrapperCol={{ span: 12 }}
                  labelCol={{ span: 12 }}
                  columns={[
                    {
                      title: '主协议',
                      dataIndex: 'masterAgreementDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '主协议',
                                  }),
                                }}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                fileList={val}
                                disabled={disabled}
                                editing={editable}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '补充协议',
                      dataIndex: 'supplementalAgreementDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '补充协议',
                                  }),
                                }}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                fileList={val}
                                editing={editable}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '风险问卷调查',
                      dataIndex: 'riskSurveyDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '风险问卷调查',
                                  }),
                                }}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                fileList={val}
                                editing={editable}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '交易授权书',
                      dataIndex: 'tradeAuthDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '交易授权书',
                                  }),
                                }}
                                fileList={val}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                editing={editable}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '对手尽职调查',
                      dataIndex: 'dueDiligenceDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '对手尽职调查',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '风险承受能力调查问卷',
                      dataIndex: 'riskPreferenceDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '风险承受能力调查问卷',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '合规性承诺书',
                      dataIndex: 'complianceDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '合规性承诺书',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '风险揭示书',
                      dataIndex: 'riskRevelationDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '风险揭示书',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '适当性警示书',
                      dataIndex: 'qualificationWarningDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '适当性警示书',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '授信协议',
                      dataIndex: 'creditAgreement',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '授信协议',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                    {
                      title: '履约保障协议',
                      dataIndex: 'performanceGuaranteeDoc',
                      render: (val, record, index, { form }) => {
                        val = handleValue(val);
                        return (
                          <FormItem
                            hasFeedback={
                              !!(
                                !disabled &&
                                val &&
                                val.length > 0 &&
                                _.get(val, '[0]status') !== 'error'
                              )
                            }
                          >
                            {form.getFieldDecorator({
                              rules: [
                                {
                                  required: false,
                                },
                              ],
                            })(
                              <Upload
                                action={UPLOAD_URL}
                                data={{
                                  method: PARTY_DOC_CREATE_OR_UPDATE,
                                  params: JSON.stringify({
                                    name: '履约保障协议',
                                  }),
                                }}
                                fileList={val}
                                editing={editable}
                                headers={{ Authorization: `Bearer ${getToken()}` }}
                                disabled={disabled}
                              />,
                            )}
                          </FormItem>
                        );
                      },
                    },
                  ]}
                />
              </TabPane>
            </Tabs>
          </>
        </Spin>
      }
      style={{ ...props.style }}
      onClick={() => {
        setModalVisible(true);
        // 开户审批查看
        // if (props.processInstanceId) {

        //   return;
        // }
        fetchData(props.formData, props.processInstanceId);
      }}
      modalProps={{
        title: name,
        width: 900,
        visible: modalVisible,
        maskClosable: false,
        onCancel: () => setModalVisible(false),
        footer: disabled ? (
          false
        ) : (
          <Row gutter={8} type="flex" justify="end">
            <Button
              onClick={() => {
                setModalVisible(false);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                const baseData = {};
                Object.keys(baseFormData).forEach(item => {
                  baseData[item] = baseFormData[item].value;
                  if (item.endsWith('Date') && baseData[item]) {
                    baseData[item] = getMoment(baseData[item]).format('YYYY-MM-DD');
                  }
                  if (item.endsWith('Doc') || item === 'creditAgreement') {
                    baseData[item] = baseFormData[item].value
                      .map(param => {
                        if (param.status === 'error') {
                          return null;
                        }
                        if (param.id) {
                          return param.id;
                        }
                        if (param.response) {
                          return param.response.result.uuid;
                        }
                        return param;
                      })
                      .join('');
                  }
                });
                const tradeAuthorizer = traderList.map(item => ({
                  tradeAuthorizerName: item.name.value,
                  tradeAuthorizerIdNumber: item.IDNumber.value,
                  tradeAuthorizerIdExpiryDate: getMoment(item.periodValidity.value).format(
                    'YYYY-MM-DD',
                  ),
                  tradeAuthorizerPhone: item.phoneNumber.value,
                }));
                if (Array.isArray(baseData.salesName)) {
                  const [subsidiaryName, branchName, salesName] = baseData.salesName;
                  baseData.subsidiaryName = subsidiaryName;
                  baseData.branchName = branchName;
                  baseData.salesName = salesName;
                }
                baseData.tradeAuthorizer = tradeAuthorizer;
                // 开户审批提交修改
                if (props.handleApprovalData) {
                  props.handleApprovalData(baseData);
                  return setModalVisible(false);
                }
                setLoading(true);
                const { data, error } = await createRefParty(baseData);
                setLoading(false);
                if (error) return;
                setModalVisible(false);
                if (fetchTable) {
                  fetchTable();
                }
                notification.success({
                  message: '保存成功',
                });
              }}
            >
              提交修改
            </Button>
          </Row>
        ),
      }}
    >
      {/* {name} */}
      {content}
    </ModalButton>
  );
});

export default EditModalButton;
