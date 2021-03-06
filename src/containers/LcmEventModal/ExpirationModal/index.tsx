import { Alert, Button, message, Modal } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import moment from 'moment';
import React, { PureComponent } from 'react';
import {
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP,
  EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP,
  INPUT_NUMBER_CURRENCY_CNY_CONFIG,
  INPUT_NUMBER_DIGITAL_CONFIG,
  LCM_EVENT_TYPE_MAP,
  LEG_FIELD,
  LEG_TYPE_FIELD,
  LEG_TYPE_ZHCH_MAP,
  NOTION_ENUM_MAP,
  OB_PRICE_FIELD,
  OPTION_TYPE_OPTIONS,
  STRIKE_TYPES_MAP,
  NOTIONAL_AMOUNT_TYPE_MAP,
} from '@/constants/common';
import CashExportModal from '@/containers/CashExportModal';
import Form from '@/containers/Form';
import { tradeExercisePreSettle, trdTradeLCMEventProcess } from '@/services/trade-service';
import { getMinRule, getRequiredRule, isAutocallPhoenix, isAutocallSnow, isKnockIn } from '@/tools';
import { OB_LIFE_PAYMENT } from '../constants';
import { getObservertionFieldData } from '../tools';
import {
  EXERCISE_PRICE,
  EXPIRATION_CALL_PUT_FORM_CONTROLS,
  EXPIRATION_FIXED_FORM_CONTROLS,
  EXPIRE_NO_BARRIER_PREMIUM_TYPE,
  MATURES,
  NOTIONAL_AMOUNT,
  SETTLE_AMOUNT,
  UNDERLYER_PRICE,
} from './constants';
import { Form2 } from '@/containers';

class ExpirationModal extends PureComponent<
  {
    visible?: boolean;
    data?: any;
    fixingEdited?: boolean;
  },
  any
> {
  public data: any = {};

  public fixingTableData: any = [];

  public state = {
    visible: false,
    autoCallPaymentType: null,
    modalConfirmLoading: false,
    exportVisible: false,
    fixedDataSource: {},
    callPutDataSource: {},
    premiumType: null,
    formData: {},
    notionalType: '',
  };

  public autocalPhoenixInitial = () => {
    this.setState({
      visible: true,
      formData: this.computedFormData(),
    });
  };

  public computedFormData = () => ({
    [LEG_FIELD.NOTIONAL_AMOUNT]: this.data[LEG_FIELD.NOTIONAL_AMOUNT],
    [LEG_FIELD.UNDERLYER_INSTRUMENT_PRICE]: this.getUnderlyerPrice(),
    [LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE]: this.data[LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE],
    [LEG_FIELD.STRIKE]: this.data[LEG_FIELD.DOWN_BARRIER_OPTIONS_STRIKE],
    [LEG_FIELD.DOWN_BARRIER_OPTIONS_TYPE]: this.data[LEG_FIELD.DOWN_BARRIER_OPTIONS_TYPE],
    [LEG_FIELD.COUPON_PAYMENT]: this.getCouponPaymentTotal(),
  });

  /**
   * coupnon部分：
   * 如果由fixing中进入到期，则coupon部分收益=观察事件表格中观察周期收益的总和
   * 如果由菜单进入：获得所有观察价格，按照fixing事件中的方法进行计算
   */

  public getUnderlyerPrice = () => {
    if (this.fixingTableData.length) {
      return Form2.getFieldValue(
        _.chain(this.fixingTableData)
          .last()
          .get(OB_PRICE_FIELD)
          .value(),
      );
    }
    return Form2.getFieldValue(
      _.chain(getObservertionFieldData(this.data))
        .last()
        .get(OB_PRICE_FIELD)
        .value(),
    );
  };

  public getCouponPaymentTotal = () => {
    if (this.fixingTableData.length) {
      return this.fixingTableData.reduce((total, next) => total + (next[OB_LIFE_PAYMENT] || 0), 0);
    }

    return getObservertionFieldData(this.data).reduce(
      (total, next) => total + (next[OB_LIFE_PAYMENT] || 0),
      0,
    );
  };

  public show = (data = {}, tableFormData, currentUser, reload, fixingTableData = []) => {
    this.data = data;
    this.tableFormData = tableFormData;
    this.currentUser = currentUser;
    this.reload = reload;
    this.fixingTableData = fixingTableData;

    if (isAutocallPhoenix(this.data)) {
      return this.autocalPhoenixInitial();
    }

    const premiumType = this.data[LEG_FIELD.AUTO_CALL_STRIKE_UNIT];
    const autoCallPaymentType = this.data[LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE];
    const isFixed =
      this.data[LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE] ===
      EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP.FIXED;

    return this.setState(
      {
        visible: true,
        autoCallPaymentType,
        premiumType,
        notionalType: this.data[LEG_FIELD.NOTIONAL_AMOUNT_TYPE],
        ...(isFixed
          ? {
              fixedDataSource: this.computeFixedDataSource(this.data),
            }
          : {
              callPutDataSource: this.computeCallPutDataSource(this.data),
            }),
      },
      async () => {
        if (isAutocallSnow(this.data) && isFixed) {
          const dataSource = this.state.fixedDataSource;
          const { error, data: settleAmount } = await this.preSettleAmount({
            notionalAmount: String(dataSource[NOTIONAL_AMOUNT]),
          });
          if (error) return;
          this.setState(pre => ({
            ...pre,
            fixedDataSource: {
              ...pre.fixedDataSource,
              [SETTLE_AMOUNT]: settleAmount,
            },
          }));
        }
      },
    );
  };

  public computeFixedDataSource = value => {
    const matures = value[LEG_FIELD.EXPIRE_NOBARRIERPREMIUM];
    return {
      [EXPIRE_NO_BARRIER_PREMIUM_TYPE]:
        EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP[value[LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE]],
      [NOTIONAL_AMOUNT]: value[LEG_FIELD.NOTIONAL_AMOUNT],
      [MATURES]: matures,
    };
  };

  public computeCallPutDataSource = value => {
    const autoCallStrike = value[LEG_FIELD.AUTO_CALL_STRIKE];
    return {
      [EXPIRE_NO_BARRIER_PREMIUM_TYPE]:
        EXPIRE_NO_BARRIER_PREMIUM_TYPE_ZHCN_MAP[value[LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE]],
      [NOTIONAL_AMOUNT]: value[LEG_FIELD.NOTIONAL_AMOUNT],
      [EXERCISE_PRICE]: autoCallStrike,
      paymentDate: value[LEG_FIELD.SETTLEMENT_DATE]
        ? moment(value[LEG_FIELD.SETTLEMENT_DATE])
        : moment(),
    };
  };

  public switchConfirmLoading = () => {
    this.setState(state => ({ modalConfirmLoading: !state.modalConfirmLoading }));
  };

  public switchModal = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        if (this.props.fixingEdited) {
          this.reload();
        }
      },
    );
  };

  public getUsedFormData = () => {
    if (isAutocallPhoenix(this.data)) {
      return this.state.formData;
    }

    return this.data[LEG_FIELD.EXPIRE_NOBARRIER_PREMIUM_TYPE] ===
      EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP.FIXED
      ? this.state.fixedDataSource
      : this.state.callPutDataSource;
  };

  public getEventDetail = formData => {
    if (isAutocallPhoenix(this.data)) {
      return {
        settleAmount: String(formData[LEG_FIELD.SPECIFIED_PRICE2]),
        underlyerPrice:
          formData[LEG_FIELD.UNDERLYER_INSTRUMENT_PRICE] === undefined
            ? null
            : String(formData[LEG_FIELD.UNDERLYER_INSTRUMENT_PRICE]),
      };
    }
    if (isAutocallSnow(this.data)) {
      return {
        ...(formData[UNDERLYER_PRICE]
          ? { underlyerPrice: String(formData[UNDERLYER_PRICE]) }
          : null),
        settleAmount: String(formData[SETTLE_AMOUNT]),
      };
    }
    return null;
  };

  public onConfirm = async () => {
    let rsp;
    if (isAutocallPhoenix(this.data)) {
      rsp = await this.$autocallPhoenix.validate();
    } else if (
      isAutocallSnow(this.data) &&
      this.state.autoCallPaymentType === EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP.FIXED
    ) {
      rsp = await this.$expirationFixedModal.validate();
    } else if (isAutocallSnow(this.data)) {
      rsp = await this.$expirationCallModal.validate();
    } else {
      rsp = 'expiration';
    }
    if (rsp.error) return;
    const usedFormData = this.getUsedFormData();
    this.switchConfirmLoading();
    const { error, data } = await trdTradeLCMEventProcess({
      positionId: this.data.id,
      tradeId: this.tableFormData.tradeId,
      eventType:
        isAutocallPhoenix(this.data) || isAutocallSnow(this.data)
          ? LCM_EVENT_TYPE_MAP.SETTLE
          : LCM_EVENT_TYPE_MAP.EXPIRATION,
      userLoginId: this.currentUser.username,
      eventDetail: this.getEventDetail(usedFormData),
    });

    this.switchConfirmLoading();
    if (error) return;
    message.success('操作成功');
    this.setState({
      visible: false,
      exportVisible: true,
    });
  };

  public onCallValueChange = params => {
    this.setState({
      callPutDataSource: params.values,
    });
  };

  public onFixedValueChange = params => {
    this.setState({
      fixedDataSource: params.values,
    });
  };

  public convertVisible = () => {
    this.setState({
      exportVisible: false,
    });
  };

  public preSettleAmount = async eventDetail => {
    const rsp = await tradeExercisePreSettle({
      positionId: this.data.id,
      eventDetail,
      eventType: LCM_EVENT_TYPE_MAP.SETTLE,
    });
    return rsp;
  };

  public handleSettleAmount = async () => {
    const dataSource = this.state.callPutDataSource;
    if (!dataSource[UNDERLYER_PRICE]) {
      if (!(dataSource[UNDERLYER_PRICE] === 0)) {
        message.error('请填标的物价格');
        return;
      }
    }
    const { error, data } = await this.preSettleAmount({
      underlyerPrice: String(dataSource[UNDERLYER_PRICE]),
      notionalAmount: String(dataSource[NOTIONAL_AMOUNT]),
    });
    if (error) return;
    this.setState({
      callPutDataSource: {
        ...dataSource,
        [SETTLE_AMOUNT]: data,
      },
    });
  };

  public onFormValueChange = params => {
    this.setState({
      formData: params.values,
    });
  };

  // 不要删除，可能后期会使用到
  // 凤凰到期的 标的物结算金额 暂时不去计算
  public countAutocalPhoenixSettleAmount = async () => {
    const dataSource = this.state.formData;
    const { error, data } = await tradeExercisePreSettle({
      positionId: this.data.id,
      eventDetail: isKnockIn(this.data)
        ? {
            underlyerPrice: String(dataSource[LEG_FIELD.UNDERLYER_INSTRUMENT_PRICE]),
          }
        : { underlyerPrice: null },
      eventType: LCM_EVENT_TYPE_MAP.SETTLE,
    });
    if (error) return;
    this.setState({
      formData: {
        ...dataSource,
        [LEG_FIELD.SPECIFIED_PRICE2]: data,
      },
    });
  };

  public getForm = () => {
    if (isAutocallPhoenix(this.data)) {
      return (
        <Form
          dataSource={this.state.formData}
          onValueChange={this.onFormValueChange}
          ref={node => {
            this.$autocallPhoenix = node;
          }}
          controlNumberOneRow={1}
          footer={false}
          controls={[
            {
              field: LEG_FIELD.NOTIONAL_AMOUNT,
              control: {
                label:
                  this.data[LEG_FIELD.NOTIONAL_AMOUNT_TYPE] === NOTION_ENUM_MAP.CNY
                    ? '名义本金 (￥)'
                    : '名义本金 (手)',
              },
              input: { ...INPUT_NUMBER_DIGITAL_CONFIG, disabled: true },
              decorator: {
                rules: [getRequiredRule(), getMinRule()],
              },
            },
            {
              field: LEG_FIELD.COUPON_PAYMENT,
              control: {
                label: 'Coupon收益',
              },
              input: { ...INPUT_NUMBER_CURRENCY_CNY_CONFIG, disabled: true },
              decorator: {
                rules: [getRequiredRule()],
              },
            },
            {
              field: LEG_FIELD.DOWN_BARRIER_OPTIONS_TYPE,
              control: {
                label: '敲入期权',
              },
              input: {
                disabled: true,
                type: 'select',
                options: isKnockIn(this.data)
                  ? OPTION_TYPE_OPTIONS
                  : [{ label: '未敲入', value: 'CALL' }, { label: '未敲入', value: 'PUT' }],
              },
              decorator: {
                rules: [getRequiredRule()],
              },
            },
            ...(isKnockIn(this.data)
              ? [
                  {
                    field: LEG_FIELD.STRIKE,
                    control: {
                      label:
                        this.data[LEG_FIELD.DOWN_BARRIER_OPTIONS_STRIKE_TYPE] ===
                        STRIKE_TYPES_MAP.PERCENT
                          ? '行权价(%)'
                          : '行权价(￥)',
                    },
                    input: {
                      ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                      disabled: true,
                    },
                    decorator: {
                      rules: [getRequiredRule()],
                    },
                  },
                  {
                    field: LEG_FIELD.UNDERLYER_INSTRUMENT_PRICE,
                    control: {
                      label: '标的物结算价格',
                    },
                    decorator: {
                      rules: [getRequiredRule()],
                    },
                  },
                ]
              : []),
            {
              field: LEG_FIELD.SPECIFIED_PRICE2,
              control: {
                label: '结算金额',
              },
              input: {
                ...INPUT_NUMBER_CURRENCY_CNY_CONFIG,
                after: (
                  <Button
                    key="upload"
                    type="primary"
                    onClick={this.countAutocalPhoenixSettleAmount}
                  >
                    试结算
                  </Button>
                ),
              },
              decorator: {
                rules: [getRequiredRule()],
              },
            },
          ]}
        />
      );
    }
    if (isAutocallSnow(this.data)) {
      return this.state.autoCallPaymentType === EXPIRE_NO_BARRIER_PREMIUM_TYPE_MAP.FIXED ? (
        <Form
          ref={node => {
            this.$expirationFixedModal = node;
          }}
          dataSource={this.state.fixedDataSource}
          onValueChange={this.onFixedValueChange}
          controlNumberOneRow={1}
          footer={false}
          controls={EXPIRATION_FIXED_FORM_CONTROLS(this.state.notionalType)}
        />
      ) : (
        <Form
          ref={node => {
            this.$expirationCallModal = node;
          }}
          dataSource={this.state.callPutDataSource}
          onValueChange={this.onCallValueChange}
          controlNumberOneRow={1}
          footer={false}
          controls={EXPIRATION_CALL_PUT_FORM_CONTROLS(
            this.state.notionalType,
            this.state.premiumType,
            this.handleSettleAmount,
          )}
        />
      );
    }
    return '确认到期操作？';
  };

  public $expirationFixedModal: Form;

  public $expirationCallModal: Form;

  public $autocallPhoenix: Form;

  public tableFormData: any;

  public currentUser: any;

  public reload: any;

  public render() {
    const { visible } = this.state;
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
          visible={visible}
          confirmLoading={this.state.modalConfirmLoading}
          title={`${
            isAutocallPhoenix(this.data) || isAutocallSnow(this.data) ? '到期结算' : '到期'
          } (${LEG_TYPE_ZHCH_MAP[this.data[LEG_TYPE_FIELD]]})`}
        >
          {this.getForm()}
          {isAutocallPhoenix(this.data) || isAutocallSnow(this.data) ? (
            <Alert message="结算金额为正时代表我方收入，金额为负时代表我方支出。" type="info" />
          ) : null}
        </Modal>
      </>
    );
  }
}

export default ExpirationModal;
