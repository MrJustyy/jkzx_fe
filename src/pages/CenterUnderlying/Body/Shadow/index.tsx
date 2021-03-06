import { Col, Row } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import styles from './index.less';
import Vol3d from './Vol3d';
import DoubleLine from './DoubleLine';
import { getInstrumentVolSurface } from '@/services/terminal';

const Shadow = memo(props => (
  <Row type="flex" justify="space-between" className={styles.wrap}>
    <Col span={12}>
      <Vol3d></Vol3d>
    </Col>
    <Col span={12}>
      <DoubleLine></DoubleLine>
    </Col>
  </Row>
));

export default Shadow;
