import { DatePicker, Divider, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import moment from 'moment';
import React, { PureComponent } from 'react';
import { PAGE_SIZE } from '@/constants/component';
import { Form2, Select, SmartTable } from '@/containers';
import SmartForm from '@/containers/SmartForm';
import {
  trdTradeListByBook,
  trdTradeListBySimilarTradeId,
  trdTradeGet,
} from '@/services/general-service';
import { refSimilarLegalNameList } from '@/services/reference-data-service';
import { positionDocSearch, trdBookListBySimilarBookName } from '@/services/trade-service';
import SettlementModal from './SettlementModal';

const { RangePicker } = DatePicker;
class SettlementAdvice extends PureComponent {
  public state = {
    loading: false,
    dataSource: [],
    searchFormData: {},
    pagination: {
      current: 1,
      pageSize: PAGE_SIZE,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange: (page, pagesize) => this.onTablePaginationChange(page, pagesize),
      onShowSizeChange: (page, pagesize) => this.onTablePaginationChange(page, pagesize),
    },
    bookIdList: [],
    positionIdList: [],
  };

  public onTablePaginationChange = (page, pagesize) => {
    const { pagination } = this.state;
    this.setState(
      {
        pagination: {
          ...pagination,
          current: page,
          pageSize: pagesize,
        },
      },
      () => {
        this.onFetch({
          current: page,
          pageSize: pagesize,
        });
      },
    );
  };

  public componentDidMount = () => {
    let { searchFormData } = this.state;
    searchFormData = {
      ...searchFormData,
      ...Form2.createFields({ expirationDate: [moment().subtract(1, 'day'), moment()] }),
    };
    this.setState(
      {
        searchFormData,
      },
      () => {
        this.onFetch();
      },
    );
  };

  public getFormData = data => _.mapValues(data, item => _.get(item, 'value'));

  public onFetch = async paramsPagination => {
    const formValues = {
      startDate: _.get(this.state.searchFormData, 'expirationDate.value[0]').format('YYYY-MM-DD'),
      endDate: _.get(this.state.searchFormData, 'expirationDate.value[1]').format('YYYY-MM-DD'),
      ...this.getFormData(_.omit(this.state.searchFormData, 'expirationDate')),
    };
    const { pagination } = this.state;
    this.setState({
      loading: true,
    });
    const { error, data } = await positionDocSearch({
      page: (paramsPagination || pagination).current - 1,
      pageSize: (paramsPagination || pagination).pageSize,
      ...formValues,
    });
    this.setState({
      loading: false,
    });
    if (error) return;
    const dataSource = data.page.map(item => {
      let status = '';
      if (item.docProcessStatus === 'UN_PROCESSED') {
        status = '未处理';
      } else if (item.docProcessStatus === 'DOWNLOADED') {
        status = `下载 于 ${moment(item.updatedAt).format('YYYY-MM-DD HH:mm')}`;
      } else {
        status = `发送 于 ${moment(item.updatedAt).format('YYYY-MM-DD HH:mm')}`;
      }
      return {
        ...item,
        status,
      };
    });
    this.setState({
      dataSource,
      pagination: {
        ...pagination,
        ...paramsPagination,
        total: data.totalCount,
      },
    });
  };

  public onReset = () => {
    let { searchFormData } = this.state;
    searchFormData = {
      ...Form2.createFields({ expirationDate: [moment().subtract(1, 'day'), moment()] }),
    };
    this.setState(
      {
        searchFormData,
      },
      () => {
        this.onFetch({ current: 1, pageSize: PAGE_SIZE });
      },
    );
  };

  public onSearchFormChange = async (props, changedFields) => {
    const { searchFormData } = this.state;
    if (changedFields.bookName && changedFields.bookName.value) {
      const { error, data } = await trdTradeListByBook({
        bookName: changedFields.bookName.value,
      });
      if (error) return;
      this.setState({
        bookIdList: data,
        searchFormData: {
          ...searchFormData,
          ...changedFields,
        },
      });
      return;
    }
    if (changedFields.tradeId && changedFields.tradeId.value) {
      this.setState(
        {
          searchFormData: {
            ...searchFormData,
            ...Form2.createFields({ positionId: '' }),
          },
        },
        async () => {
          const { error, data } = await trdTradeGet({
            tradeId: changedFields.tradeId.value,
          });
          if (error) return;
          const searchForm = this.state.searchFormData;
          this.setState({
            positionIdList: (_.get(data, 'positions') || []).map(item => item.positionId),
            searchFormData: {
              ...searchForm,
              ...changedFields,
            },
          });
        },
      );

      return;
    }
    this.setState({
      bookIdList: [],
      positionIdList: [],
      searchFormData: {
        ...searchFormData,
        ...changedFields,
      },
    });
  };

  public onSearch = () => {
    this.onFetch({ current: 1, pageSize: PAGE_SIZE });
  };

  public render() {
    const { searchFormData } = this.state;

    return (
      <>
        <SmartForm
          spread={3}
          layout="inline"
          dataSource={searchFormData}
          submitText="搜索"
          submitButtonProps={{
            icon: 'search',
          }}
          onSubmitButtonClick={this.onSearch}
          onResetButtonClick={this.onReset}
          onFieldsChange={this.onSearchFormChange}
          columns={[
            {
              title: '到期日',
              dataIndex: 'expirationDate',
              render: (value, record, index, { form, editing }) => (
                <FormItem>{form.getFieldDecorator({})(<RangePicker />)}</FormItem>
              ),
            },
            {
              title: '结算通知书处理状态',
              dataIndex: 'docProcessStatus',
              render: (value, record, index, { form, editing }) => (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <Select
                      style={{ minWidth: 180 }}
                      placeholder="请输入内容搜索"
                      allowClear
                      showSearch
                      fetchOptionsOnSearch
                      options={[
                        {
                          label: '未处理',
                          value: 'UN_PROCESSED',
                        },
                        {
                          label: '已下载',
                          value: 'DOWNLOADED',
                        },
                        {
                          label: '已发送',
                          value: 'SENT',
                        },
                      ]}
                    />,
                  )}
                </FormItem>
              ),
            },
            {
              title: '交易簿',
              dataIndex: 'bookName',
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
                      }}
                    />,
                  )}
                </FormItem>
              ),
            },
            {
              title: '交易ID',
              dataIndex: 'tradeId',
              render: (val, record, index, { form, editing }) => (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <Select
                      style={{ minWidth: 180 }}
                      placeholder="请输入内容搜索"
                      allowClear
                      showSearch
                      fetchOptionsOnSearch
                      options={
                        this.state.bookIdList.length
                          ? this.state.bookIdList.map(item => ({
                              label: item,
                              value: item,
                            }))
                          : async (value: string = '') => {
                              const { data, error } = await trdTradeListBySimilarTradeId({
                                similarTradeId: value,
                              });
                              if (error) return [];
                              return data.map(item => ({
                                label: item,
                                value: item,
                              }));
                            }
                      }
                    />,
                  )}
                </FormItem>
              ),
            },
            {
              title: '持仓ID',
              dataIndex: 'positionId',
              render: (value, record, index, { form, editing }) => (
                <FormItem>
                  {form.getFieldDecorator({})(
                    <Select
                      style={{ minWidth: 180 }}
                      placeholder="请输入内容搜索"
                      allowClear
                      showSearch
                      fetchOptionsOnSearch
                      options={(this.state.positionIdList || []).map(item => ({
                        label: item,
                        value: item,
                      }))}
                    />,
                  )}
                </FormItem>
              ),
            },
            {
              title: '交易对手',
              dataIndex: 'partyName',
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
          ]}
        />
        <Divider type="horizontal" />
        <SmartTable
          dataSource={this.state.dataSource}
          columns={[
            {
              dataIndex: 'positionId',
              title: '持仓ID',
            },
            {
              dataIndex: 'tradeId',
              title: '所属交易ID',
            },
            {
              dataIndex: 'bookName',
              title: '所属交易簿',
            },
            {
              dataIndex: 'partyName',
              title: '交易对手',
            },
            {
              dataIndex: 'salesName',
              title: '销售',
            },
            {
              dataIndex: 'expirationDate',
              title: '到期日',
            },
            {
              dataIndex: 'status',
              title: '结算通知书处理状态',
            },
            {
              title: '操作',
              render: (text, record, index) => (
                <Row type="flex" align="middle">
                  <SettlementModal data={text} onFetch={this.onFetch} />
                </Row>
              ),
            },
          ]}
          pagination={this.state.pagination}
          loading={this.state.loading}
        />
      </>
    );
  }
}

export default SettlementAdvice;
