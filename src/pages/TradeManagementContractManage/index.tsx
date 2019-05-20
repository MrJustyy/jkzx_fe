import Page from '@/containers/Page';
import { trdExpiringTradeList } from '@/services/general-service';
import { connect } from 'dva';
import produce from 'immer';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import router from 'umi/router';
import CommonModel from './CommonModel';
import { ROW_KEY } from './constants';

class TradeManagementContractManage extends PureComponent {
  public curRowId: any;

  public state = {
    loading: false,
    modalVisiable: false,
    selectedRows: [],
    bookList: [],
    bookIdList: [],
    searchFormData: {},
    tableDataSource: [],
    pagination: {
      current: 1,
      pageSize: 10,
    },
    lifeLoading: false,
    lifeTableData: [],
    tradeTableData: [],
    tradeLoading: false,
  };

  public componentDidMount = () => {
    const { preRouting, dispatch } = this.props;
    if (preRouting && preRouting.pathname !== '/trade-management/book-edit') {
      dispatch({
        type: 'tradeManagementContractManage/initKey',
        payload: 'contractManagement',
      });
    }
    this.onFetchTradeTableData();
  };

  public onCheckContract = async event => {
    router.push({
      pathname: '/trade-management/book-edit',
      query: {
        // from: 'control',
        id: event.rowId,
      },
    });
  };

  public bindCheckContract = rowData => () => {
    this.onCheckContract({
      rowId: rowData[ROW_KEY],
    });
  };

  public onFetchTradeTableData = async () => {
    this.switchTradeLoading();
    const { error, data } = await trdExpiringTradeList();
    this.switchTradeLoading();

    if (error) return;

    if (_.isEmpty(data)) return;

    // @todo
    const commonCounterPartyName = data[0].positions[0].counterPartyName;

    this.setState(
      produce((state: any) => {
        state.tradeTableData = data.map(item => {
          return {
            ...item,
            commonCounterPartyName,
          };
        });
      })
    );
  };

  public switchTradeLoading = () => {
    this.setState(
      produce((state: any) => {
        state.tradeLoading = !state.tradeLoading;
      })
    );
  };

  public onTabChange = key => {
    this.props.dispatch({
      type: 'tradeManagementContractManage/onTabChange',
      payload: { key },
    });
  };

  public render() {
    const activeTabKey = this.props.tradeManagementContractManage.activeTabKey;
    return (
      <Page
        title="合约管理"
        tabList={[
          { key: 'contractManagement', tab: '合约管理' },
          { key: 'open', tab: '当日开仓' },
          { key: 'unwind', tab: '当日平仓' },
          { key: 'expiration', tab: '当日到期' },
          { key: 'overlate', tab: '已过期' },
        ]}
        tabActiveKey={activeTabKey}
        onTabChange={this.onTabChange}
      >
        {activeTabKey === 'contractManagement' && <CommonModel name="contractManagement" />}
        {activeTabKey === 'open' && <CommonModel status="OPEN_TODAY" name="open" />}
        {activeTabKey === 'unwind' && <CommonModel status="UNWIND_TODAY" name="unwind" />}
        {activeTabKey === 'expiration' && (
          <CommonModel status="EXPIRATION_TODAY" name="expiration" />
        )}
        {activeTabKey === 'overlate' && <CommonModel status="EXPIRATION" name="overlate" />}
      </Page>
    );
  }
}

export default connect(state => {
  return {
    tradeManagementContractManage: state.tradeManagementContractManage,
    preRouting: state.preRouting.location,
  };
})(TradeManagementContractManage);
