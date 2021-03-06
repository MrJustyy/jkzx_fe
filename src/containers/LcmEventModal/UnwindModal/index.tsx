/*eslint-disable */
import { Alert, message, Modal } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import {
  BIG_NUMBER_CONFIG,
  INPUT_NUMBER_CURRENCY_CNY_CONFIG,
  LCM_EVENT_TYPE_MAP,
  LEG_FIELD,
  NOTIONAL_AMOUNT_TYPE_MAP,
  LEG_TYPE_FIELD,
  LEG_TYPE_MAP,
} from '@/constants/common';
import CashExportModal from '@/containers/CashExportModal';
import Form from '@/containers/Form';
import { trdTradeLCMEventProcess } from '@/services/trade-service';
import {
  CAN_UNWIND_NUM,
  CAN_UNWIND_PRICE,
  LEFT_NUM,
  LEFT_PRICE,
  UNWIND_NUM,
  UNWIND_PER,
  UNWIND_PRICE,
  UNWIND_TOTAL,
} from './constants';

class UnwindModal extends PureComponent<
  {
    visible?: boolean;
    data?: any;
  },
  any
> {
  public state = {
    cnyFormData: {},
    visible: false,
    lotFormData: {},
    modalConfirmLoading: false,
    notionalAmountType: null,
    exportVisible: false,
    productType: '',
  };

  public show = (data = {}, tableFormData, currentUser, reload) => {
    this.data = data;
    this.tableFormData = tableFormData;
    this.currentUser = currentUser;
    this.reload = reload;

    const notionalAmountType = data[LEG_FIELD.NOTIONAL_AMOUNT_TYPE];
    const productType = data[LEG_TYPE_FIELD];

    this.setState({
      visible: true,
      notionalAmountType,
      productType,
      ...(notionalAmountType === NOTIONAL_AMOUNT_TYPE_MAP.CNY
        ? {
            cnyFormData: _.omitBy(
              this.computeCnyFormData({
                [CAN_UNWIND_PRICE]: data[LEG_FIELD.NOTIONAL_AMOUNT],
              }),
              _.isNull,
            ),
          }
        : {
            lotFormData: _.omitBy(
              this.computeLotFormData({
                [CAN_UNWIND_NUM]: data[LEG_FIELD.NOTIONAL_AMOUNT],
              }),
              _.isNull,
            ),
          }),
    });
  };

  public computeCnyFormData = (values, changed = {}) => ({
    ...values,
    [CAN_UNWIND_NUM]: new BigNumber(values[CAN_UNWIND_PRICE])
      .div(this.data[LEG_FIELD.INITIAL_SPOT])
      .div(this.data[LEG_FIELD.UNDERLYER_MULTIPLIER])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [UNWIND_NUM]: new BigNumber(values[UNWIND_PRICE])
      .div(this.data[LEG_FIELD.INITIAL_SPOT])
      .div(this.data[LEG_FIELD.UNDERLYER_MULTIPLIER])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [LEFT_PRICE]: new BigNumber(values[CAN_UNWIND_PRICE])
      .minus(values[UNWIND_PRICE])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [LEFT_NUM]: new BigNumber(values[CAN_UNWIND_PRICE])
      .minus(values[UNWIND_PRICE])
      .div(this.data[LEG_FIELD.INITIAL_SPOT])
      .div(this.data[LEG_FIELD.UNDERLYER_MULTIPLIER])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [UNWIND_PER]: new BigNumber(values[UNWIND_TOTAL])
      .div(values[UNWIND_NUM])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    ...changed,
  });

  public onCnyFormDataChange = params => {
    this.setState({
      cnyFormData: this.computeCnyFormData(params.values, {}),
    });
  };

  public computeLotFormData = (values, changed = {}) => ({
    ...values,
    [CAN_UNWIND_PRICE]: new BigNumber(values[CAN_UNWIND_NUM])
      .multipliedBy(this.data[LEG_FIELD.INITIAL_SPOT])
      .multipliedBy(this.data[LEG_FIELD.UNDERLYER_MULTIPLIER])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [UNWIND_PRICE]: new BigNumber(values[UNWIND_NUM])
      .multipliedBy(this.data[LEG_FIELD.INITIAL_SPOT])
      .multipliedBy(this.data[LEG_FIELD.UNDERLYER_MULTIPLIER])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [LEFT_PRICE]: new BigNumber(values[CAN_UNWIND_NUM])
      .minus(values[UNWIND_NUM])
      .multipliedBy(this.data[LEG_FIELD.INITIAL_SPOT])
      .multipliedBy(this.data[LEG_FIELD.UNDERLYER_MULTIPLIER])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    [LEFT_NUM]: new BigNumber(values[CAN_UNWIND_NUM])
      .minus(values[UNWIND_NUM])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    // [UNWIND_TOTAL]: new BigNumber(values[UNWIND_PER])
    //   .multipliedBy(values[UNWIND_NUM])
    //   .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
    //   .toNumber(),
    [UNWIND_PER]: new BigNumber(values[UNWIND_TOTAL])
      .div(values[UNWIND_NUM])
      .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
      .toNumber(),
    ...changed,
  });

  public onLotFormDataChange = params => {
    this.setState({
      lotFormData: this.computeLotFormData(params.values, {}),
    });
  };

  public switchModal = () => {
    this.setState(state => ({
      visible: !state.visible,
    }));
  };

  public switchConfirmLoading = () => {
    this.setState(state => ({ modalConfirmLoading: !state.modalConfirmLoading }));
  };

  public onConfirm = async () => {
    const usedFormData =
      this.data[LEG_FIELD.NOTIONAL_AMOUNT_TYPE] === NOTIONAL_AMOUNT_TYPE_MAP.CNY
        ? this.state.cnyFormData
        : this.state.lotFormData;
    const usedForm =
      this.data[LEG_FIELD.NOTIONAL_AMOUNT_TYPE] === NOTIONAL_AMOUNT_TYPE_MAP.CNY
        ? this.$cnyForm
        : this.$lotForm;

    usedForm.props.form.validateFieldsAndScroll(async (error, values) => {
      if (error) return;

      this.switchConfirmLoading();
      const { error: _error, data } = await trdTradeLCMEventProcess({
        positionId: this.data.id,
        tradeId: this.tableFormData.tradeId,
        eventType: LCM_EVENT_TYPE_MAP.UNWIND,
        userLoginId: this.currentUser.username,
        eventDetail: {
          unWindAmount: String(usedFormData[UNWIND_PRICE]),
          unWindLot: String(usedFormData[UNWIND_NUM]),
          unWindAmountValue: String(usedFormData[UNWIND_TOTAL]),
          unWindLotValue: String(usedFormData[UNWIND_PER]),
        },
      });
      this.switchConfirmLoading();

      if (_error) return;

      this.setState(
        {
          visible: false,
          exportVisible: true,
        },
        () => {
          message.success('平仓成功');
          // setTimeout(() => {
          //   this.reload();
          // }, 0);
        },
      );
    });
  };

  public convertVisible = () => {
    this.setState({
      exportVisible: false,
    });
  };

  public data: any;

  public tableFormData: any;

  public currentUser: any;

  public reload: any;

  public $cnyForm: Form;

  public $lotForm: Form;

  public render() {
    const { cnyFormData, visible } = this.state;

    return (
      <>
        <CashExportModal
          visible={this.state.exportVisible}
          trade={this.tableFormData}
          convertVisible={this.convertVisible}
          loadData={this.reload}
        />
        <Modal
          closable={false}
          onCancel={this.switchModal}
          onOk={this.onConfirm}
          destroyOnClose
          width={this.state.productType.includes('SPREAD_EUROPEAN') ? 500 : 900}
          visible={visible}
          confirmLoading={this.state.modalConfirmLoading}
          title="平仓"
        >
          {this.state.notionalAmountType === NOTIONAL_AMOUNT_TYPE_MAP.CNY ? (
            this.state.productType.includes('SPREAD_EUROPEAN') ? (
              <Form
                wrappedComponentRef={node => (this.$cnyForm = node)}
                dataSource={cnyFormData}
                onValueChange={this.onCnyFormDataChange}
                controlNumberOneRow={1}
                footer={false}
                controls={[
                  {
                    field: CAN_UNWIND_PRICE,
                    control: {
                      label: '可平仓名义本金',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: UNWIND_PRICE,
                    control: {
                      label: '平仓名义本金',
                    },
                    input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    decorator: {
                      rules: [
                        {
                          message: '数值必须大于0',
                          validator: (rule, value, callback) => {
                            if (value < 0) {
                              return callback(true);
                            }
                            callback();
                          },
                        },
                        {
                          message: '平仓金额为必填项',
                          required: true,
                        },
                        {
                          message: '必须小于等于可平仓名义本金',
                          validator: (rule, value, callback) => {
                            if (value > this.state.cnyFormData[CAN_UNWIND_PRICE]) {
                              return callback(true);
                            }
                            callback();
                          },
                        },
                      ],
                    },
                  },
                  {
                    field: LEFT_PRICE,
                    control: {
                      label: '剩余名义本金',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: UNWIND_TOTAL,
                    control: {
                      label: '平仓金额',
                    },
                    input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    decorator: {
                      rules: [
                        {
                          message: '平仓金额为必填项',
                          required: true,
                        },
                      ],
                    },
                  },
                ]}
              />
            ) : (
              <Form
                wrappedComponentRef={node => (this.$cnyForm = node)}
                dataSource={cnyFormData}
                onValueChange={this.onCnyFormDataChange}
                controlNumberOneRow={2}
                footer={false}
                controls={[
                  {
                    field: CAN_UNWIND_PRICE,
                    control: {
                      label: '可平仓名义本金',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: CAN_UNWIND_NUM,
                    control: {
                      label: '可平仓手数',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: UNWIND_PRICE,
                    control: {
                      label: '平仓名义本金',
                    },
                    input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    decorator: {
                      rules: [
                        {
                          message: '数值必须大于0',
                          validator: (rule, value, callback) => {
                            if (value < 0) {
                              return callback(true);
                            }
                            callback();
                          },
                        },
                        {
                          message: '平仓名义本金为必填项',
                          required: true,
                        },
                        {
                          message: '必须小于等于可平仓名义本金',
                          validator: (rule, value, callback) => {
                            if (value > this.state.cnyFormData[CAN_UNWIND_PRICE]) {
                              return callback(true);
                            }
                            callback();
                          },
                        },
                      ],
                    },
                  },
                  {
                    field: UNWIND_NUM,
                    control: {
                      label: '平仓手数',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: LEFT_PRICE,
                    control: {
                      label: '剩余名义本金',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: LEFT_NUM,
                    control: {
                      label: '剩余手数',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                  {
                    field: UNWIND_TOTAL,
                    control: {
                      label: '平仓金额',
                    },
                    input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    decorator: {
                      rules: [
                        {
                          message: '平仓金额为必填项',
                          required: true,
                        },
                      ],
                    },
                  },
                  {
                    field: UNWIND_PER,
                    control: {
                      label: '平仓单价（每手）',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                  },
                ]}
              />
            )
          ) : (
            <Form
              wrappedComponentRef={node => (this.$lotForm = node)}
              dataSource={this.state.lotFormData}
              onValueChange={this.onLotFormDataChange}
              controlNumberOneRow={2}
              footer={false}
              controls={[
                {
                  field: CAN_UNWIND_PRICE,
                  control: {
                    label: '可平仓名义本金',
                  },
                  input: {
                    ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    disabled: true,
                  },
                },
                {
                  field: CAN_UNWIND_NUM,
                  control: {
                    label: '可平仓手数',
                  },
                  input: {
                    ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    disabled: true,
                  },
                },
                {
                  field: UNWIND_PRICE,
                  control: {
                    label: '平仓名义本金',
                  },
                  input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG, disabled: true },
                },
                {
                  field: UNWIND_NUM,
                  control: {
                    label: '平仓手数',
                  },
                  input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                  decorator: {
                    rules: [
                      {
                        message: '数值必须大于0',
                        validator: (rule, value, callback) => {
                          if (value < 0) {
                            return callback(true);
                          }
                          callback();
                        },
                      },
                      {
                        message: '平仓数量（手）为必填项',
                        required: true,
                      },
                      {
                        message: '必须小于等于可平仓数量',
                        validator: (rule, value, callback) => {
                          if (value > this.state.lotFormData[CAN_UNWIND_NUM]) {
                            return callback(true);
                          }
                          callback();
                        },
                      },
                    ],
                  },
                },
                {
                  field: LEFT_PRICE,
                  control: {
                    label: '剩余名义本金',
                  },
                  input: {
                    ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    disabled: true,
                  },
                },
                {
                  field: LEFT_NUM,
                  control: {
                    label: '剩余手数',
                  },
                  input: {
                    ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    disabled: true,
                  },
                },
                {
                  field: UNWIND_TOTAL,
                  control: {
                    label: '平仓金额',
                  },
                  input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                  decorator: {
                    rules: [
                      {
                        message: '平仓金额为必填项',
                        required: true,
                      },
                    ],
                  },
                },
                {
                  field: UNWIND_PER,
                  control: {
                    label: '平仓单价（每手）',
                  },
                  input: {
                    ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                    disabled: true,
                  },
                },
                // {
                //   field: UNWIND_TOTAL,
                //   control: {
                //     label: '平仓金额',
                //   },
                //   input: {
                //     ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                //     disabled: false,
                //   },
                // },
                // {
                //   field: UNWIND_PER,
                //   control: {
                //     label: '平仓单价（每手）',
                //   },
                //   input: INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                //   decorator: {
                //     rules: [
                //       {
                //         message: '数值必须大于0',
                //         validator: (rule, value, callback) => {
                //           if (value < 0) {
                //             return callback(true);
                //           }
                //           callback();
                //         },
                //       },
                //       {
                //         message: '平仓单价（每手）为必填项',
                //         required: true,
                //       },
                //     ],
                //   },
                // },
              ]}
            />
          )}
          <Alert message="平仓金额为正时代表我方收入，金额为负时代表我方支出。" type="info" />
        </Modal>
      </>
    );
  }
}

export default UnwindModal;
