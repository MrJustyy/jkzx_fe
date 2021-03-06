import DataSet from '@antv/data-set';
import { Button, Col, DatePicker, Row, Select, notification, Divider, Icon } from 'antd';
import { Axis, Chart, Geom, Tooltip } from 'bizcharts';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';
import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { connect } from 'dva';
import FormItem from 'antd/lib/form/FormItem';
import ChartTitle from '@/containers/ChartTitle';
import ThemeSelect from '@/containers/ThemeSelect';
import ThemeDatePickerRanger from '@/containers/ThemeDatePickerRanger';
import ThemeButton from '@/containers/ThemeButton';
import { Loading } from '@/containers';
import { delay, formatNumber } from '@/tools';
import PosCenter from '@/containers/PosCenter';
import { getInstrumentRollingVol } from '@/services/terminal';
import { refTradeDateByOffsetGet } from '@/services/volatility';
import FormItemWrapper from '@/containers/FormItemWrapper';
import { themeNotification } from './themeNotification';

const Rollong = props => {
  const chartRef = useRef(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([moment().subtract(6, 'months'), moment()]);
  const [searchDates, setSearchDates] = useState([moment().subtract(6, 'months'), moment()]);
  const [window, setWindow] = useState('22');
  const [startDate, setStartDate] = useState();
  const [tradeDate, setTradeDate] = useState(false);

  const generateGradualColorStr = fdv => {
    const { rows } = fdv;
    const values = rows.map(item => item.value);
    const min = _.min<number>(values);
    const max = _.max<number>(values);
    const color = scaleLinear<string, number>()
      .domain([min, (max - min) / 2 + min, max])
      .range(['#77A786', '#FF4200', '#FFC000'])
      .clamp(true);
    const colorStrs = rows
      .map((item, index) => `${item.value / max}:${color(item.value)}`)
      .join(' ');
    return `l(270) ${colorStrs}`;
  };

  const fetch = async param => {
    const paramDates = param || dates;
    setLoading(true);
    const rsp = await getInstrumentRollingVol({
      instrumentId: props.instrumentId,
      startDate: paramDates[0].format('YYYY-MM-DD'),
      endDate: paramDates[1].format('YYYY-MM-DD'),
      window: _.toNumber(window),
      isPrimary: true,
    });
    if (rsp.error) {
      setLoading(false);
      return;
    }

    const diagnostics = _.get(rsp, 'raw.result.diagnostics');
    if (_.get(diagnostics, 'length')) {
      themeNotification(diagnostics);
    }

    const fdata = rsp.data.map(item => ({
      time: item.tradeDate,
      value: item.vol,
    }));
    // const s = _.concat(fdata, {
    //   time: dates[1].format('YYYY-MM-DD'),
    //   value: null,
    // })
    const dv = new DataSet.View().source(fdata);

    const gradualColorStr = generateGradualColorStr(dv);
    setLoading(false);
    setMeta({
      gradualColorStr,
      dv,
    });
  };

  const getDate = async () => {
    const { data, error } = await refTradeDateByOffsetGet({
      offset: -2,
    });
    setTradeDate(true);
    if (error) return;
    setDates([moment().subtract(6, 'months'), moment(data)]);
    setSearchDates([moment().subtract(6, 'months'), moment(data)]);
  };

  useEffect(() => {
    getDate();
  }, []);

  useEffect(() => {
    if (props.instrumentId && tradeDate) {
      fetch(dates);
    }
  }, [props.instrumentId, searchDates]);

  return (
    <>
      <Row type="flex" justify="start" style={{ padding: 17 }} gutter={12}>
        <Col style={{ borderRight: '1px solid #05507b' }}>
          <FormItemWrapper>
            <FormItem label="日期" style={{ fontSize: 16 }}>
              <ThemeDatePickerRanger
                onChange={pDates => {
                  setDates(pDates);
                  setStartDate();
                }}
                onCalendarChange={pDates => {
                  setStartDate(pDates[0]);
                }}
                value={dates}
                allowClear={false}
                disabledDate={current =>
                  // startDate && current && current.valueOf() === startDate.valueOf()
                  (current && current > moment().endOf('day')) ||
                  (startDate &&
                    current &&
                    (current.valueOf() === startDate.valueOf() || current > moment().endOf('day')))
                }
              ></ThemeDatePickerRanger>
            </FormItem>
          </FormItemWrapper>
        </Col>
        <Col>
          <FormItemWrapper>
            <FormItem label="窗口" style={{ fontSize: 16 }}>
              <ThemeSelect
                value={window}
                onChange={val => setWindow(val)}
                placeholder="窗口"
                style={{ minWidth: 200 }}
              >
                {[1, 3, 5, 10, 22, 44, 66, 132].map(item => (
                  <Select.Option value={item} key={item}>
                    {item}
                  </Select.Option>
                ))}
              </ThemeSelect>
            </FormItem>
          </FormItemWrapper>
        </Col>
        <Col>
          <ThemeButton
            loading={meta && loading}
            onClick={() => {
              fetch(dates);
            }}
            type="primary"
          >
            绘制
          </ThemeButton>
        </Col>
      </Row>
      <ChartTitle>历史波动率时间序列</ChartTitle>
      <Row style={{ padding: 17 }} gutter={12}>
        {meta ? (
          <Chart
            animate
            forceFit
            height={400}
            padding={[40, 20, 60, 40]}
            width={800}
            data={meta.dv}
            scale={{
              time: {
                type: 'timeCat',
                tickCount: 5,
                alias: '日期',
                mask: 'YYYY/MM/DD',
                range: [0, 0.95],
                fontSize: 16,
              },
              value: {
                alias: '波动率(%)',
                formatter: param => formatNumber(param * 100, 0),
              },
            }}
            onGetG2Instance={g2Chart => {
              // g2Chart.animate(false);
              chartRef.current = g2Chart;
            }}
          >
            <Axis
              name="time"
              title={{
                offset: 0,
                position: 'end',
                textStyle: {
                  fontSize: '14',
                  fontWeight: '400',
                  opacity: '0.6',
                  fill: '#F6FAFF',
                  rotate: 0, // 文本旋转角度，以角度为单位，仅当 autoRotate 为 false 时生效
                },
              }}
              label={{
                textStyle: {
                  fontSize: '14',
                  fontWeight: '400',
                  opacity: '0.6',
                  fill: '#F6FAFF',
                },
              }}
              line={{
                stroke: '#00BAFF',
                lineWidth: 1,
                lineDash: [0],
                opacity: '0.1',
              }}
              tickLine={null}
            />
            <Axis
              name="value"
              line={null}
              label={{
                textStyle: {
                  fontSize: '14',
                  fontWeight: '400',
                  opacity: '0.6',
                  fill: '#F6FAFF',
                },
              }}
              title={{
                offset: -30,
                position: 'end',
                textStyle: {
                  fontSize: '14',
                  fontWeight: '400',
                  opacity: '0.6',
                  fill: '#F6FAFF',
                  rotate: 0, // 文本旋转角度，以角度为单位，仅当 autoRotate 为 false 时生效
                },
              }}
              grid={{
                type: 'line',
                lineStyle: {
                  stroke: '#00baff1a',
                  lineWidth: 1,
                  lineDash: [0],
                },
              }}
            />
            <Tooltip
              crosshairs={{
                type: 'y',
                style: {
                  stroke: '#00BAFF',
                },
              }}
            />
            <Geom
              type="area"
              position="time*value"
              color="l(100) 0:#FF0B194F 0.8:#0d2960 1:#0d2960"
              opacity={0.65}
              animate={{
                enter: {
                  animation: 'clipIn', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 450, // 动画执行时间
                  delay: 100,
                },
                appear: {
                  animation: 'clipIn', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 450, // 动画执行时间
                  delay: 100,
                },
                leave: {
                  animation: 'lineWidthOut', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 300, // 动画执行时间
                  delay: 100,
                },
                update: {
                  animation: 'fadeIn', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 450, // 动画执行时间
                  delay: 100,
                },
              }}
              tooltip={[
                'value*time',
                (value, time) => ({
                  time,
                  value: formatNumber(value * 100, 2),
                }),
              ]}
            />
            <Geom
              size={4}
              type="line"
              position="time*value"
              color={meta.gradualColorStr}
              opacity={0.85}
              animate={{
                enter: {
                  animation: 'clipIn', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 450, // 动画执行时间
                  delay: 100,
                },
                appear: {
                  animation: 'clipIn', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 450, // 动画执行时间
                  delay: 100,
                },
                leave: {
                  animation: 'lineWidthOut', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 300, // 动画执行时间
                  delay: 100,
                },
                update: {
                  animation: 'fadeIn', // 动画名称
                  easing: 'easeQuadIn', // 动画缓动效果
                  duration: 450, // 动画执行时间
                  delay: 100,
                },
              }}
              tooltip={[
                'value*time',
                (value, time) => ({
                  time,
                  value: formatNumber(value * 100, 2),
                }),
              ]}
            />
          </Chart>
        ) : (
          <PosCenter height={400}>
            <Loading loading={loading}></Loading>
          </PosCenter>
        )}
      </Row>
    </>
  );
};

export default memo(
  connect(state => ({
    instrumentId: state.centerUnderlying.instrumentId,
  }))(Rollong),
);
