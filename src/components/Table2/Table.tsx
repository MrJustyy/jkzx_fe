/* eslint-disable */
import { Table } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { hasElement } from '@/utils/hasElement';
import { createEventBus, EVERY_EVENT_TYPE, uuid } from '../../utils';
import { ITableApi, ITableCellProps, ITableContext, ITableProps, ITableRowProps } from '../type';
import TableManager from './api';
import SwitchCell from './cells/SwitchCell';
import {
  TABLE_CELL_EDITING_CHANGED,
  TABLE_CELL_FIELDS_CHANGE,
  TABLE_START_ACTIVE,
  TABLE_CELL_VALUES_CHANGE,
  TABLE_KEY_DOWN,
  TABLE_CELL_CLICK,
} from './constants/EVENT';
import FormRow from './rows/FormRow';
import HeaderCell from './cells/HeaderCell';

class Table2 extends PureComponent<ITableProps> {
  public static activeTableInstance: Table2 = null;

  public static defaultProps = {
    columns: [],
    rowKey: 'key',
    vertical: false,
    prefixCls: 'ant-table',
    size: 'default',
  };

  public static setActiveTableInstance: (instance: Table2) => void = table => {
    Table2.activeTableInstance = table;
  };

  public api: ITableApi;

  public context: ITableContext = {};

  public editings: {} = {};

  public domId: string;

  public $dom: HTMLElement;

  constructor(props) {
    super(props);
    const eventBus = createEventBus();
    eventBus.listen(EVERY_EVENT_TYPE, this.handleTableEvent);
    this.domId = uuid();

    this.api = {
      tableApi: this,
      eventBus,
      tableManager: new TableManager(),
    };

    this.context = this.getContext();
  }

  public getTbody = (): HTMLElement => this.$dom.querySelector('.ant-table-tbody');

  public getThead = (): HTMLElement => this.$dom.querySelector('.ant-table-thead');

  public componentDidMount = () => {
    Table2.setActiveTableInstance(this);

    this.$dom = document.getElementById(this.domId);

    window.addEventListener('keydown', this.onKeyDown);
    this.$dom.addEventListener('click', this.onTableClick);
  };

  public componentWillUnmount = () => {
    window.removeEventListener('keydown', this.onKeyDown);
    this.$dom.removeEventListener('click', this.onTableClick);
  };

  public onTableClick = (event: MouseEvent) => {
    if (
      event.target === this.getTbody() ||
      (event.target instanceof HTMLElement && hasElement(this.getThead(), event.target))
    ) {
      this.save();
    }
  };

  public onKeyDown = (event: Event) => {
    if (Table2.activeTableInstance !== this) return;
    this.api.eventBus.emit(TABLE_KEY_DOWN, event);
  };

  public getFieldNames = () => this.props.columns.map(item => item.dataIndex);

  public looseActive = () =>
    _.forEach(this.api.tableManager.cellNodes, (items, rowId) => {
      items.forEach(item => {
        item.node.looseActive();
      });
    });

  public validate = (
    options = {},
    rowIds?: string[],
    colIds = this.getFieldNames(),
  ): Promise<
    {
      errors: any;
      values: any;
    }[]
  > =>
    Promise.all(
      this.api.tableManager.rowNodes
        .filter(item => (rowIds == null ? true : !!rowIds.find(id => id === item.id)))
        .map(item => item.node.validate(options, colIds)),
    );

  public save = (rowIds?: string[], colIds?: string[]) =>
    _.forEach(this.api.tableManager.cellNodes, (items, rowId) => {
      if (rowIds && rowIds.indexOf(rowId) === -1) return;
      items.forEach(item => {
        if (colIds && colIds.indexOf(item.id) === -1) return;
        item.node.saveCell();
      });
    });

  public saveBy = (predicate: (rowId?: string, colId?: string) => boolean) =>
    _.forEach(this.api.tableManager.cellNodes, (items, rowId) => {
      items.forEach(item => {
        if (predicate && predicate(rowId, item.id)) {
          item.node.saveCell();
        }
      });
    });

  public getValues = () => {};

  public getContext = (): ITableContext => ({
    ...this.context,
  });

  public convertInputSize = tableSize => {
    if (tableSize === 'default') {
      return 'large';
    }

    if (tableSize === 'middle') {
      return 'default';
    }

    return 'small';
  };

  public defaultRenderItem = val => val;

  public getColumnDefs = () => {
    const { size, vertical } = this.props;
    const columns = this.props.columns.map(colDef => ({
      ...colDef,
      // colDef.render 会首先自己执行一次，因此将它挂在其他位置
      render: undefined,
      onCell: (record, rowIndex): ITableCellProps => {
        const getRowKey = () =>
          typeof this.props.rowKey === 'string'
            ? this.props.rowKey
            : this.props.rowKey(record, rowIndex);
        const rowId = record[getRowKey()];
        return {
          ...(colDef.onCell ? colDef.onCell(record, rowIndex, { colDef }) : undefined),
          $$render: colDef.render,
          record,
          rowIndex,
          colDef,
          tableApi: this,
          size: this.convertInputSize(size),
          api: this.api,
          context: this.context,
          getRowKey,
          rowId,
          vertical,
        };
      },
    }));

    return columns;
  };

  public getOnRow = () => (record, rowIndex): ITableRowProps => {
    const getRowKey = () =>
      typeof this.props.rowKey === 'string'
        ? this.props.rowKey
        : this.props.rowKey(record, rowIndex);
    const rowKey = getRowKey();
    const rowId = record[rowKey];
    return {
      ...(this.props.onRow ? this.props.onRow(record, rowIndex) : undefined),
      api: this.api,
      record,
      rowId,
      rowIndex,
      context: this.context,
      getRowKey,
      columns: this.props.columns,
      getContextMenu: this.props.getContextMenu,
    };
  };

  public handleTableEvent = (params, eventName) => {
    if (eventName === TABLE_CELL_EDITING_CHANGED) {
      return (
        this.props.onCellEditingChanged &&
        this.props.onCellEditingChanged({
          ...params,
          api: this.api,
        })
      );
    }
    if (eventName === TABLE_CELL_VALUES_CHANGE) {
      return (
        this.props.onCellValuesChange &&
        this.props.onCellValuesChange({
          ...params,
          api: this.api,
        })
      );
    }
    if (eventName === TABLE_CELL_FIELDS_CHANGE) {
      return (
        this.props.onCellFieldsChange &&
        this.props.onCellFieldsChange({
          ...params,
          api: this.api,
        })
      );
    }
    if (eventName === TABLE_START_ACTIVE) {
      Table2.setActiveTableInstance(this);
    }
  };

  public listen = (eventName: string, callback, scope) => {
    this.api.eventBus.listen(eventName, callback, scope);
  };

  public unlisten = (eventName: string, callback) => {
    this.api.eventBus.unListen(eventName, callback);
  };

  public getClassName = () => {
    const { prefixCls, className, vertical } = this.props;
    return classNames(className, {
      [`${prefixCls}-vertical`]: vertical,
      [`${prefixCls}-horizontal`]: !vertical,
    });
  };

  public render() {
    const components = {
      body: {
        row: FormRow,
        cell: SwitchCell,
      },
      header: {
        cell: HeaderCell,
      },
    };
    return (
      <div id={this.domId}>
        <Table
          {...this.props}
          className={this.getClassName()}
          components={components}
          columns={this.getColumnDefs()}
          onRow={this.getOnRow()}
        />
      </div>
    );
  }
}

export default Table2;
