import React from 'react';
import FormItem from 'antd/lib/form/FormItem';
import { Divider, Button } from 'antd';
import { IFormControl } from '@/containers/_Form2';
import { ITableColDef } from '@/components/type';
import { Select } from '@/containers';
import Operation from './Operation';
import ButtonSelect from './ButtonSelect';

export const createPageTableColDefs = (roleOptions, showResources, departments, fetchData) => [
  {
    title: '用户名',
    dataIndex: 'username',
    width: 180,
  },
  {
    title: '昵称',
    dataIndex: 'nickName',
    width: 180,
  },
  {
    title: '拥有角色',
    dataIndex: 'roles',
    editable: record => true,
    render: (value, record, index, { form, editing, cellApi }) => (
      <FormItem>
        {form.getFieldDecorator({})(
          <ButtonSelect
            options={roleOptions}
            mode="multiple"
            {...{ record, index, form, editing, cellApi }}
          />,
        )}
      </FormItem>
    ),
  },
  {
    title: '部门',
    dataIndex: 'departmentName',
    width: 200,
  },
  {
    title: '类型',
    dataIndex: 'userTypeName',
    width: 100,
  },
  {
    title: '邮箱',
    dataIndex: 'contactEmail',
    width: 200,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 230,
    render: (value, record, index) => (
      <Operation
        record={record}
        showResources={showResources}
        departments={departments}
        fetchData={fetchData}
      />
    ),
  },
];

export const createFormControls = roles => ({ createFormData }): IFormControl[] => [
  {
    dataIndex: 'userName',
    control: {
      label: '用户名',
    },
    input: { type: 'input' },
    options: {
      rules: [
        {
          required: true,
        },
      ],
    },
  },
  {
    dataIndex: 'password',
    control: { label: '密码' },
    input: { type: 'input', inputType: 'password' },
    options: {
      rules: [
        {
          required: true,
        },
        {
          pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^0-9a-zA-Z]).{12,30}/,
          message: '密码必须包含至少一位数字、字母、以及其他特殊字符，且不小于12位',
        },
      ],
    },
  },
  {
    dataIndex: 'confirmpassword',
    control: { label: '确认密码' },
    input: { type: 'input', inputType: 'password' },
    options: {
      rules: [
        {
          required: true,
        },
        {
          validator(rule, value, cb) {
            if (createFormData.password !== value) {
              cb('2次密码输入不一致');
            }
            cb();
          },
        },
      ],
    },
  },
  {
    dataIndex: 'roleIds',
    control: {
      label: '角色',
    },
    input: {
      type: 'select',
      mode: 'multiple',
      options: roles.map(item => ({
        label: item.roleName,
        value: item.uuid,
      })),
    },
  },
];
