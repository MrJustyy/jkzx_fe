import { BOOK_NAME_FIELD, LCM_EVENT_TYPE_OPTIONS, PRODUCTTYPE_OPTIONS } from '@/constants/common';
import { VERTICAL_GUTTER } from '@/constants/global';
import { Form2, Loading, Select, Table2 } from '@/components';
import { trdTradeListBySimilarTradeId, trdTradeSearchIndexPaged } from '@/services/general-service';
import { mktInstrumentSearch } from '@/services/market-data-service';
import {
  refSimilarLegalNameList,
  refSimilarSalesNameList,
} from '@/services/reference-data-service';
import {
  trdBookListBySimilarBookName,
  trdPortfolioListBySimilarPortfolioName,
} from '@/services/trade-service';
import { DatePicker, Divider, Table, Pagination, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import { isMoment } from 'moment';
import React, { PureComponent } from 'react';
import { BOOKING_TABLE_COLUMN_DEFS } from '../constants';
import styles from '../index.less';
import { connect } from 'dva';
import { withRouter } from 'react-router';

class CommonModel extends PureComponent<{ status: any }> {
  public $table2: Table2 = null;

  public status: any;

  public state = {
    loading: false,
    searchFormData: {},
    bookIdList: [],
    pageSizeCurrent: 0,
    bookList: [],
  };

  public componentDidMount = () => {
    this.status = this.props.status;
    const { location } = this.props;
    if (location && location.pathname === '/trade-management/book-edit') {
      this.onTradeTableSearch();
    } else {
      this.onTradeTableSearch({ current: 1, pageSize: 10 });
    }
  };

  public onSearch = ({ domEvent }) => {
    domEvent.preventDefault();
    this.onTradeTableSearch({ current: 1, pageSize: 10 });
  };

  public search = () => {
    this.onTradeTableSearch();
  };

  public getFormData = () => {
    return _.mapValues(this.state.searchFormData, item => {
      return _.get(item, 'value');
    });
  };

  public onTradeTableSearch = async (paramsPagination?) => {
    this.setState({
      loading: true,
    });
    const { searchFormData } = this.state;
    const { activeTabKey } = this.props;
    const { pagination } = this.props[activeTabKey];
    const newFormData = this.getFormData();
    const formatValues = _.mapValues(newFormData, (val, key) => {
      if (isMoment(val)) {
        return val.format('YYYY-MM-DD');
      }
      return val;
    });

    this.setState({ loading: true });

    const { error, data } = await trdTradeSearchIndexPaged({
      page: (paramsPagination || pagination).current - 1,
      pageSize: (paramsPagination || pagination).pageSize,
      ...formatValues,
      ...(this.status ? { status: this.status } : null),
    });
    this.setState({ loading: false });

    if (error) return;
    if (_.isEmpty(data)) return;

    const dataSource = data.page.map(item => {
      return [
        ...item.positions.map((node, key) => {
          return {
            ...item,
            ..._.omit(node, ['bookName']),
            ...node.asset,
            ...(item.positions.length > 1 ? { style: { background: '#f2f4f5' } } : null),
            ...(item.positions.length <= 1
              ? null
              : key === 0
              ? { timeLineNumber: item.positions.length }
              : null),
          };
        }),
      ];
    });
    const tableDataSource = _.reduce(
      dataSource,
      (result, next) => {
        return result.concat(next);
      },
      []
    );
    const { dispatch, name } = this.props;
    dispatch({
      type: 'trade/save',
      payload: {
        activeTabKey: name,
        tableDataSource,
        pagination: {
          ...pagination,
          ...paramsPagination,
          total: data.totalCount,
        },
      },
    });

    this.setState({
      pagination: {
        ...pagination,
        ...paramsPagination,
        total: data.totalCount,
      },
      pageSizeCurrent: (paramsPagination || pagination).pageSize,
    });
  };

  public onFieldsChange = (props, changedFields, allFields) => {
    this.setState({
      searchFormData: allFields,
    });
  };

  public onShowSizeChange = (current, pageSize) => {
    this.onPagination(current, pageSize);
  };

  public onChange = (current, pageSize) => {
    this.onPagination(current, pageSize);
  };

  public onPagination = (current, pageSize) => {
    this.onTradeTableSearch({
      current,
      pageSize,
    });
  };

  public onReset = event => {
    this.setState(
      {
        searchFormData: {},
        bookIdList: [],
      },
      () => {
        this.onTradeTableSearch({ current: 1, pageSize: 10 });
      }
    );
  };

  public render() {
    const { activeTabKey } = this.props;
    const { tableDataSource, pagination } = this.props[activeTabKey];
    return (
      <>
        <Form2
          ref={node => (this.$table2 = node)}
          layout="inline"
          dataSource={this.state.searchFormData}
          submitText="查询"
          submitButtonProps={{
            icon: 'search',
          }}
          onSubmitButtonClick={this.onSearch}
          onResetButtonClick={this.onReset}
          onFieldsChange={this.onFieldsChange}
          columns={[
            {
              title: '交易簿',
              dataIndex: BOOK_NAME_FIELD,
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
                        options={async (value: string = '') => {
                          const { data, error } = await trdBookListBySimilarBookName({
                            similarBookName: value,
                          });
                          if (error) return [];
                          return data
                            .sort((a, b) => {
                              return a.localeCompare(b);
                            })
                            .map(item => ({
                              label: item,
                              value: item,
                            }));
                        }}
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '交易ID',
              dataIndex: 'tradeId',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
                        options={
                          this.state.bookIdList.length
                            ? this.state.bookIdList.map(item => {
                                return {
                                  label: item,
                                  value: item,
                                };
                              })
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
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '交易对手',
              dataIndex: 'counterPartyName',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
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
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '销售',
              dataIndex: 'salesName',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
                        options={async (value: string = '') => {
                          const { data, error } = await refSimilarSalesNameList({
                            similarSalesName: value,
                          });
                          if (error) return [];
                          return data.map(item => ({
                            label: item,
                            value: item,
                          }));
                        }}
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '投资组合',
              dataIndex: 'portfolioNames',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        mode="multiple"
                        fetchOptionsOnSearch={true}
                        options={async (value: string = '') => {
                          const { data, error } = await trdPortfolioListBySimilarPortfolioName({
                            similarPortfolioName: value,
                          });
                          if (error) return [];
                          return data.map(item => ({
                            label: item,
                            value: item,
                          }));
                        }}
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '标的物',
              dataIndex: 'instrumentId',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
                        options={async (value: string = '') => {
                          const { data, error } = await mktInstrumentSearch({
                            instrumentIdPart: value,
                          });
                          if (error) return [];
                          return data.map(item => ({
                            label: item,
                            value: item,
                          }));
                        }}
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '期权类型',
              dataIndex: 'productType',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
                        options={PRODUCTTYPE_OPTIONS}
                      />
                    )}
                  </FormItem>
                );
              },
            },
            {
              title: '交易日',
              dataIndex: 'tradeDate',
              render: (value, record, index, { form, editing }) => {
                return <FormItem>{form.getFieldDecorator({})(<DatePicker />)}</FormItem>;
              },
            },
            {
              title: '到期日',
              dataIndex: 'expirationDate',
              render: (value, record, index, { form, editing }) => {
                return <FormItem>{form.getFieldDecorator({})(<DatePicker />)}</FormItem>;
              },
            },
            {
              title: '持仓状态',
              dataIndex: 'lcmEventType',
              render: (value, record, index, { form, editing }) => {
                return (
                  <FormItem>
                    {form.getFieldDecorator({})(
                      <Select
                        style={{ minWidth: 180 }}
                        placeholder="请输入内容搜索"
                        allowClear={true}
                        showSearch={true}
                        fetchOptionsOnSearch={true}
                        options={LCM_EVENT_TYPE_OPTIONS}
                      />
                    )}
                  </FormItem>
                );
              },
            },
          ]}
        />
        <Divider />
        <div style={{ marginTop: VERTICAL_GUTTER }}>
          <Loading loading={this.state.loading}>
            <Table
              size="middle"
              pagination={false}
              rowKey={'positionId'}
              scroll={{ x: 2500 }}
              dataSource={tableDataSource}
              columns={BOOKING_TABLE_COLUMN_DEFS(this.search)}
              onRow={record => {
                return record.style ? { style: record.style } : null;
              }}
            />
            <Row type="flex" justify="end" style={{ marginTop: 15 }}>
              <Pagination
                {...{
                  size: 'small',
                  showSizeChanger: true,
                  onShowSizeChange: this.onShowSizeChange,
                  showQuickJumper: true,
                  current: pagination.current,
                  pageSize: this.state.pageSizeCurrent,
                  onChange: this.onChange,
                  total: pagination.total,
                }}
              />
            </Row>
          </Loading>
        </div>
      </>
    );
  }
}

export default connect(({ trade, preRouting, tradeManagementContractManage }) => ({
  // tableDataSource: trade.tableDataSource,
  // pagination: trade.pagination,
  // bookEdit: trade.bookEdit,
  contractManagement: trade.contractManagement,
  open: trade.open,
  unwind: trade.unwind,
  expiration: trade.expiration,
  overlate: trade.overlate,
  // activeTabKey: trade.activeTabKey,
  location: preRouting.location,
  activeTabKey: tradeManagementContractManage.activeTabKey,
}))(CommonModel);
