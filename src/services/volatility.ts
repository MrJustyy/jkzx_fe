import { HOST_TEST } from '@/constants/global';
import request from '@/tools/request';
// 查询所有交易日历列表
export async function queryVolatilityCalendars(token) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refTradingCalendarsList',
      params: {},
    },
    token,
  });
}

// 查询到期日是否是交易日
export async function qlIsHoliday(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'qlIsHoliday',
      params,
    },
  });
}

// 查询波动率日历列表
export async function queryVolCalendarsList(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolCalendarsList',
      params,
    },
  });
}

// 查询某个波动率日历
export async function queryVolCalendar(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolCalendarGet',
      params,
    },
  });
}

// 设置周末权重
export async function setVolWeekendWeight(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolCalendarWeekendWeightUpdate',
      params,
    },
  });
}

// 添加波动率日历特殊日期
export async function addVolSpecialDates(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolSpecialDatesAdd',
      params,
    },
  });
}

// 更新波动率日历特殊日期
export async function updateVolSpecialDates(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolSpecialDatesUpdate',
      params,
    },
  });
}

// 删除波动率日历特殊日期
export async function deleteVolSpecialDates(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolSpecialDatesDelete',
      params,
    },
  });
}

// 编辑指定日期波动率日历
export async function updateVolSpecialDay(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refVolCalendarList',
      params,
    },
  });
}

export async function refTradeDateByOffsetGet(params = {}) {
  return request(`${HOST_TEST}reference-data-service/api/rpc`, {
    method: 'POST',
    body: {
      method: 'refTradeDateByOffsetGet',
      params,
      jsonrpc: '2.0',
      id: 1,
    },
  });
}
