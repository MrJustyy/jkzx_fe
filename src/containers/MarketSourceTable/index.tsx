import SourceList from '@/containers/_SourceList';
import {
  prefPreferenceCreate,
  prefPreferenceDividendInstrumentAdd,
  prefPreferenceDividendInstrumentDelete,
  prefPreferenceExist,
  prefPreferenceGetByUser,
  prefPreferenceVolInstrumentAdd,
  prefPreferenceVolInstrumentDelete,
} from '@/services/userPreference';
import { message } from 'antd';
import { connect } from 'dva';
import produce from 'immer';
// import produce from 'immer';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { CREATE_FORM_CONTROLS, NAME_FIELD_KEY } from './constants';

export interface MarketSourceTableProps {
  onSelect?: (selectedKey: string) => void;
  currentUser?: any;
  marketType: 'volInstrumnent' | 'dividendInstruments';
}

class MarketSourceTable extends PureComponent<MarketSourceTableProps> {
  public $list: SourceList = null;

  public state = {
    loading: false,
    formData: {},
    createLoading: false,
    marketList: [],
    marketLoading: false,
    marketSelectedKeys: [],
    visible: false,
    removeLoadings: {},
  };

  public cache = false;

  public dataSource = [];

  public componentDidMount = () => {
    this.startFetch();
  };

  public componentDidUpdate = async () => {
    this.startFetch();
  };

  public componentWillUnmount = () => {
    this.cache = false;
  };

  public startFetch = async () => {
    const userName = this.props.currentUser.username;
    if (!(this.cache === false && userName)) {
      return;
    }

    this.cache = true;

    this.setState({ loading: true });

    const { data, error } = await prefPreferenceExist({
      userName,
    });
    if (!data) return this.createMarket(userName);

    this.fetchMarket(userName);
  };

  public createMarket = async userName => {
    const { error } = await prefPreferenceCreate({
      userName,
      volInstruments: [],
      dividendInstruments: [],
    });

    this.setState({ loading: false });

    if (error) {
      message.error('创建标的物失败');
    }
  };

  public fetchMarket = async userName => {
    const { data, error } = await prefPreferenceGetByUser({
      userName,
    });

    this.setState({ loading: false });

    if (error) return;

    this.setState(
      {
        marketList: (this.props.marketType === 'volInstrumnent'
          ? data.volSurfaceInstrumentIds
          : data.dividendCurveInstrumentIds
        ).map(item => ({ title: item })),
      },
      () => {
        this.dataSource = this.state.marketList;
      }
    );
  };

  public addMarket = async formData => {
    const userName = this.props.currentUser.username;
    if (!userName) return;
    if (_.some(this.state.marketList, formData)) {
      message.error('不能重复添加标的物');
      return;
    }
    const { error, data } = await (this.props.marketType === 'volInstrumnent'
      ? prefPreferenceVolInstrumentAdd
      : prefPreferenceDividendInstrumentAdd)({
      userName,
      [this.props.marketType === 'volInstrumnent'
        ? 'volInstrument'
        : 'dividendInstrument']: formData[NAME_FIELD_KEY],
    });
    if (error) return false;

    this.setState(
      {
        marketList: this.state.marketList.concat(formData),
      },
      () => {
        this.dataSource = this.state.marketList;
      }
    );

    return true;
  };

  public removeMarket = async (record, index) => {
    const userName = this.props.currentUser.username;
    if (!userName) return;

    const { error } = await (this.props.marketType === 'volInstrumnent'
      ? prefPreferenceVolInstrumentDelete
      : prefPreferenceDividendInstrumentDelete)({
      userName,
      [this.props.marketType === 'volInstrumnent' ? 'volInstrument' : 'dividendInstrument']: record[
        NAME_FIELD_KEY
      ],
    });

    if (error) return;

    this.setState(
      produce((state: any) => {
        state.marketList.splice(index, 1);
      }),
      () => {
        this.dataSource = this.state.marketList;
      }
    );
  };

  public switchVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  public onSelectRow = selectedRowKeys => {
    const [key] = selectedRowKeys;
    if (this.props.onSelect) {
      this.props.onSelect(key);
    }
  };

  public onSearch = record => {
    const dataSource = this.dataSource.filter(item => {
      return item.title.includes(record);
    });
    this.setState({
      marketList: dataSource,
    });
  };

  public onChange = e => {
    if (!e) {
      return;
    }
    const { value } = e.target;
    if (!value) {
      this.onSearch(value);
    }
  };

  public render() {
    return (
      <SourceList
        ref={node => (this.$list = node)}
        title="标的物选择"
        rowKey={NAME_FIELD_KEY}
        loading={this.state.loading}
        dataSource={this.state.marketList}
        createFormControls={CREATE_FORM_CONTROLS}
        onSelectRow={this.onSelectRow}
        onCreate={this.addMarket}
        onRemove={this.removeMarket}
        onSearch={this.onSearch}
        onChange={this.onChange}
        searchable={false}
        createText="添加"
      />
    );
  }
}

export default connect(state => {
  return {
    currentUser: state.user.currentUser,
  };
})(MarketSourceTable);
