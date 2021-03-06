import React from 'react';
import { OptionProps } from 'antd/lib/select';
import FormItem from 'antd/lib/form/FormItem';
import _ from 'lodash';
import { IFormControl } from '@/containers/_Form2';
import { getCanUsedTranorsOtions } from '@/services/common';
import { Form2, Select } from '@/containers';
import { UnitInputNumber } from '@/containers/UnitInputNumber';
import { MARKET_KEY, GROUP_KEY, INSTANCE_KEY } from './constants';

export const SEARCH_FORM = (groups, formData) => [
  {
    title: '标的',
    dataIndex: MARKET_KEY,
    render: (value, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
            },
          ],
        })(<Select style={{ minWidth: 180 }} placeholder="请选择左侧标的物" disabled />)}
      </FormItem>
    ),
  },
  {
    title: '分组',
    dataIndex: GROUP_KEY,
    render: (value, record, index, { form, editing }) => (
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
          />,
        )}
      </FormItem>
    ),
  },
  {
    title: '定价环境',
    dataIndex: INSTANCE_KEY,
    render: (value, record, index, { form, editing }) => (
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
            disabled={!_.get(formData, `${GROUP_KEY}.value`)}
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
          />,
        )}
      </FormItem>
    ),
  },
];

export const SEARCH_FORM_CONTROLS: (groups: OptionProps[], formData: any) => IFormControl[] = (
  groups,
  formData,
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
    width: 120,
    dataIndex: 'tenor',
    defaultEditing: false,
    editable: record => true,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(
          <Select
            defaultOpen
            autoSelect
            options={getCanUsedTranorsOtions(
              tableDataSource.map(item => Form2.getFieldsValue(item)),
              Form2.getFieldsValue(record),
            )}
            editing={editing}
          />,
        )}
      </FormItem>
    ),
  },
  {
    dataIndex: '80% SPOT',
    title: '80% SPOT',
    width: 150,
    percent: 0.8,
    align: 'right',
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
  {
    dataIndex: '90% SPOT',
    title: '90% SPOT',
    width: 150,
    align: 'right',
    percent: 0.9,
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
  {
    dataIndex: '95% SPOT',
    title: '95% SPOT',
    width: 150,
    align: 'right',
    percent: 0.95,
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
  {
    dataIndex: '100% SPOT',
    title: '100% SPOT',
    width: 150,
    align: 'right',
    percent: 1,
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
  {
    dataIndex: '105% SPOT',
    title: '105% SPOT',
    width: 150,
    percent: 1.05,
    align: 'right',
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
  {
    dataIndex: '110% SPOT',
    title: '110% SPOT',
    width: 150,
    align: 'right',
    percent: 1.1,
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
  {
    dataIndex: '120% SPOT',
    title: '120% SPOT',
    width: 150,
    align: 'right',
    percent: 1.2,
    editable: record => true,
    defaultEditing: false,
    render: (val, record, index, { form, editing }) => (
      <FormItem>
        {form.getFieldDecorator({
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        })(<UnitInputNumber autoSelect editing={editing} unit="%" />)}
      </FormItem>
    ),
  },
];
