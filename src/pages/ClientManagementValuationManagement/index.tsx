import { Divider, message, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { VERTICAL_GUTTER } from '@/constants/global';
import { Form2, Select, SmartTable, Table2 } from '@/containers';
import ModalButton from '@/containers/ModalButton';
import Page from '@/containers/Page';
import {
  refMasterAgreementSearch,
  refSimilarLegalNameList,
  rptValuationReportSearch,
} from '@/services/reference-data-service';
import { emlSendValuationReport } from '@/services/report-service';
import { VALUATION_COL_DEFS } from './tools';
import { PAGE_SIZE } from '@/constants/component';
import { getMoment } from '@/tools';

class ClientManagementValuationManagement extends PureComponent {
  public $form: Form2 = null;

  public state = {
    loading: false,
    dataSource: [],
    visible: false,
    searchFormData: {},
    selectedRows: [],
    selectedRowKeys: [],
  };

  public componentDidMount = () => {
    this.fetchTable();
  };

  public getFormData = () => _.mapValues(this.state.searchFormData, item => _.get(item, 'value'));

  public fetchTable = async () => {
    this.uploading();
    const newFormData = this.getFormData();
    const { error, data } = await rptValuationReportSearch({
      ...newFormData,
    });
    this.unUploading();
    if (error) return;
    const sortClient = [...data].sort((a, b) => a.legalName.localeCompare(b.legalName));
    const sortData = [...sortClient].sort(
      (a, b) => getMoment(b.valuationDate).valueOf() - getMoment(a.valuationDate).valueOf(),
    );
    this.setState({
      dataSource: sortData,
    });
  };

  public onSearchFormChange = params => {
    const { values } = params;
    this.setState({
      searchFormData: values,
    });
  };

  public onResetButtonClick = () => {
    this.setState(
      {
        searchFormData: {},
      },
      () => {
        this.fetchTable();
      },
    );
  };

  public onConfirm = async () => {
    this.setState({
      visible: false,
      loading: true,
    });
    const reportData = this.state.selectedRows.map(item =>
      _.mapKeys(_.pick(item, ['uuid', 'tradeEmail']), (value, key) => {
        if (key === 'tradeEmail') {
          return 'tos';
        }
        if (key === 'uuid') {
          return 'valuationReportId';
        }
        return value;
      }),
    );
    const { error, data } = await emlSendValuationReport({
      params: reportData,
    });
    this.unUploading();
    if (error) {
      message.error('批量发送失败');
      return;
    }
    if (data.ERROR) {
      data.ERROR.forEach(item => {
        if (item.error.includes('501 Bad address')) {
          message.error(`邮箱为${item.email}的用户文档发送失败,请确认邮箱是否正确`);
        } else if (item.error.includes('UUID string')) {
          message.error(`邮箱为${item.email}的用户文档发送失败,文档不可用`);
        } else {
          message.error(`邮箱为${item.email}的用户文档发送失败`);
        }
      });
      return;
    }
    message.success('批量发送成功');
  };

  public onClickBatch = async () => {
    this.setState({
      visible: true,
    });
  };

  public onCancelBatch = () => {
    this.setState({
      visible: false,
    });
  };

  public uploading = () => {
    this.setState({
      loading: true,
    });
  };

  public unUploading = () => {
    this.setState({
      loading: false,
    });
  };

  public onReset = () => {
    this.setState(
      {
        searchFormData: {},
      },
      () => {
        this.fetchTable();
      },
    );
  };

  public onSelectionChanged = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  };

  public onFieldsChange = (props, changedFields, allFields) => {
    this.setState({
      searchFormData: allFields,
    });
  };

  public render() {
    return (
      <Page>
        <Form2
          ref={node => {
            this.$form = node;
          }}
          layout="inline"
          dataSource={this.state.searchFormData}
          submitText="查询"
          submitButtonProps={{
            icon: 'search',
          }}
          onSubmitButtonClick={this.fetchTable}
          onResetButtonClick={this.onReset}
          onFieldsChange={this.onFieldsChange}
          columns={[
            {
              title: '交易对手',
              dataIndex: 'legalName',
              render: (value, record, index, { form, editing }) => (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <Select
                      style={{ minWidth: 180 }}
                      placeholder="请输入内容搜索"
                      allowClear
                      showSearch
                      fetchOptionsOnSearch
                      options={async (values: string = '') => {
                        const { data, error } = await refSimilarLegalNameList({
                          similarLegalName: values,
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
                      options={async (values: string = '') => {
                        const { data, error } = await refMasterAgreementSearch({
                          masterAgreementId: values,
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
          ]}
        />
        <Divider />
        <Row style={{ marginBottom: VERTICAL_GUTTER }}>
          <ModalButton
            key="sends"
            type="primary"
            modalProps={{
              visible: this.state.visible,
              onOk: this.onConfirm,
              onCancel: this.onCancelBatch,
            }}
            visible={this.state.visible}
            onClick={this.onClickBatch}
            content={<div>是否确认向所有已选中的客户邮箱发送估值报告?</div>}
          >
            批量发送报告
          </ModalButton>
        </Row>
        <div style={{ marginTop: VERTICAL_GUTTER }}>
          <SmartTable
            rowKey="uuid"
            loading={this.state.loading}
            dataSource={this.state.dataSource}
            columns={VALUATION_COL_DEFS(this.uploading, this.unUploading)}
            rowSelection={{
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: this.onSelectionChanged,
            }}
            scroll={{ x: 1500 }}
          />
        </div>
      </Page>
    );
  }
}

export default ClientManagementValuationManagement;
