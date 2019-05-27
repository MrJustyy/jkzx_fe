import React from 'react';
import { INPUT_NUMBER_PERCENTAGE_CONFIG } from '@/constants/common';
import { IFormControl } from '@/containers/_Form2';
import { IColumnDef } from '@/containers/_Table2';
import { OptionProps } from 'antd/lib/select';
import FormItem from 'antd/lib/form/FormItem';
import {
  getCanUsedTranorsOtions,
  getCanUsedTranorsOtionsNotIncludingSelf,
} from '@/services/common';
import { Form2, Input, Select } from '@/containers';
import { UnitInputNumber } from '@/containers/UnitInputNumber';

export const TRADER_VALUE = 'trader';

export const RISK_CONTROLER_VALUE = 'riskControler';

export const GROUP_KEY = 'modelType';

export const MARKET_KEY = 'underlyer';

export const INSTANCE_KEY = 'instance';

export const SEARCH_FORM = (groups, formData) => [
  {
    title: '标的',
    dataIndex: MARKET_KEY,
    render: (value, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({
            rules: [
              {
                required: true,
              },
            ],
          })(<Select style={{ minWidth: 180 }} placeholder="请选择左侧标的物" disabled={true} />)}
        </FormItem>
      );
    },
  },
  {
    title: '分组',
    dataIndex: GROUP_KEY,
    render: (value, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({
            rules: [
              {
                required: true,
              },
            ],
          })(
            <Select
              style={{ minWidth: 180 }}
              placeholder="选择标的物后，继续选择分组项"
              options={groups}
            />
          )}
        </FormItem>
      );
    },
  },
  {
    title: '定价环境',
    dataIndex: INSTANCE_KEY,
    render: (value, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({
            rules: [
              {
                required: true,
              },
            ],
          })(
            <Select
              style={{ minWidth: 180 }}
              placeholder="选择定价环境"
              disabled={!formData[GROUP_KEY]}
              options={[
                {
                  label: '日内',
                  value: 'INTRADAY',
                },
                {
                  label: '收盘',
                  value: 'CLOSE',
                },
              ]}
            />
          )}
        </FormItem>
      );
    },
  },
];

export const SEARCH_FORM_CONTROLS: (groups: OptionProps[], formData: any) => IFormControl[] = (
  groups,
  formData
) => [
  {
    control: {
      label: '标的',
      required: true,
    },
    dataIndex: MARKET_KEY,
    input: {
      disabled: true,
      placeholder: '请选择左侧标的物',
      type: 'input',
      subtype: 'show',
      hoverIcon: 'lock',
    },
    options: {
      rules: [
        {
          required: true,
        },
      ],
    },
  },
  {
    control: {
      label: '分组',
    },
    dataIndex: GROUP_KEY,
    input: {
      type: 'select',
      options: groups,
      placeholder: '选择标的物后，继续选择分组项',
    },
    options: {
      rules: [
        {
          required: true,
        },
      ],
    },
  },
  {
    control: {
      label: '定价环境',
    },
    dataIndex: INSTANCE_KEY,
    input: {
      disabled: !formData[GROUP_KEY],
      type: 'select',
      options: [
        {
          label: '日内',
          value: 'INTRADAY',
        },
        {
          label: '收盘',
          value: 'CLOSE',
        },
      ],
      placeholder: '选择定价环境',
    },
    options: {
      rules: [
        {
          required: true,
        },
      ],
    },
  },
];

export const TABLE_COLUMN = tableDataSource => [
  {
    title: '期限',
    dataIndex: 'tenor',
    defaultEditing: false,
    editable: record => {
      return true;
    },
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <Select
              defaultOpen={true}
              autoSelect={true}
              //   style={{ minWidth: 180 }}
              options={getCanUsedTranorsOtions(
                tableDataSource.map(item => Form2.getFieldsValue(item)),
                Form2.getFieldsValue(record)
              )}
              editing={editing}
            />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '80% SPOT',
    title: '80% SPOT',
    percent: 0.8,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '90% SPOT',
    title: '90% SPOT',
    percent: 0.9,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '95% SPOT',
    title: '95% SPOT',
    percent: 0.95,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '100% SPOT',
    title: '100% SPOT',
    percent: 1,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '105% SPOT',
    title: '105% SPOT',
    percent: 1.05,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '110% SPOT',
    title: '110% SPOT',
    percent: 1.1,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
  {
    dataIndex: '120% SPOT',
    title: '120% SPOT',
    percent: 1.2,
    editable: record => {
      return true;
    },
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => {
      return (
        <FormItem>
          {form.getFieldDecorator({})(
            <UnitInputNumber autoSelect={true} editing={editing} unit={'%'} />
          )}
        </FormItem>
      );
    },
  },
];

export const TABLE_COLUMN_DEFS: IColumnDef[] = [
  {
    editable: true,
    field: 'tenor',
    headerName: '期限',
    input: {
      type: 'select',
      options: getCanUsedTranorsOtionsNotIncludingSelf([]),
    },
  },
  {
    editable: true,
    field: '80% SPOT',
    headerName: '80% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 0.8,
  },
  {
    editable: true,
    field: '90% SPOT',
    headerName: '90% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 0.9,
  },
  {
    editable: true,
    field: '95% SPOT',
    headerName: '95% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 0.95,
  },
  {
    editable: true,
    field: '100% SPOT',
    headerName: '100% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 1,
  },
  {
    editable: true,
    field: '105% SPOT',
    headerName: '105% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 1.05,
  },
  {
    editable: true,
    field: '110% SPOT',
    headerName: '110% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 1.1,
  },
  {
    editable: true,
    field: '120% SPOT',
    headerName: '120% SPOT',
    input: INPUT_NUMBER_PERCENTAGE_CONFIG,
    percent: 1.2,
  },
];
