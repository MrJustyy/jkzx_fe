import { Form, Icon, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'dva';
import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { IFormColDef } from '@/components/type';
import { Form2 } from '@/containers';
import ThemeButton from '@/containers/ThemeButton';
import ThemeInput from '@/containers/ThemeInput';
import ThemeInputPassword from '@/containers/ThemeInputPassword';

const Wrap = styled.div`
  background: rgba(27, 38, 80, 1);
  height: 100vh;
  padding-top: 20vh;
  .wrap {
    height: 354px;
    width: 494px;
    margin: 0 auto;
    padding-top: 61px;
    border: 1px solid rgba(0, 232, 232, 1);
    background: rgba(0, 115, 139, 0.8);
    border-radius: 3;
  }
`;

const UserLayout = props => {
  const { login, submitting, dispatch } = props;
  const [formData, setFormData] = useState({});

  const queryCaptcha = async () => {
    dispatch({
      type: 'login/queryCaptcha',
      payload: {},
    });
  };

  const columns: IFormColDef[] = [
    {
      dataIndex: 'username',
      render: (val, record, index, { form }) => (
        <FormItem>
          {form.getFieldDecorator({
            rules: [{ required: true, message: '请输入用户名' }],
          })(
            <ThemeInput
              size="large"
              placeholder="请输入用户名"
              prefix={<Icon type="user" style={{ color: '#00BBFD' }} />}
            />,
          )}
        </FormItem>
      ),
    },
    {
      dataIndex: 'password',
      render: (val, record, index, { form }) => (
        <FormItem>
          {form.getFieldDecorator({
            rules: [{ required: true, message: '请输入密码' }],
          })(
            <ThemeInputPassword
              size="large"
              prefix={<Icon type="lock" style={{ color: '#00BBFD' }} />}
              placeholder="请输入密码"
            />,
          )}
        </FormItem>
      ),
    },
    {
      dataIndex: 'captcha',
      render: (val, record, index, { form }) => (
        <FormItem>
          <Row type="flex" justify="space-between">
            {form.getFieldDecorator({
              rules: [
                { required: true, message: '请输入验证码' },
                { max: 4, message: '长度不能超过 4 位' },
              ],
            })(
              <ThemeInput
                size="large"
                placeholder="请输入验证码"
                style={{ width: 'auto', flexGrow: 1 }}
                prefix={<Icon type="security-scan" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />,
            )}

            <img
              style={{ cursor: 'pointer' }}
              src={login.img}
              alt="验证码"
              onClick={() => queryCaptcha()}
            />
          </Row>
        </FormItem>
      ),
    },
  ];

  const handleSubmit = async () => {
    const { error, values } = await formData.validate();
    if (error) return;
    // values.captcha = '';
    dispatch({
      type: 'login/login',
      payload: {
        loginParams: values,
        skipMenu: false,
        defaultRedirect: '/center/underlying',
        loginUrl: '/center/login',
        rootRouteTag: 'centerRoute',
        skipPermission: true,
      },
    });
  };

  useEffect(() => {
    queryCaptcha();
  }, []);

  return (
    <Wrap>
      <div className="wrap">
        <Form2
          ref={form => {
            setFormData(form);
          }}
          columnNumberOneRow={1}
          wrapperCol={{ span: 16, offset: 4 }}
          dataSource={login.loginFormData}
          onFieldsChange={(props2, fields) => {
            props.dispatch({
              type: 'login/changeForm',
              payload: {
                ...login.loginFormData,
                ...fields,
              },
            });
          }}
          columns={columns}
          footer={
            <Form.Item>
              <ThemeButton
                htmlType="submit"
                size="large"
                type="primary"
                block
                onClick={handleSubmit}
                loading={submitting}
              >
                登 录
              </ThemeButton>
            </Form.Item>
          }
        />
      </div>
    </Wrap>
  );
};

export default memo(
  connect(({ login, loading }) => ({
    login,
    submitting: loading.effects['login/login'],
  }))(UserLayout),
);
