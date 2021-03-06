import React, { memo } from 'react';
import Body from './Body';
import Header from './Header';
import Panels from './Panels';

const InstrumentId = memo(props => (
  <div>
    <div style={{ marginBottom: 18 }}>
      <Header></Header>
    </div>
    <div style={{ marginBottom: 18 }}>
      <Panels></Panels>
    </div>
    <Body></Body>
  </div>
));

export default InstrumentId;
