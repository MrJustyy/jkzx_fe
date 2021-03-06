import { InputBase } from '@/components/type';
import { LEG_FIELD, LEG_TYPE_FIELD, LEG_TYPE_MAP } from '@/constants/common';
import { InputNumber } from '@/containers';
import { Import2 } from '@/containers/InstrumentModalInput';
import { getRequiredRule } from '@/tools';
import { ILegColDef } from '@/types/leg';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';

class MultiplierModalInput extends InputBase {
  public renderEditing() {
    const { editing, value = [], onChange, onValueChange } = this.props;
    return (
      <>
        {value
          .map((item, index) => {
            return item.underlyerMultiplier;
          })
          .join(', ')}
        <Import2 value={value} onChange={onChange} onValueChange={onValueChange} />
      </>
    );
  }

  public renderRendering() {
    const { editing, value = [], onChange, onValueChange } = this.props;
    return (
      <>
        {value
          .map((item, index) => {
            return item.underlyerMultiplier;
          })
          .join(', ')}
      </>
    );
  }
}

export const UnderlyerMultiplier: ILegColDef = {
  title: '合约乘数',
  dataIndex: LEG_FIELD.UNDERLYER_MULTIPLIER,
  editable: record => {
    return false;
  },
  defaultEditing: false,
  render: (val, record, dataIndex, { form, editing, colDef }) => {
    return (
      <FormItem>
        {form.getFieldDecorator({
          rules: [getRequiredRule()],
        })(
          record[LEG_TYPE_FIELD] === LEG_TYPE_MAP.SPREAD_EUROPEAN ||
            record[LEG_TYPE_FIELD] === LEG_TYPE_MAP.RATIO_SPREAD_EUROPEAN ? (
            <MultiplierModalInput editing={editing} />
          ) : (
            <InputNumber editing={false} />
          ),
        )}
      </FormItem>
    );
  },
  //   getValue: {
  //     depends: [LEG_FIELD.UNDERLYER_INSTRUMENT_ID],
  //     value: record => {
  //       return mktInstrumentInfo({
  //         instrumentId: record[LEG_FIELD.UNDERLYER_INSTRUMENT_ID],
  //       }).then(rsp => {
  //         if (rsp.error || undefined === rsp.data.instrumentInfo.multiplier) return 1;
  //         return new BigNumber(rsp.data.instrumentInfo.multiplier)
  //           .decimalPlaces(BIG_NUMBER_CONFIG.DECIMAL_PLACES)
  //           .toNumber();
  //       });
  //     },
  //   },
};
