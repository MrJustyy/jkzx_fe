import { Button, Card, Col, message, Modal, Row } from 'antd';
import _ from 'lodash';
import React, { memo, useRef, useState, useEffect } from 'react';
import { VERTICAL_GUTTER } from '@/constants/global';
import { Form2, SmartTable } from '@/containers';
import {
  clientAccountGetByLegalName,
  clientSaveAccountOpRecord,
  trdTradeIdListByCounterPartyName,
} from '@/services/reference-data-service';
import {
  COUNTER_PARTY_FORM_CONTROLS,
  LEGAL_FORM_CONTROLS,
  MIDDLE_FORM_CONTROLS,
  PARTY_FORM_CONTROLS,
  TABLE_COL_DEF,
} from './constants';

const ClientManagementInsert = memo<any>(props => {
  const formEl = useRef<Form2>(null);
  const formTrade = useRef<Form2>(null);
  const partyForm = useRef<Form2>(null);
  const counterPartyForm = useRef<Form2>(null);

  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [legalFormData, setLegalFormData] = useState({});
  const [tableDataSource, setTableDataSource] = useState([]);
  const [tradeFormData, setTradeFormData] = useState(Form2.createFields(getInitialTradeFormData()));
  const [partyFormData, setPartyFormData] = useState({});
  const [counterPartyFormData, setCounterPartyFormData] = useState({});
  const [tradeIds, setTradeIds] = useState([]);

  function getInitialTradeFormData() {
    return {};
  }

  const handleFundChange = (accountId, fundType, partyData, counterPartyData) => {
    let event;
    if (_.includes(fundType, 'CHANGE_PREMIUM')) {
      event = 'CHANGE_PREMIUM';
    } else if (_.includes(fundType, 'UNWIND_TRADE')) {
      event = 'UNWIND_TRADE';
    } else if (_.includes(fundType, 'SETTLE_TRADE')) {
      event = 'SETTLE_TRADE';
    } else {
      event = 'TRADE_CASH_FLOW';
    }

    return {
      accountOpRecord: {
        event,
        accountId,
        tradeId: Form2.getFieldsValue(tradeFormData).tradeId,
        legalName: Form2.getFieldsValue(legalFormData).legalName,
        ...Form2.getFieldsValue(partyData),
        ...Form2.getFieldsValue(counterPartyData),
      },
    };
  };

  const handlePageData2apiData = async () => {
    setConfirmLoading(true);
    const fundType = Form2.getFieldsValue(tradeFormData).event;
    const partyData = Form2.getFieldsValue(partyFormData);
    const counterPartyData = Form2.getFieldsValue(counterPartyFormData);
    const { error: _error, data: _data } = await clientAccountGetByLegalName({
      legalName: Form2.getFieldsValue(legalFormData).legalName,
    });

    setConfirmLoading(false);
    if (_error) return;

    const params = handleFundChange(_data.accountId, fundType, partyData, counterPartyData);
    const { error, data } = await clientSaveAccountOpRecord(params);

    if (error) {
      message.error('录入失败');
      return;
    }
    setVisible(false);
    message.success('录入成功');
    props.fetchTable();
  };

  const handleConfirm = async () => {
    const rsp = await Promise.all([
      formEl.current.validate(),
      formTrade.current.validate(),
      partyForm.current.validate(),
      counterPartyForm.current.validate(),
    ]);
    if (rsp.some(item => item.error)) return;
    handlePageData2apiData();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const switchModal = () => {
    setTableDataSource([
      {
        margin: '-',
        cash: '-',
        credit: '-',
        debt: '-',
        counterPartyCredit: '-',
        counterPartyFund: '-',
        counterPartyMargin: '-',
        use: '-',
      },
    ]);
    setLegalFormData(Form2.createFields({ normalStatus: '-' }));
    setCounterPartyFormData(
      Form2.createFields({
        counterPartyFundChange: 0,
        counterPartyCreditBalanceChange: 0,
        counterPartyMarginChange: 0,
      }),
    );
    setPartyFormData(
      Form2.createFields({
        cashChange: 0,
        creditBalanceChange: 0,
        debtChange: 0,
        premiumChange: 0,
        marginChange: 0,
      }),
    );
    setVisible(true);
  };

  const partyFormChange = (record, changedFields, allFields) => {
    setPartyFormData({
      ...partyFormData,
      ...changedFields,
    });
  };

  const counterPartyFormChange = (record, changedFields, allFields) => {
    setCounterPartyFormData({
      ...counterPartyFormData,
      ...changedFields,
    });
  };

  const tableFormChange = (record, changedFields, allFields) => {
    setTradeFormData({
      ...tradeFormData,
      ...changedFields,
    });
  };

  const legalFormChange = async (record, changedFields, allFields) => {
    setLegalFormData({
      ...legalFormData,
      ...changedFields,
    });
  };

  const legalFormValueChange = async (record, changedValues, allValues) => {
    if (changedValues.legalName) {
      setTradeIds([]);
    }
    const requests = () =>
      Promise.all([
        trdTradeIdListByCounterPartyName({
          counterPartyName: changedValues.legalName,
        }),
        clientAccountGetByLegalName({
          legalName: allValues.legalName,
        }),
      ]);
    const [{ error, data }, { error: _error, data: _data }] = await requests();
    if (error || _error) return;
    const tempTradeId = data.map(item => ({
      label: item,
      value: item,
    }));
    setTradeIds(tempTradeId);
    setTableDataSource([_data]);
    setLegalFormData(
      Form2.createFields({
        legalName: allValues.legalName,
        normalStatus: _data.normalStatus ? '正常' : '异常',
      }),
    );
  };

  useEffect(() => {
    if (visible === false) {
      setTradeFormData(Form2.createFields(getInitialTradeFormData()));
    }
  }, [visible]);

  useEffect(() => {
    setTradeFormData(Form2.createFields(getInitialTradeFormData()));
  }, [Form2.getFieldValue(legalFormData.legalName)]);

  return (
    <>
      <Modal
        title="台账资金录入"
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="录入"
        visible={!!visible}
        width={1000}
        confirmLoading={confirmLoading}
        destroyOnClose
      >
        <Form2
          ref={node => {
            formEl.current = node;
          }}
          columnNumberOneRow={3}
          footer={false}
          dataSource={legalFormData}
          columns={LEGAL_FORM_CONTROLS}
          onFieldsChange={legalFormChange}
          onValuesChange={legalFormValueChange}
        />
        <SmartTable
          rowKey="id"
          columns={TABLE_COL_DEF}
          dataSource={tableDataSource}
          pagination={false}
          style={{ marginBottom: VERTICAL_GUTTER }}
        />
        <Form2
          ref={node => {
            formTrade.current = node;
          }}
          footer={false}
          columnNumberOneRow={3}
          dataSource={tradeFormData}
          columns={MIDDLE_FORM_CONTROLS(tradeIds)}
          onFieldsChange={tableFormChange}
        />
        <Row type="flex" justify="space-around">
          <Col>
            <Card
              title="客户资金变化"
              style={{ width: '440px' }}
              headStyle={{ textAlign: 'center' }}
            >
              <Form2
                columns={PARTY_FORM_CONTROLS}
                ref={node => {
                  partyForm.current = node;
                }}
                footer={false}
                dataSource={partyFormData}
                onFieldsChange={partyFormChange}
              />
            </Card>
          </Col>
          <Col>
            <Card
              title="我方资金变化"
              style={{ width: '440px' }}
              headStyle={{ textAlign: 'center' }}
            >
              <Form2
                columns={COUNTER_PARTY_FORM_CONTROLS}
                ref={node => {
                  counterPartyForm.current = node;
                }}
                footer={false}
                dataSource={counterPartyFormData}
                onFieldsChange={counterPartyFormChange}
              />
            </Card>
          </Col>
        </Row>
      </Modal>
      <Button
        type="primary"
        onClick={switchModal}
        size="default"
        style={{ marginBottom: VERTICAL_GUTTER }}
      >
        资金录入
      </Button>
    </>
  );
});

export default ClientManagementInsert;
