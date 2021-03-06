/*eslint-disable */
import { Divider, Dropdown, Icon, Menu } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import React, { PureComponent } from 'react';
import router from 'umi/router';
import uuidv4 from 'uuid';
import _ from 'lodash';
import LifeModalTable from '../../LifeModalTable';
import PortfolioModalTable from '../../PortfolioModalTable';
import { LCM_EVENT_TYPE_ZHCN_MAP, LCM_EVENT_TYPE_MAP } from '@/constants/common';
import { LEG_ENV } from '@/constants/legs';
import LcmEventModal, { ILcmEventModalEl } from '@/containers/LcmEventModal';
import ModalButton from '@/containers/_ModalButton2';
import { trdTradeLCMEventList } from '@/services/general-service';
import { getTradeCreateModalData } from '@/services/pages';
import { trdPositionLCMEventTypes } from '@/services/trade-service';
import { createLegRecordByPosition, getLegByProductType } from '@/tools';

const { SubMenu } = Menu;
const MenuItem = Menu.Item;

class Operations extends PureComponent<{
  record: any;
  onSearch: any;
  rowId: string;
  name: string;
  dispatch: any;
}> {
  public $modelButton: ModalButton = null;

  public state = {
    modalVisible: false,
    lifeTableData: [],
    portfolioModalVisible: false,
    eventTypes: {},
  };

  public componentDidMount = async () => {
    const item = this.props.record;
    const rsp = await trdPositionLCMEventTypes({
      positionId: item.positionId,
    });
    if (rsp.error) return;
    this.setState(state => ({
      eventTypes: {
        ...state.eventTypes,
        [item.positionId]: rsp.data,
      },
    }));
  };

  public handleBookEdit = () => {
    this.props.dispatch({
      type: 'tradeManagementContractManage/setEntryTabKey',
      payload: this.props.name,
    });
    router.push({
      pathname: '/bct/trade-management/book-edit',
      query: {
        id: this.props.record.tradeId,
      },
    });
  };

  public onMenuClick = ({ item, key, keyPath }) => {
    if (key === 'bookEdit') {
      this.handleBookEdit();
    }
    if (key === 'searchLifeStyle') {
      this.setState(
        {
          modalVisible: true,
        },
        () => {
          this.fetchOverviewTableData();
        },
      );
    }
    if (key === 'portfolio') {
      this.setState({
        portfolioModalVisible: true,
      });
    }
    if (keyPath.length === 2) {
      const position = (this.props.record.positions || []).find(
        params => params.positionId === this.props.record.positionId,
      );
      if (!position) {
        throw new Error('position 没有找到！');
      }
      const tableFormData = getTradeCreateModalData(this.props.record);
      const leg = getLegByProductType(
        this.props.record.productType,
        this.props.record.asset.exerciseType,
      );
      const record = createLegRecordByPosition(leg, position, LEG_ENV.BOOKING);

      if (this.$lcmEventModal) {
        this.$lcmEventModal.show({
          eventType: key,
          record,
          createFormData: tableFormData,
          currentUser: this.props.currentUser,
          loadData: () => this.props.onSearch(true),
        });
      }
    }
  };

  public handleCancelVisible = () => {
    this.setState({
      modalVisible: false,
    });
  };

  public fetchOverviewTableData = async () => {
    // this.switchLifeLoading();
    const { error, data } = await trdTradeLCMEventList({
      tradeId: this.props.record.tradeId,
    });
    // this.switchLifeLoading();
    if (error) return;
    const result = [...data];
    result.sort(
      (item1, item2) => moment(item1.createdAt).valueOf() - moment(item2.createdAt).valueOf(),
    );
    this.setState({
      lifeTableData: result.map(item => ({
        ...item,
        uuid: uuidv4(),
      })),
    });
  };

  public handlePortfolioVisible = () => {
    this.setState(
      {
        portfolioModalVisible: false,
      },
      () => {
        this.props.onSearch();
      },
    );
  };

  public loadCommon = () => {
    const lcmEvent = this.props.record;
    return _.get(this.state.eventTypes, lcmEvent.positionId, [])
      .sort((a, b) => LCM_EVENT_TYPE_ZHCN_MAP[b].localeCompare(LCM_EVENT_TYPE_ZHCN_MAP[a]))
      .map(node => <MenuItem key={node}>{LCM_EVENT_TYPE_ZHCN_MAP[node]}</MenuItem>);
  };

  public activeRowData: any;

  public $lcmEventModal: ILcmEventModalEl;

  public render() {
    return (
      <>
        <a href="javascript:;" onClick={this.handleBookEdit} data-test="details">
          详情
        </a>
        <Divider type="vertical" />
        <Dropdown
          overlay={
            <Menu onClick={this.onMenuClick}>
              <MenuItem key="searchLifeStyle">查看生命周期事件</MenuItem>
              <SubMenu key="carryListStyle" title={<span>执行生命周期事件</span>}>
                {this.loadCommon()}
              </SubMenu>
              <MenuItem key="portfolio">加入投资组合</MenuItem>
            </Menu>
          }
        >
          <a href="javascript:;">
            更多操作
            <Icon type="down" />
          </a>
        </Dropdown>
        <LifeModalTable
          modalVisible={this.state.modalVisible}
          lifeTableData={this.state.lifeTableData}
          handleCancelVisible={this.handleCancelVisible}
        />
        <PortfolioModalTable
          rowData={this.props.record}
          portfolioModalVisible={this.state.portfolioModalVisible}
          handlePortfolioVisible={this.handlePortfolioVisible}
        />
        <LcmEventModal
          current={node => {
            this.$lcmEventModal = node;
          }}
        />
      </>
    );
  }
}

export default connect(state => ({
  currentUser: (state.user as any).currentUser,
}))(Operations);
