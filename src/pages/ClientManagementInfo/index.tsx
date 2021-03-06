import { Card, Divider, notification, Popconfirm, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React, { memo, useEffect, useRef, useState } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';
import { ALL_OPTIONS_VALUE, VERTICAL_GUTTER } from '@/constants/global';
import { Cascader, Form2, Input, Select, Table2, SmartTable } from '@/containers';
import Page from '@/containers/Page';
import {
  clientAccountDel,
  refDisablePartyByLegalName,
  refEnablePartyByLegalName,
  refPartyList,
  refSimilarLegalNameList,
  refMasterAgreementSearch,
} from '@/services/reference-data-service';
import { queryCompleteCompanys } from '@/services/sales';
import { arr2treeOptions, getMoment } from '@/tools';
import styles from './ClientManagementInfo.less';
import CreateModalButton from './CreateModalButton';
import EditModalButton from './EditModelButton';

const SALER_CASCADER = 'SALER_CASCADER';

const STATUS_FIELD = 'status';

const ClientManagementInfo = memo(() => {
  const formEl = useRef<Form2>(null);

  const initialFormData = {};
  const [searchFormData, setSearchFormData] = useState(initialFormData);
  const [searchForm, setSearchForm] = useState(initialFormData);

  const useTableData = initFormData => {
    // stateful logic
    const [searchLoading, setSearchLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const fetchTableData = async (formData, useSeacrchFormData = false) => {
      setSearchLoading(true);
      const { data, error } = await refPartyList(formData || searchForm);
      setSearchLoading(false);
      if (error) return;
      if (useSeacrchFormData) {
        setSearchForm(searchFormData);
      }
      setTableData(data);
    };

    useLifecycles(() => {
      fetchTableData(initFormData);
    });

    return {
      searchLoading,
      tableData,
      fetchTableData,
      setTableData,
    };
  };

  const { searchLoading, tableData, fetchTableData } = useTableData({});
  const [salesCascaderList, setSalesCascaderList] = useState([]);

  const getFormData = form => {
    const formData = form || searchForm;
    const salerValue = _.get(formData[SALER_CASCADER], 'value', []);
    const [subsidiaryName, branchName, salesName] = salerValue;
    return {
      ..._.mapValues(_.omit(formData, [SALER_CASCADER]), item => _.get(item, 'value')),
      subsidiaryName,
      branchName,
      salesName,
    };
  };

  const fetchBranchSalesList = async () => {
    const { error, data } = await queryCompleteCompanys();
    if (error) return;
    const newData = arr2treeOptions(
      data,
      ['subsidiaryId', 'branchId', 'salesId'],
      ['subsidiaryName', 'branchName', 'salesName'],
    );

    const branchSalesList = newData.map(subsidiary => ({
      value: subsidiary.label,
      label: subsidiary.label,
      children: subsidiary.children.map(branch => ({
        value: branch.label,
        label: branch.label,
        children: branch.children.map(salesName => ({
          value: salesName.label,
          label: salesName.label,
        })),
      })),
    }));
    setSalesCascaderList(branchSalesList);
  };

  useLifecycles(() => {
    fetchBranchSalesList();
  });

  const [resetFetchNumber, setResetFetchNumber] = useState(0);

  const AccountDel = async param => {
    const { data, error } = await clientAccountDel({ accountId: param.accountId });
    if (error) return;
    const formData = getFormData();
    fetchTableData(formData);
    notification.success({
      message: '删除成功',
    });
  };

  const fetchTable = () => {
    const formData = getFormData();
    fetchTableData(formData);
  };

  useEffect(() => {
    if (resetFetchNumber <= 0) return;
    const formData = getFormData();
    fetchTableData(formData);
  }, [resetFetchNumber]);

  return (
    <Page title="客户信息管理">
      <Form2
        style={{ marginBottom: VERTICAL_GUTTER }}
        ref={node => {
          formEl.current = node;
        }}
        onResetButtonClick={() => {
          setSearchFormData(initialFormData);
          const formData = getFormData(initialFormData);
          fetchTableData(formData, true);
          // setResetFetchNumber(resetFetchNumber + 1);
        }}
        onSubmitButtonClick={async ({ domEvent }) => {
          domEvent.preventDefault();
          const formData = getFormData(searchFormData);
          fetchTableData(formData, true);
        }}
        layout="inline"
        submitText="查询"
        submitButtonProps={{
          icon: 'search',
        }}
        onFieldsChange={(props, changedFields, allFields) => {
          setSearchFormData(allFields);
        }}
        dataSource={searchFormData}
        columns={[
          {
            title: '交易对手',
            dataIndex: 'legalName',
            render: (val, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="请输入内容搜索"
                    allowClear
                    fetchOptionsOnSearch
                    showSearch
                    options={async value => {
                      const { data, error } = await refSimilarLegalNameList({
                        similarLegalName: value,
                      });
                      if (error) return [];
                      return data.map(item => ({
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
            title: '主协议编号',
            dataIndex: 'masterAgreementId',
            render: (value, record, index, { form, editing }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Select
                    style={{ minWidth: 180 }}
                    placeholder="请输入内容搜索"
                    allowClear
                    showSearch
                    fetchOptionsOnSearch
                    options={async (_value: string = '') => {
                      const { data, error } = await refMasterAgreementSearch({
                        masterAgreementId: _value,
                      });
                      if (error) return [];
                      return data.map(item => ({
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
            title: '销售',
            dataIndex: SALER_CASCADER,
            render: (value, record, index, { form }) => (
              <FormItem>
                {form.getFieldDecorator({})(
                  <Cascader
                    placeholder="请输入内容"
                    style={{ width: 250 }}
                    options={salesCascaderList}
                    showSearch={{
                      filter: (inputValue, path) =>
                        path.some(
                          option =>
                            option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
                        ),
                    }}
                  />,
                )}
              </FormItem>
            ),
          },
        ]}
      />
      <Divider />
      <CreateModalButton salesCascaderList={salesCascaderList} fetchTableData={fetchTableData} />
      <SmartTable
        style={{ marginTop: VERTICAL_GUTTER }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        rowKey="accountId"
        dataSource={tableData}
        loading={searchLoading}
        scroll={{ x: 1500 }}
        columns={[
          {
            title: '交易对手',
            dataIndex: 'legalName',
            width: 250,
            fixed: 'left',
            render: val => (
              <span
                style={{
                  overflow: 'hidden',
                  display: 'inline-block',
                  wordBreak: 'break-all',
                  width: '100%',
                }}
              >
                {val}
              </span>
            ),
          },
          {
            title: '开户销售',
            width: 250,
            dataIndex: 'salesName',
          },
          {
            title: '协议编号',
            width: 200,
            dataIndex: 'masterAgreementId',
          },
          {
            title: '类型',
            width: 200,
            dataIndex: 'clientType',
            render: (value, record, index) => {
              if (value === 'PRODUCT') {
                return '产品户';
              }
              return '机构户';
            },
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 200,
            render: (value, record, index) =>
              value ? getMoment(value).format('YYYY-MM-DD HH:mm:ss') : '',
          },
          {
            title: '更新时间',
            width: 200,
            dataIndex: 'updatedAt',
            render: (value, record, index) =>
              value ? getMoment(value).format('YYYY-MM-DD HH:mm:ss') : '',
          },
          {
            title: '操作',
            dataIndex: 'actions',
            render: (value, record, index) => (
              <span className={styles.action}>
                <EditModalButton
                  salesCascaderList={salesCascaderList}
                  name="查看"
                  modelEditable={false}
                  fetchTable={fetchTable}
                  content={<a>查看</a>}
                  record={record}
                />
                <Divider type="vertical" />
                <EditModalButton
                  salesCascaderList={salesCascaderList}
                  name="编辑"
                  content={<a>编辑</a>}
                  record={record}
                  modelEditable
                  fetchTable={fetchTable}
                />
                <Divider type="vertical" />
                <Popconfirm
                  title={`是否${record.partyStatus === 'NORMAL' ? '禁用' : '启用'}交易对手`}
                  onConfirm={async () => {
                    const isDisableLegalName =
                      record.partyStatus === 'NORMAL'
                        ? refDisablePartyByLegalName
                        : refEnablePartyByLegalName;
                    const { error, data } = await isDisableLegalName({
                      legalName: record.legalName,
                    });
                    if (error) return;
                    fetchTableData(getFormData());
                  }}
                >
                  {record.partyStatus === 'NORMAL' ? (
                    <a href="javascipt:;" style={{ color: 'red' }}>
                      禁用
                    </a>
                  ) : (
                    <a href="javascipt:;">启用</a>
                  )}
                </Popconfirm>
                {/* <Button
                      style={{ color: 'red' }}
                      onClick={() => {
                        AccountDel(record);
                      }}
                    >
                      删除
                    </Button> */}
              </span>
            ),
          },
        ]}
      />
    </Page>
  );
});

export default ClientManagementInfo;
