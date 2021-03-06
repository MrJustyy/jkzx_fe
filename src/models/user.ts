import _ from 'lodash';
import router from 'umi/router';
import { PERMISSIONS } from '@/constants/user';
import { updatePermission } from '@/services/permission';
import { getUser, setUser } from '@/tools/authority';
import { mockUserInfo } from '@/fixtures/mock-user';

export default {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    // 从本地项目获取 userInfo 数据
    *replenish({ payload: { loginUrl, skipMenu } }, { put, call }) {
      // const userInfo = getUser();
      // if (_.isEmpty(userInfo)) {
      //   // router.push('/user/login');
      //   router.push(loginUrl);
      //   return;
      // }

      const userInfo = mockUserInfo;

      // 调用接口更新权限
      // const updatedPermissionUserInfo = yield call(updatePermission, {
      //   ...userInfo,
      //   permissions: PERMISSIONS,
      // });

      yield put({
        type: 'replenishUserInfo',
        payload: { skipMenu, userInfo },
      });

      // eslint-disable-next-line no-underscore-dangle
      if (window._hmt && userInfo.username) {
        // eslint-disable-next-line no-underscore-dangle
        window._hmt.push(['_setUserTag', '7350', userInfo.username]);
      }
    },

    *replenishUserInfo({ payload: { userInfo = {}, skipMenu = false } }, { put }) {
      yield put({
        type: 'saveUserData',
        payload: userInfo,
      });
      if (skipMenu) return;
      yield put({
        type: 'menu/initMenu',
        payload: userInfo,
      });
      yield put({
        type: 'menu/initCenterMenu',
        payload: userInfo,
      });
    },

    *cleanCurrentUser($, { put }) {
      yield put({
        type: 'saveUserData',
        payload: {},
      });
    },
  },

  reducers: {
    saveUserData(state, action) {
      setUser(action.payload);

      return {
        ...state,
        currentUser: action.payload,
      };
    },

    setRoles(state, action) {
      const currentUser = {
        ...state.userInfo,
        roles: action.payload || [],
      };

      setUser(currentUser);

      return {
        ...state,
        currentUser,
      };
    },
  },
};
