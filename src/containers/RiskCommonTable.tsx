/* eslint-disable no-param-reassign */
import { ConfigProvider, Divider, message, Row, Table } from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef, useState, memo } from 'react';
import useLifecycles from 'react-use/lib/useLifecycles';
import { VERTICAL_GUTTER } from '@/constants/global';
import CustomNoDataOverlay from '@/containers/CustomNoDataOverlay';
import DownloadExcelButton from '@/containers/DownloadExcelButton';
import ReloadGreekButton from '@/containers/ReloadGreekButton';
import { Form2, SmartTable } from '@/containers';
import Page from '@/containers/Page';
import { PAGE_SIZE } from '@/constants/component';
import { getMoment } from '@/tools';
import { PRODUCTTYPE_ZHCH_MAP, DIRECTION_ZHCN_MAP, ASSET_TYPE_ZHCN_MAP } from '@/constants/common';

const RiskCommonTable = memo<any>(props => {
  const form = useRef<Form2>(null);
  const {
    id = 'real_time_valuation_dag',
    tableColDefs,
    searchFormControls,
    defaultSort,
    defaultDirection,
    searchMethod,
    downloadName,
    scrollWidth,
    getReload,
    hideReload = false,
    colSwitch = [],
    getSheetDataSourceItemMeta,
  } = props;
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
  const [searchForm, setSearchForm] = useState({});

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

  const fetchTable = async (
    paramsSearchFormData?,
    paramsPagination?,
    setFetchFromUserAction = false,
  ) => {
    const usedFormData = paramsSearchFormData || searchForm;
    setExcelFormData(usedFormData);

    if (searchFormControls) {
      const formValidateRsp = await form.current.validate();
      if (formValidateRsp.error) {
        return;
      }
    }
    setLoading(true);
    const { error, data: fetchData } = await searchMethod({
      page: (paramsPagination || pagination).current - 1,
      pageSize: (paramsPagination || pagination).pageSize,
      ..._.mapValues(Form2.getFieldsValue(usedFormData)),
      ...sortField,
    });
    setLoading(false);
    if (error) return;
    if (setFetchFromUserAction) {
      setSearchForm(searchFormData);
    }
    if (paramsPagination) {
      setPagination(paramsPagination);
    }
    if (!fetchData.page.length) {
      message.warning('当日暂无数据');
      setDataSource(fetchData.page);
      setInfo(false);
      setTotal(fetchData.totalCount);
      return;
    }
    setDataSource(fetchData.page);
    setTotal(fetchData.totalCount);
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
    return setSortField({
      orderBy: sorter.columnKey,
      order: sorter.order === 'ascend' ? 'asc' : 'desc',
    });
  };

  const handleData = (inlineDataSource, cols, headers) => {
    const tempData = [];
    tempData.push(headers);
    const { length } = tempData;
    inlineDataSource.forEach((ds, index) => {
      const newData = [];
      Object.keys(ds).forEach(key => {
        const dsIndex = _.findIndex(cols, k => k === key);
        if (dsIndex >= 0) {
          newData[dsIndex] = ds[key];
        }
      });
      tempData.push(newData);
    });
    return tempData;
  };

  useLifecycles(async () => {
    setIsMount(true);
    fetchTable();
    if (getReload) {
      getReload(fetchTable);
    }
  });

  useEffect(() => {
    if (!isMount) return;
    fetchTable();
  }, [sortField, pagination]);

  useEffect(() => {
    setData(
      handleData(
        dataSource,
        tableColDefs.map(item => item.dataIndex),
        tableColDefs.map(item => item.title),
      ),
    );
  }, [dataSource]);

  const handleDataSource = val =>
    val.map(item => {
      if (_.has(item, ['productType'])) {
        item.productType = PRODUCTTYPE_ZHCH_MAP[item.productType];
      }
      return {
        ...item,
        createdAt: getMoment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      };
    });

  return (
    <Page>
      {searchFormControls && (
        <>
          <Form2
            ref={node => {
              form.current = node;
            }}
            dataSource={searchFormData}
            columns={searchFormControls()}
            layout="inline"
            style={{ marginBottom: VERTICAL_GUTTER }}
            submitText="查询"
            onFieldsChange={onSearchFormChange}
            onSubmitButtonClick={() => {
              setIsMount(false);
              setPagination({
                current: 1,
                pageSize: PAGE_SIZE,
              });
              fetchTable(searchFormData, { current: 1, pageSize: PAGE_SIZE }, true);
            }}
            resetable={false}
          />
          <Divider />
        </>
      )}

      <Row type="flex" justify="space-between" style={{ marginBottom: VERTICAL_GUTTER }}>
        <DownloadExcelButton
          key="export"
          type="primary"
          data={{
            cols: tableColDefs,
            name: downloadName,
            searchMethod,
            argument: {
              searchFormData: excelFormData,
              sortField,
            },
            colSwitch,
            handleDataSource,
            getSheetDataSourceItemMeta,
          }}
        >
          导出Excel
        </DownloadExcelButton>
        <ReloadGreekButton fetchTable={fetchTable} id={id} hideReload={hideReload} />
      </Row>
      <ConfigProvider renderEmpty={!info && (() => <CustomNoDataOverlay />)}>
        <SmartTable
          rowKey={(record, index) => index}
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

export default RiskCommonTable;
