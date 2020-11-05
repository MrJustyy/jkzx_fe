import styled from 'styled-components';
import React, { memo } from 'react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';

const ThemeButtonWrap = styled.div`
  .ant-btn {
    border-radius: 3px;
    background: #1594d0;
    font-size: 16px;
  }
`;

const ThemeButton = memo<ButtonProps>(props => (
  <ThemeButtonWrap>
    <Button {...props}></Button>
  </ThemeButtonWrap>
));

export default ThemeButton;
