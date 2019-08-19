import { Col, Row } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React, { memo, useRef, useState } from 'react';
import Mock from 'mockjs';
import useLifecycles from 'react-use/lib/useLifecycles';
import moment from 'moment';
import { connect } from 'dva';
import { Chart, G2, Geom, Axis, Tooltip, Coord } from 'bizcharts';
import DataSet from '@antv/data-set';
import styled from 'styled-components';
import { IFormColDef } from '@/components/type';
import { Form2, Loading } from '@/containers';
import ThemeButton from '@/containers/ThemeButton';
import ThemeDatePickerRanger from '@/containers/ThemeDatePickerRanger';
import ThemeSelect from '@/containers/ThemeSelect';
import { delay } from '@/tools';
import PosCenter from '@/containers/PosCenter';

const FormItemWrapper = styled.div`
  .ant-form-item-label label {
    color: #f5faff;
  }
  .ant-row.ant-form-item {
    margin-bottom: 0;
  }
`;

const ImpliedVolatility = props => {
  const formRef = useRef<Form2>(null);
  const [formData, setFormData] = useState(
    Form2.createFields({
      valuationDate: [moment().subtract(2, 'years'), moment()],
      window: '22',
    }),
  );
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(false);

  const { instrumentIds } = props;

  const newData = dataSource.map(item => ({
    ...item,
    min: [item.minVol, item.impliedVol],
    max: [item.impliedVol, item.maxVol],
    middle: [item.impliedVol, item.impliedVol],
  }));

  const dv = new DataSet.View().source(newData);
  dv.transform({
    type: 'fold',
    fields: ['max', 'min'],
    key: 'name',
    value: 'vol',
  });

  const mockData = () =>
    Mock.mock({
      'data|10': [
        {
          instrumentId: '@string(8)',
          minVol: '@natural(1,4)',
          maxVol: '@natural(7,9)',
          impliedVol: '@natural(5,6)',
        },
      ],
    });

  const onSearch = async () => {
    const rsp = await formRef.current.validate();
    if (rsp.error) return;
    setLoading(true);
    const result = delay(1000, mockData()).then(rsps => {
      setLoading(false);
      const { data } = rsps;
      setDataSource(data);
    });
  };

  const onFormChange = (text, changedFields, allFields) => {
    setFormData({
      ...formData,
      ...changedFields,
    });
  };

  const FORM_CONTROLS: IFormColDef[] = [
    {
      title: '观察日期',
      dataIndex: 'valuationDate',
      render: (val, record, index, { form }) => (
        <FormItem>
          {form.getFieldDecorator({
            rules: [
              {
                required: true,
                message: '观察日期是必填项',
              },
            ],
          })(<ThemeDatePickerRanger allowClear={false}></ThemeDatePickerRanger>)}
        </FormItem>
      ),
    },
    {
      title: '窗口',
      dataIndex: 'window',
      render: (val, record, index, { form }) => (
        <FormItem>
          {form.getFieldDecorator({
            rules: [
              {
                required: true,
                message: '窗口是必填项',
              },
            ],
          })(
            <ThemeSelect
              style={{ minWidth: 200 }}
              options={[1, 3, 5, 10, 22, 44, 66, 132].map(item => ({
                label: item,
                value: item,
              }))}
            ></ThemeSelect>,
          )}
        </FormItem>
      ),
    },
  ];

  useLifecycles(() => {
    onSearch();
  });

  return (
    <div style={{ border: '1px solid #05507b', padding: '15px 15px' }}>
      <Row type="flex" gutter={18}>
        <Col>
          <FormItemWrapper>
            <Form2
              hideRequiredMark
              ref={node => {
                formRef.current = node;
              }}
              dataSource={formData}
              onFieldsChange={onFormChange}
              columns={FORM_CONTROLS}
              layout="inline"
              footer={false}
            ></Form2>
          </FormItemWrapper>
        </Col>
        <Col>
          <ThemeButton
            onClick={() => {
              setMeta(true);
              onSearch();
            }}
            type="primary"
            style={{ marginTop: '4px' }}
            loading={meta && loading}
          >
            确定
          </ThemeButton>
        </Col>
      </Row>
      <Row type="flex" justify="start" style={{ margin: 0 }} gutter={12}>
        {dataSource.length ? (
          <Chart
            width={1450}
            height={600}
            padding={[40, 40, 40, 40]}
            forceFit
            data={dv}
            scale={{
              instrumentId: { alias: '标的物品种' },
              vol: { alias: '波动率', min: 0, max: 10 },
              middle: { min: 0, max: 10 },
            }}
          >
            <Axis
              name="instrumentId"
              title={{
                position: 'end',
                offset: 0,
                textStyle: {
                  paddingLeft: 20,
                },
              }}
              grid={null}
              label={{
                textStyle: {
                  fontSize: '14',
                  fill: 'white',
                  lineHeight: '32px',
                  fontWeight: '400',
                },
              }}
              tickLine={null}
            ></Axis>
            <Axis
              name="vol"
              grid={null}
              label={false}
              title={{
                position: 'end',
                offset: 20,
                autoRotate: false,
              }}
              line={{
                stroke: '#f2ffff',
                lineWidth: 1,
              }}
            ></Axis>
            <Axis name="middle" grid={null} label={false}></Axis>
            <Tooltip
              useHtml
              crosshairs={{
                type: 'rect',
                style: {
                  stroke: '#00BAFF',
                },
              }}
              shared={false}
              itemTpl={
                '<li data-index={index} style="margin-bottom:4px;"><span style="padding-left: 16px">最大值：{maxVol}</span><br/><span style="padding-left: 16px">最小值：{minVol}</span><br/><span style="padding-left: 16px">波动率：{impliedVol}</span></li>'
              }
            ></Tooltip>
            <Geom
              type="interval"
              position="instrumentId*vol"
              tooltip={[
                'min*max*minVol*maxVol*impliedVol',
                (min, max, minVol, maxVol, impliedVol) => ({
                  min,
                  max,
                  minVol,
                  maxVol,
                  impliedVol,
                }),
              ]}
              color={['name', val => (val === 'max' ? '#F15345' : '#7070D3')]}
            ></Geom>
            <Geom
              type="interval"
              position="instrumentId*middle"
              tooltip={false}
              style={{
                lineWidth: 2,
                stroke: '#E7B677',
              }}
            ></Geom>
          </Chart>
        ) : (
          <PosCenter height={500}>
            <Loading loading={loading}></Loading>
          </PosCenter>
        )}
      </Row>
    </div>
  );
};

export default memo(
  connect(({ centerUnderlying }) => ({
    instrumentIds: centerUnderlying.instrumentIds,
  }))(ImpliedVolatility),
);
