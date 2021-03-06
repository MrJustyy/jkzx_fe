import { Col, Form as AntdForm, Row } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import classNames from 'classnames';
import _, { chunk, omit } from 'lodash';
import React, { PureComponent } from 'react';
import { EVERY_EVENT_TYPE } from '../../utils';
import { IFormBaseProps, IFormColDef } from '../type';
import SwitchCell from './cells/SwitchCell';
import { FORM_CELL_EDITING_CHANGED } from './constants';
import DefaultFooter from './DefaultFooter';
import FormManager from './formManager';

class FormBase extends PureComponent<IFormBaseProps & FormComponentProps, any> {
  public static defaultProps = {
    submitText: '提 交',
    resetText: '重 置',
    columnNumberOneRow: 1,
    layout: 'horizontal',
    submitable: true,
    resetable: true,
    dataSource: {},
  };

  public formManager: FormManager = new FormManager();

  public maxRowControlNumber: number = 0;

  public eventBus;

  constructor(props) {
    super(props);
    this.eventBus = props.eventBus;
    this.eventBus.listen(EVERY_EVENT_TYPE, this.handleTableEvent);
  }

  public handleTableEvent = (params, eventName) => {
    if (eventName === FORM_CELL_EDITING_CHANGED) {
      return this.props.onEditingChanged && this.props.onEditingChanged(params);
    }
  };

  public validate = async (
    options: any = {},
    fieldNames = this.props.columns.map(item => item.dataIndex)
  ) => {
    const { silence, scroll, ...rest } = options;
    return new Promise<{ error: boolean; values: any }>((resolve, reject) => {
      this.props.form[scroll ? 'validateFieldsAndScroll' : 'validateFields'](
        fieldNames,
        rest,
        (error, values) => {
          resolve({ error, values });
        }
      );
    });
  };

  public getRules = (rules, label) => {
    if (rules && Array.isArray(rules)) {
      return rules.map(item => {
        if (item.required && label) {
          return {
            message: `${label}为必填项目`,
            ...item,
          };
        }
        return item;
      });
    }
    return rules;
  };

  public save = (colIds?: string[]) => {
    return _.forEach(this.formManager.cellNodes, item => {
      if (colIds && colIds.indexOf(item.id) === -1) return;
      item.node.saveCell();
    });
  };

  public getControlElement = (colDef: IFormColDef = {}, key?) => {
    const { form, dataSource } = this.props;
    return <SwitchCell key={key} colDef={colDef} form={form} record={dataSource} api={this} />;
  };

  public onSubmit = domEvent => {
    this.props.form.validateFieldsAndScroll((error, values) => {
      if (error) return;
      if (!this.props.onSubmitButtonClick) return;
      return this.props.onSubmitButtonClick({
        dataSource: this.getFormData(),
        domEvent,
      });
    });
  };

  public getColumnDefs = () => {
    return this.props.columns || [];
  };

  public onReset = domEvent => {
    if (!this.props.onResetButtonClick) {
      return this.props.form.resetFields();
    }
    return this.props.onResetButtonClick({
      dataSource: this.getFormData(),
      domEvent,
    });
  };

  public getFormData = () => {
    return this.props.dataSource || this.props.form.getFieldsValue();
  };

  public getFooter = () => {
    const {
      footer,
      submitLoading,
      submitText,
      submitable,
      resetable,
      resetLoading,
      resetText,
      submitButtonProps,
      resetButtonProps,
    } = this.props;

    if (typeof footer === 'boolean' || React.isValidElement(footer)) {
      return footer && <AntdForm.Item>{footer}</AntdForm.Item>;
    }

    return (
      <AntdForm.Item {...this.getButtonItemLayout()}>
        <DefaultFooter
          {...{
            submitable,
            submitLoading,
            submitText,
            resetable,
            resetLoading,
            resetText,
            onSubmitButtonClick: this.onSubmit,
            onResetButtonClick: this.onReset,
            submitButtonProps,
            resetButtonProps,
          }}
        />
      </AntdForm.Item>
    );
  };

  public getRowContainer = () => {
    const { columnNumberOneRow: columnNumberOneRow, columns } = this.props;
    return chunk(columns, columnNumberOneRow);
  };

  public getFormItemLayout = () => {
    const formItemLayout =
      this.props.layout === 'horizontal'
        ? {
            labelCol: this.props.labelCol || { span: 8 },
            wrapperCol: this.props.wrapperCol || { span: 16 },
          }
        : null;
    return formItemLayout;
  };

  public getButtonItemLayout = () => {
    const formItemLayout = this.getFormItemLayout();

    const buttonItemLayout =
      this.props.layout === 'horizontal'
        ? {
            wrapperCol: {
              span: formItemLayout.wrapperCol.span,
              offset: formItemLayout.labelCol.span,
            },
            ...this.props.actionFieldProps,
          }
        : this.props.actionFieldProps;

    return buttonItemLayout;
  };

  public componentDidMount = () => {
    window.addEventListener('click', this.onWindowClick, false);
  };

  public componentWillUnmount = () => {
    window.removeEventListener('click', this.onWindowClick, false);
  };

  public onWindowClick = (event: Event) => {
    this.save();
  };

  public render() {
    const {
      rowProps,
      colProps,
      columns,
      layout,
      className,
      columnNumberOneRow: columnNumberOneRow,
    } = this.props;
    const rowContainers = this.getRowContainer();

    this.maxRowControlNumber = columnNumberOneRow;

    return (
      <AntdForm
        {...omit(this.props, [
          'form',
          'actionFieldProps',
          'submitable',
          'resetable',
          'submitText',
          'columnNumberOneRow',
          'dataSource',
          'columns',
          'footer',
          'submitLoading',
          'saveText',
          'resetLoading',
          'resetText',
          'rowProps',
          'colProps',
          'wrappedComponentRef',
          'onSubmitButtonClick',
          'onResetButtonClick',
          'submitButtonProps',
          'resetButtonProps',
          'getValue',
          'eventBus',
          'onEditingChanged',
          'onValuesChange',
        ])}
        className={classNames(`tongyu-form2`, className)}
        layout={layout}
      >
        {layout === 'inline'
          ? columns.map((item, index) => this.getControlElement(item, index))
          : rowContainers.map((cols, key) => {
              this.maxRowControlNumber =
                cols.length > this.maxRowControlNumber ? cols.length : this.maxRowControlNumber;

              const _rowProps = rowProps ? rowProps({ index: key }) : undefined;
              return (
                <Row
                  gutter={16 + 8 * 2}
                  key={key}
                  className={classNames(
                    'tongyu-row',
                    'tongyu-form-row',
                    _rowProps && _rowProps.className
                  )}
                  {..._rowProps}
                >
                  {cols.map((item, index) => {
                    const { dataIndex } = item;
                    return (
                      <Col
                        span={24 / this.maxRowControlNumber}
                        key={dataIndex}
                        {...(colProps ? colProps({ rowIndex: key, index }) : undefined)}
                      >
                        {this.getControlElement(item)}
                      </Col>
                    );
                  })}
                </Row>
              );
            })}
        {layout === 'inline' ? (
          this.getFooter()
        ) : (
          <Row>
            <Col span={24 / this.maxRowControlNumber}>{this.getFooter()}</Col>
          </Row>
        )}
      </AntdForm>
    );
  }
}

export default FormBase;
