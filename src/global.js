// import { Modal, message } from 'antd';
// import { formatMessage } from 'umi/locale';
import { setAutoFreeze } from 'immer';
import 'animate.css';
import numeral from 'numeral';
import BigNumber from 'bignumber.js';

setAutoFreeze(false);

numeral.register('format', 'de', {
  regexps: {
    format: /(de)/,
    unformat: /(de)/,
  },
  format: (value, format, roundingFunction) => {
    // const space = numeral._.includes(format, ' de') ? ' ' : '';

    format = format.replace(/\s?de/, '');

    if (String(value).indexOf('e') !== -1) {
      const val = parseFloat(new BigNumber(value).decimalPlaces(4).toString(10));
      const isnan = Number.isNaN(val);
      if (isnan) {
        console.error('de: parse value error: val is not Number.');
      }
      value = isnan ? 0 : val;
    }

    console.log(`${numeral._.numberToFormat(value, format, roundingFunction)}`);

    return `${numeral._.numberToFormat(value, format, roundingFunction)}`;
  },
  unformat: str => {
    return numeral._.stringToNumber(str);
  },
});

numeral.register('format', 'pe', {
  regexps: {
    format: /(pe)/,
    unformat: /(pe)/,
  },
  format: (value, format, roundingFunction) => {
    const space = numeral._.includes(format, ' pe') ? ' ' : '';

    format = format.replace(/\s?pe/, '');

    if (String(value).indexOf('e') !== -1) {
      const val = parseFloat(new BigNumber(value).decimalPlaces(4).toString(10));
      const isnan = Number.isNaN(val);
      if (isnan) {
        console.error('pe: parse value error: val is not Number.');
      }
      value = isnan ? 0 : val;
    }

    return `${numeral._.numberToFormat(value, format, roundingFunction)}${space} %`;
  },
  unformat: str => {
    return numeral._.stringToNumber(str);
  },
});

numeral.register('format', 'pde', {
  regexps: {
    format: /(pde)/,
    unformat: /(pde)/,
  },
  format: (value, format, roundingFunction) => {
    const space = numeral._.includes(format, ' pde') ? ' ' : '';

    format = format.replace(/\s?%e/, '');

    if (String(value).indexOf('e') !== -1) {
      const val = parseFloat(new BigNumber(value).decimalPlaces(4).toString(10));
      const isnan = Number.isNaN(val);
      if (isnan) {
        console.error('pde: parse value error: val is not Number.');
      }
      value = isnan ? 0 : val;
    }

    value = new BigNumber(value).multipliedBy(100).toNumber();

    return `${numeral._.numberToFormat(value, format, roundingFunction)}${space} %`;
  },
  unformat: str => {
    return new BigNumber(numeral._.stringToNumber(str)).div(100).toNumber();
  },
});

numeral.register('format', '¥', {
  regexps: {
    format: /(¥)/,
    unformat: /(¥)/,
  },
  format: (value, format, roundingFunction) => {
    const space = numeral._.includes(format, ' ¥') ? ' ' : '';

    format = format.replace(/\s?¥/, '');

    if (String(value).indexOf('e') !== -1) {
      const val = parseFloat(new BigNumber(value).decimalPlaces(4).toString(10));
      const isnan = Number.isNaN(val);
      if (isnan) {
        console.error('parse value error: val is not Number.');
      }
      value = isnan ? 0 : val;
    }

    return `${numeral._.numberToFormat(value, format, roundingFunction)}${space} ¥`;
  },
  unformat: str => {
    return numeral._.stringToNumber(str);
  },
});

numeral.register('format', 'days', {
  regexps: {
    format: /(days)/,
    unformat: /(days)/,
  },
  format: (value, format, roundingFunction) => {
    const space = numeral._.includes(format, ' days') ? ' ' : '';

    format = format.replace(/\s?days/, '');

    return `${numeral._.numberToFormat(value, format, roundingFunction)}${space}天`;
  },
  unformat: str => {
    return numeral._.stringToNumber(str);
  },
});

numeral.register('format', 'ss', {
  regexps: {
    format: /(ss)/,
    unformat: /(ss)/,
  },
  format: (value, format, roundingFunction) => {
    const space = numeral._.includes(format, ' ss') ? ' ' : '';

    format = format.replace(/\s?ss/, '');

    return `${numeral._.numberToFormat(value, format, roundingFunction)}${space}手`;
  },
  unformat: str => {
    return numeral._.stringToNumber(str);
  },
});

if (window) {
  window.$version = '0.0.1';
}

// // Notify user if offline now
// window.addEventListener('sw.offline', () => {
//   message.warning(formatMessage({ id: 'app.pwa.offline' }));
// });

// // Pop up a prompt on the page asking the user if they want to use the latest version
// window.addEventListener('sw.updated', e => {
//   Modal.confirm({
//     title: formatMessage({ id: 'app.pwa.serviceworker.updated' }),
//     content: formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
//     okText: formatMessage({ id: 'app.pwa.serviceworker.updated.ok' }),
//     onOk: async () => {
//       // Check if there is sw whose state is waiting in ServiceWorkerRegistration
//       // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
//       const worker = e.detail && e.detail.waiting;
//       if (!worker) {
//         return Promise.resolve();
//       }
//       // Send skip-waiting event to waiting SW with MessageChannel
//       await new Promise((resolve, reject) => {
//         const channel = new MessageChannel();
//         channel.port1.onmessage = event => {
//           if (event.data.error) {
//             reject(event.data.error);
//           } else {
//             resolve(event.data);
//           }
//         };
//         worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
//       });
//       // Refresh current page to use the updated HTML and other assets after SW has skiped waiting
//       window.location.reload(true);
//       return true;
//     },
//   });
// });
