import { queryVolatilityCalendars } from '@/services/volatility';
import { getToken } from '@/tools/authority';

export default {
  namespace: 'expirationDate',

  state: {
    volatilityCalendars: null,
  },

  effects: {
    *fetchData(_, { put, call, take }) {
      let token = getToken();

      if (!token) {
        // const { payload: currentUser = {} } = yield take('user/fetchData');
        // token = currentUser.token;
        return;
      }

      const rsp = yield call(queryVolatilityCalendars, token);
      const { error, data } = rsp;
      if (error) {
        return;
      }
      yield put({
        type: 'setVolatilityCalendars',
        payload: data,
      });
    },
  },

  reducers: {
    setVolatilityCalendars(state, { payload }) {
      return {
        ...state,
        volatilityCalendars: payload.map(item => item.calendarId),
      };
    },
  },

  subscriptions: {
    setup({ dispatch }) {
      dispatch({
        type: 'fetchData',
      });
    },
  },
};
