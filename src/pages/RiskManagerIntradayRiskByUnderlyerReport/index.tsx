/*eslint-disable */
import React, { memo } from 'react';
import { rptIntradayRiskReportSearchPaged } from '@/services/report-service';
import RiskCommonTable from '@/containers/RiskCommonTable';
import { TABLE_COL_DEFS } from './constants';
import { searchFormControls } from './services';
import { socketHOC } from '@/tools/socketHOC';

const Wrapper = socketHOC('RISK')(RiskCommonTable);

const RiskManagerIntradayRiskByUnderlyerReport = memo<any>(props => (
  <Wrapper
    id="real_time_risk_dag"
    tableColDefs={TABLE_COL_DEFS}
    searchFormControls={searchFormControls}
    defaultSort="bookName"
    defaultDirection="asc"
    searchMethod={rptIntradayRiskReportSearchPaged}
    downloadName="标的风险"
    scrollWidth={2300}
    getSheetDataSourceItemMeta={(val, dataIndex, rowIndex) => {
      if (val === null || val === undefined) {
        return null;
      }
      if (
        [
          'underlyerPrice',
          'underlyerNetPosition',
          'delta',
          'netDelta',
          'deltaCash',
          'deltaDecay',
          'deltaWithDecay',
          'gamma',
          'gammaCash',
          'rho',
          'theta',
          'vega',
        ].includes(dataIndex) &&
        rowIndex > 0
      ) {
        return {
          t: 'n',
          z: Math.abs(val) >= 1000 ? '0,0.0000' : '0.0000',
        };
      }
      if (dataIndex === 'underlyerPriceChangePercent' && rowIndex > 0) {
        return {
          t: 'n',
          z: '0.0000%',
        };
      }
    }}
  />
));

export default RiskManagerIntradayRiskByUnderlyerReport;
