// https://umijs.org/config/
import os from 'os';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import setting from '../src/defaultSettings';

export default {
  // add for transfer to umi
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: {
          hmr: true,
          immer: true,
        },
        targets: {
          ie: 11,
        },
        locale: {
          antd: true,
          enable: true, // default false
          default: 'zh-CN', // default zh-CN
          // default true, when it is true, will use `navigator.language` overwrite default
          baseNavigator: false,
        },
        dynamicImport: {
          loadingComponent: '/containers/ProgressLine',
        },
        ...(!process.env.TEST && os.platform() === 'darwin'
          ? {
              // dll: {
              //   exclude: ['@babel/runtime'],
              // },
              // hardSource: true,
            }
          : {}),
      },
    ],
  ],
  targets: {
    ie: 11,
  },
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: setting.themeVars,
  externals: {
    moment: 'moment',
    jquery: '$',
    mockjs: 'Mock',
    'uuid/v4': 'uuidv4',
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = antdProPath
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  manifest: {
    name: '同余科技BCT管理后台',
    background_color: '#FFF',
    description: '好用，高效的金融衍生品管理方案',
    display: 'standalone',
    start_url: '/index.html',
    icons: [
      {
        src: '/favicon.png',
        sizes: '48x48',
        type: 'image/png',
      },
    ],
  },
  chainWebpack: webpackPlugin,
  // extraBabelPlugins: ['lodash'],
  history: 'browser',
};
