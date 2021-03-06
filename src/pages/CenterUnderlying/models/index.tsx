import moment from 'moment';
import { STRIKE_TYPE_ENUM } from '@/constants/global';
import { mktInstrumentSearch } from '@/services/market-data-service';
import _ from 'lodash';

export default {
  namespace: 'centerUnderlying',
  state: {
    data: {},
    instrumentId: '',
    activeKey: '0',
    strikeType: STRIKE_TYPE_ENUM.STRIKE_PERCENTAGE,
    fetchStrikeType: STRIKE_TYPE_ENUM.STRIKE_PERCENTAGE,
    volReport: [],
    instrumentIds: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname === '/center/underlying') {
          dispatch({
            type: 'queryInstrumentId',
            payload: {
              instrumentIdPart: '',
              excludeOption: true,
            },
          });
        }
      });
    },
  },

  effects: {
    *queryInstrumentId({ payload }, { call, put }) {
      const rsp = yield call(mktInstrumentSearch, payload);
      if (rsp.error) return;
      yield put({
        type: 'setState',
        payload: {
          instrumentIds: rsp.data.slice(0, 10),
          instrumentId: _.get(rsp.data.sort(), '[0]'),
        },
      });
    },
  },
  reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...(typeof payload === 'function' ? payload(state.tableData) : payload),
      };
    },
  },
};
