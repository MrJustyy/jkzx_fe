import { VERTICAL_GUTTER } from '@/constants/global';
import CustomNoDataOverlay from '@/containers/CustomNoDataOverlay';
import DownloadExcelButton from '@/containers/DownloadExcelButton';
import { Form2, SmartTable } from '@/containers';
import Page from '@/containers/Page';
import { rptReportNameList } from '@/services/report-service';
import { getMoment } from '@/tools';
import { ConfigProvider, Divider, message, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import React, { memo, useEffect, useRef, useState } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';
import { PAGE_SIZE } from '@/constants/component';

const ReportCommonTable = memo<any>(props => {
  const form = useRef<Form2>(null);
  const {
    tableColDefs,
    searchFormControls,
    defaultSort,
    defaultDirection,
    reportType,
    searchMethod,
    downloadName,
    scrollWidth,
    bordered = false,
    colSwitch = [],
    antd,
  } = props;
  const [markets, setMarkets] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(true);
  const [searchFormData, setSearchFormData] = useState({});
  const [sortField, setSortField] = useState({ orderBy: defaultSort, order: defaultDirection });
  const [total, setTotal] = useState(null);
  const [isMount, setIsMount] = useState(false);
  const [data, setData] = useState([]);
  const [excelFormData, setExcelFormData] = useState({});

  const onPaginationChange = (current, pageSize) => {
    if (!pageSize) return;
    setIsMount(true);
    setPagination({
      current,
      pageSize,
    });
  };

  const onSearchFormChange = (param, fields, allFields) => {
    setSearchFormData(allFields);
  };

  const fetchTable = async (paramsSearchFormData?, paramsPagination?) => {
    const usedFormData = paramsSearchFormData || searchFormData;
    setExcelFormData(usedFormData);
    const formValidateRsp = await form.current.validate();
    if (formValidateRsp.error) {
      return;
    }
    setLoading(true);
    const { error, data } = await searchMethod({
      page: (paramsPagination || pagination).current - 1,
      pageSize: (paramsPagination || pagination).pageSize,
      ..._.mapValues(Form2.getFieldsValue(usedFormData), (values, key) => {
        if (key === 'valuationDate') {
          return getMoment(values).format('YYYY-MM-DD');
        }
        return values;
      }),
      ...sortField,
    });
    setLoading(false);
    if (error) {
      setDataSource([]);
      return;
    }
    if (!data.page.length) {
      message.warning('查询日期内暂无数据');
      setDataSource(data.page);
      setInfo(false);
      setTotal(data.totalCount);
      return;
    }
    setDataSource(data.page);
    setTotal(data.totalCount);
  };

  const onChange = (paramsPagination, filters, sorter) => {
    setIsMount(true);
    if (!sorter.columnKey) {
      const aPagination = {
        current: paramsPagination.current,
        pageSize: paramsPagination.pageSize,
        total: paramsPagination.total,
      };
      const bPagination = {
        ...pagination,
        total,
      };
      if (_.isEqual(aPagination, bPagination)) {
        return setSortField({
          orderBy: defaultSort,
          order: defaultDirection,
        });
      }
      return setSortField({
        orderBy: sortField.orderBy,
        order: sortField.order,
      });
    }
    setSortField({
      orderBy: sorter.columnKey,
      order: sorter.order === 'ascend' ? 'asc' : 'desc',
    });
  };

  const handleData = (dataSource, cols, headers) => {
    const data = [];
    data.push(headers);
    const length = data.length;
    dataSource.forEach((ds, index) => {
      const _data = [];
      Object.keys(ds).forEach(key => {
        const dsIndex = _.findIndex(cols, k => k === key);
        if (dsIndex >= 0) {
          _data[dsIndex] = ds[key];
        }
      });
      data.push(_data);
    });
    return data;
  };

  useLifecycles(async () => {
    setIsMount(true);
    const { error, data } = await rptReportNameList({
      reportType,
    });
    if (error) return;
    const _markets = data.map(item => ({
      label: item,
      value: item,
    }));

    setMarkets(_markets);
    const _searchFormData = {
      ...(_markets.length ? { reportName: Form2.createField(_markets[0].value) } : null),
      valuationDate: Form2.createField(moment().subtract(1, 'days')),
    };
    setSearchFormData(_searchFormData);
    fetchTable(_searchFormData);
  });

  useEffect(
    () => {
      if (!isMount) return;
      fetchTable();
    },
    [sortField, pagination]
  );

  useEffect(
    () => {
      setData(
        handleData(
          dataSource,
          tableColDefs.map(item => item.dataIndex),
          tableColDefs.map(item => item.title)
        )
      );
    },
    [dataSource]
  );

  return (
    <Page>
      <Form2
        ref={node => (form.current = node)}
        dataSource={searchFormData}
        columns={searchFormControls(markets)}
        layout="inline"
        style={{ marginBottom: VERTICAL_GUTTER }}
        submitText={'查询'}
        onFieldsChange={onSearchFormChange}
        onSubmitButtonClick={() => {
          setIsMount(false);
          setPagination({
            current: 1,
            pageSize: PAGE_SIZE,
          });
          fetchTable(searchFormData, { current: 1, pageSize: PAGE_SIZE });
        }}
        resetable={false}
      />
      <Divider />
      <DownloadExcelButton
        style={{ margin: '10px 0' }}
        key="export"
        type="primary"
        data={{
          searchMethod,
          argument: {
            searchFormData: excelFormData,
            sortField,
          },
          cols: tableColDefs,
          name: downloadName,
          colSwitch,
        }}
      >
        导出Excel
      </DownloadExcelButton>
      <ConfigProvider renderEmpty={!info && (() => <CustomNoDataOverlay />)}>
        <SmartTable
          antd={antd}
          rowKey="uuid"
          loading={loading}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            onShowSizeChange: onPaginationChange,
            showQuickJumper: true,
            onChange: onPaginationChange,
          }}
          columns={tableColDefs}
          onChange={onChange}
          scroll={{ x: scrollWidth }}
        />
      </ConfigProvider>
    </Page>
  );
});

export default ReportCommonTable;
