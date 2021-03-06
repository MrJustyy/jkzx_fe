import { notification, message } from 'antd';
import _ from 'lodash';
import router from 'umi/router';
import JSSM4 from 'jssm4';
import { getPageQuery, delay } from '@/tools';
import {
  login,
  loginByToken,
  queryCaptcha,
  updateOwnPassword,
  authUserLogout,
} from '@/services/user';
import pageRouters from '../../config/router.config';
import { updatePermission } from '@/services/permission';
import { PERMISSIONS } from '@/constants/user';
import { sm4Key } from '@/constants/global';

const sm4 = new JSSM4(sm4Key);

function validateRedirect(routers, redirect, userPermissions, loginUrl, skipPermission) {
  let valid = false;
  if (!redirect || redirect === loginUrl) {
    return false;
  }
  function inner(_router) {
    const { name, path, routes } = _router;
    if (valid) {
      return;
    }
    if (path === redirect && (skipPermission ? true : userPermissions[name])) {
      valid = !(routes && routes.length > 0);
      return;
    }
    if (routes && routes.length > 0) {
      routes.forEach(r => inner(r));
    }
  }
  inner(routers);
  return valid;
}

export default {
  namespace: 'login',

  state: {
    loginFormData: {},
    img: null,
  },

  subscriptions: {
    setup({ dispatch, history }) {
      if (history.location.query.token) {
        router.push({
          pathname: '/jump-in',
          query: {
            ...history.location.query,
            routerName: history.location.pathname,
          },
        });
      }
    },
  },

  effects: {
    *login(
      {
        payload: {
          loginParams,
          skipMenu,
          defaultRedirect,
          loginUrl,
          rootRouteTag = 'appRoute',
          skipPermission = false,
          token,
          query = {},
        },
      },
      { call, put, select },
    ) {
      let response = {};
      if (token) {
        response = yield call(loginByToken, {
          token,
        });
      } else {
        response = yield call(login, {
          ...loginParams,
          username: sm4.encryptData_ECB(loginParams.username),
          password: sm4.encryptData_ECB(loginParams.password),
        });
      }
      const { data: userInfo, error, code } = response;

      if (error) {
        if (code !== 107) {
          notification.error({
            message: '登录失败',
            description: _.get(userInfo, 'error.message') || _.get(userInfo, 'message'),
          });
        }

        if (userInfo.expired) {
          // 首先设置一次用户信息，保存 token 内容到本地，因为修改密码接口需要 token
          yield put({
            type: 'user/saveUserData',
            payload: userInfo,
          });

          yield put({
            type: 'showUpdatePassword',
          });
        }

        yield put({
          type: 'queryCaptcha',
        });

        return;
      }

      const updatedPermissionUserInfo = yield call(updatePermission, {
        ...userInfo,
        permissions: PERMISSIONS,
      });

      yield put({
        type: 'user/replenishUserInfo',
        payload: {
          userInfo: updatedPermissionUserInfo,
          skipMenu,
        },
      });

      yield delay(1000);

      const urlParams = new URL(window.location.href);

      const params = getPageQuery();
      let { redirect } = params;
      if (redirect) {
        // CROS 判断
        const redirectUrlParams = new URL(redirect);
        if (redirectUrlParams.origin === urlParams.origin) {
          redirect = redirect.substr(urlParams.origin.length);
          if (redirect.match(/^\/.*#/)) {
            redirect = redirect.substr(redirect.indexOf('#') + 1);
          }
        } else {
          window.location.href = redirect;
          return;
        }
      }
      const appRoutes = pageRouters.find(item => !!item[rootRouteTag]);
      if (
        !validateRedirect(
          appRoutes,
          redirect,
          updatedPermissionUserInfo.permissions,
          loginUrl,
          skipPermission,
        )
      ) {
        redirect = defaultRedirect;
      }
      const { routerName, ...restParams } = query;
      router.push({
        pathname: redirect,
        query: restParams,
      });

      if (!token) {
        yield put({
          type: 'changeForm',
          payload: {},
        });
      }
    },

    *queryCaptcha(payload, { call, put }) {
      const response = yield call(queryCaptcha);

      yield put({
        type: 'setCaptcha',
        payload: {
          img: response,
        },
      });
    },

    *logout({ payload: { loginUrl, userId, routerPush } }, { call, put }) {
      if (!routerPush) {
        const rsp = yield call(authUserLogout, { userId });
        if (_.get(rsp, 'error') && !_.get(rsp.code === 107)) {
          message.info('退出登录失败');
          return;
        }

        yield put({
          type: 'user/cleanCurrentUser',
        });

        message.info('退出登录');
      }

      router.push({
        pathname: loginUrl,
        query: {
          redirect: window.location.href,
        },
      });

      // window.location.href = `/#/user/login?${stringify({
      //   redirect: window.location.href,
      // })}`;
    },
    // eslint-disable-next-line
    *updatePassword({ payload }, { call, put }) {
      const { data } = yield call(updateOwnPassword, {
        username: sm4.encryptData_ECB(payload.username),
        newPassword: sm4.encryptData_ECB(payload.newPassword),
        oldPassword: sm4.encryptData_ECB(payload.oldPassword),
      });
      if (!data || data.error) {
        return notification.error({
          message: `${data.error.message}`,
        });
      }
      notification.success({
        message: '更新成功',
      });
      yield put({
        type: 'queryCaptcha',
      });
      yield put({
        type: 'relogin',
      });
    },
  },

  reducers: {
    relogin(state) {
      return {
        ...state,
        showPasswordUpdate: false,
        loginFormData: {
          ...state.loginFormData,
          password: undefined,
          captcha: undefined,
        },
      };
    },

    changeForm(state, { payload }) {
      return {
        ...state,
        loginFormData: payload,
      };
    },

    loginFailed(state, { payload }) {
      return {
        ...state,
        loginError: payload,
      };
    },

    setCaptcha(state, { payload }) {
      return {
        ...state,
        img: payload.img,
        showImage: true,
      };
    },

    showUpdatePassword(state) {
      return {
        ...state,
        showPasswordUpdate: true,
      };
    },

    hideUpdatePassword(state) {
      return {
        ...state,
        showPasswordUpdate: false,
      };
    },

    setPathName(state, { payload }) {
      return {
        ...state,
        pathname: payload,
      };
    },
  },
};
