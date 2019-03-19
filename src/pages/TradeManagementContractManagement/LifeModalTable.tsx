import ModalButton from '@/design/components/ModalButton';
import SourceTable from '@/design/components/SourceTable';
import { trdTradeLCMEventList } from '@/services/general-service';
import produce from 'immer';
import React, { PureComponent } from 'react';
import uuidv4 from 'uuid/v4';
import { OVERVIEW_TABLE_COLUMNDEFS, ROW_KEY } from './constants';

class LifeModalTable extends PureComponent<
  {
    rowData: any;
  },
  any
> {
  public state = {
    modalVisiable: false,
    lifeLoading: false,
    lifeTableData: [],
  };

  public fetchOverviewTableData = async () => {
    this.switchLifeLoading();
    const { error, data } = await trdTradeLCMEventList({
      tradeId: this.props.rowData[ROW_KEY],
    });
    this.switchLifeLoading();
    if (error) return;
    this.setState({
      lifeTableData: data.map(item => {
        return {
          ...item,
          uuid: uuidv4(),
        };
      }),
    });
  };

  public switchLifeLoading = () => {
    this.setState(
      produce((state: any) => {
        state.lifeLoading = !state.lifeLoading;
      })
    );
  };

  public handleOk = () => {
    this.setState({
      modalVisiable: false,
    });
  };

  public handleCancel = () => {
    this.setState({
      modalVisiable: false,
    });
  };

  public showModal = async event => {
    this.setState(
      {
        modalVisiable: true,
      },
      () => {
        this.fetchOverviewTableData();
      }
    );
  };

  public render() {
    const modalProps = {
      width: 1200,
      title: '生命周期事件概览',
      footer: false,
      closable: true,
      onOk: this.handleOk,
    };

    return (
      <ModalButton
        size="small"
        key="check"
        type="primary"
        onClick={this.showModal}
        visible={this.state.modalVisiable}
        modalProps={modalProps}
        onCancel={this.handleCancel}
        content={
          <SourceTable
            rowKey={'uuid'}
            loading={this.state.lifeLoading}
            dataSource={this.state.lifeTableData}
            columnDefs={OVERVIEW_TABLE_COLUMNDEFS}
            pagination={false}
          />
        }
      >
        查看生命周期事件
      </ModalButton>
    );
  }
}

export default LifeModalTable;
