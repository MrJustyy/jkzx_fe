/* eslint-disable consistent-return */
import { Button, Drawer, notification, Popconfirm, Row, Spin } from 'antd';
import _ from 'lodash';
import React, { PureComponent } from 'react';
import Page from '@/containers/Page';
import {
  wkApproveGroupList,
  wkApproveGroupModify,
  wkApproveGroupUserListModify,
} from '@/services/auditing';
import { queryAuthDepartmentList } from '@/services/department';
import AuditGourpLists from './AuditGourpLists';
import styles from './AuditGourpLists.less';
import DrawerContarner from './DrawerContarner';
import { SmartTable } from '@/containers';

class SystemSettingsRoleManagement extends PureComponent {
  public $drawer: DrawerContarner = null;

  public constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '用户名',
          dataIndex: 'username',
          key: 'username',
        },
        {
          title: '昵称',
          dataIndex: 'nickName',
          key: 'nickName',
        },
        {
          title: '部门',
          dataIndex: 'departmentName',
          key: 'departmentName',
        },
        {
          title: '操作',
          key: 'operation',
          dataIndex: 'operation',
          render: (text, record) =>
            this.state.userList.length >= 1 ? (
              <Popconfirm
                title="确认移出?"
                onConfirm={() => this.handleDelete(record.userApproveGroupId)}
              >
                <a style={{ color: 'red' }}>移出</a>
              </Popconfirm>
            ) : null,
        },
      ],
      userList: null,
      loading: false,
      visible: false,
      approveGroupList: [],
      currentGroup: null,
      department: [],
    };
  }

  public componentDidMount = () => {
    this.fetchList();
    this.getDepartments();
  };

  public handleDelete = async key => {
    const { currentGroup, userList } = this.state;
    let userListData = [...userList];
    userListData = userListData.filter(item => item.userApproveGroupId !== key);

    currentGroup.userList = userListData;
    const { data, error } = await wkApproveGroupUserListModify({
      approveGroupId: currentGroup.approveGroupId,
      approveGroupName: currentGroup.approveGroupName,
      userList: userListData.map(item => item.username),
    });
    const { message } = error;
    if (error) {
      return;
    }
    notification.success({
      message: '移出成功',
      description: message,
    });
    if (this.$drawer) {
      this.$drawer.fetchTable();
    }

    this.setState({
      visible: false,
    });

    this.setState({ userList: userListData });
  };

  public toArray = data =>
    data.concat(
      data.map(item => {
        if (item.children) {
          return this.toArray(item.children);
        }
        return item.children;
      }),
    );

  public fetchList = async () => {
    this.setState({
      loading: true,
    });

    const { data, error } = await wkApproveGroupList();
    if (error) return;

    let approveGroupList = [];
    approveGroupList = _.sortBy(data, ['approveGroupName']);

    // const cloneDepartments = JSON.parse(JSON.stringify(department.data || {}));
    // const array = this.toArray(cloneDepartments);
    if (this.$gourpLists) {
      this.$gourpLists.handleMenber(data[0]);
    }

    this.setState({
      approveGroupList,
      loading: false,
      // department: array,
    });
  };

  public handleDrawer = () => {
    if (this.$drawer) {
      this.$drawer.fetchTable();
    }
    this.setState({
      visible: true,
    });
  };

  public onClose = () => {
    this.setState({
      visible: false,
    });
  };

  public onEdit = async param => {
    this.setState({
      userList: param.userList,
    });
  };

  public getDepartments = async () => {
    const departmentsRes = await queryAuthDepartmentList({});
    const department = departmentsRes.data || {};
    const array = _.flattenDeep(this.toArray([department])).filter(item => !!item);
    this.setState({
      department: array,
    });
  };

  public handleMenber = async param => {
    this.getDepartments();
    if (!param) return;
    this.setState({
      userList: param.userList,
      currentGroup: param,
    });
  };

  public onBatchAdd = async (param, batchBool) => {
    const { currentGroup } = this.state;
    const newData = _.intersection(
      param.map(p => p.username),
      (this.state.currentGroup.userList || []).map(p => p.username),
    );
    if (newData.length > 0) {
      return notification.success({
        message: '该用户已在审批组中',
      });
    }
    // currentGroup.userList = (currentGroup.userList || []).concat(param);
    const userList = _.concat(currentGroup.userList, param).map(item => ({
      userApproveGroupId: item.userApproveGroupId,
      username: item.username,
      departmentId: item.departmentId,
      nickName: item.nickName,
    }));
    const { data, error } = await wkApproveGroupUserListModify({
      approveGroupId: currentGroup.approveGroupId,
      approveGroupName: currentGroup.approveGroupName,
      userList: userList.map(item => item.username),
    });
    if (error) {
      return;
    }
    notification.success({
      message: batchBool
        ? `${param.length}个用户成功加入审批组,${userList.length}个用户已在审批组中`
        : '成功加入审批组',
    });

    currentGroup.userList =
      data[_.findIndex(data, item => item.approveGroupId === currentGroup.approveGroupId)].userList;
    const approveGroupList = _.sortBy(data, ['approveGroupName']);
    this.setState(
      {
        approveGroupList,
        currentGroup,
        userList: currentGroup.userList,
      },
      () => {
        if (this.$drawer) {
          this.$drawer.filterData((currentGroup.userList || []).map(item => item.username));
        }
      },
    );
  };

  public handleGroupList = approveGroupList => {
    if (approveGroupList) {
      this.setState({
        approveGroupList,
      });
    }
  };

  public render() {
    let { userList } = this.state;
    const { department } = this.state;
    userList = (userList || []).sort((a, b) => a.username.localeCompare(b.username));
    userList = userList.map(param => {
      const dp = department.find(obj => obj.id === param.departmentId) || {};
      return {
        ...param,
        departmentName: dp.departmentName,
      };
    });
    return (
      <Spin size="large" spinning={this.state.loading}>
        <div className={styles.auditingWrapper}>
          <Page>
            <div style={{ width: '400px', background: '#FFF', padding: '30px' }}>
              <p>审批组列表</p>
              <AuditGourpLists
                ref={node => {
                  this.$gourpLists = node;
                }}
                approveGroupList={this.state.approveGroupList}
                handleEdit={param => this.onEdit(param)}
                handleMenber={this.handleMenber}
                handleGroupList={this.handleGroupList}
              />
            </div>
            <div
              style={{
                marginLeft: '20px',
                background: '#FFF',
                padding: '30px',
                width: '100%',
                position: 'relative',
              }}
            >
              <Row style={{ marginBottom: '10px', textAlign: 'right', maxHeight: '28px' }}>
                <span style={{ float: 'left' }}>审批组成员</span>
                {this.state.userList ? (
                  <Button size="default" type="primary" onClick={this.handleDrawer}>
                    增加成员
                  </Button>
                ) : null}
              </Row>
              {this.state.userList ? (
                <SmartTable
                  className={styles.menberTable}
                  columns={this.state.columns}
                  dataSource={userList}
                  rowKey={data => data.userApproveGroupId}
                />
              ) : (
                <span className={styles.center}>请先选中一个审批组</span>
              )}
            </div>
            <Drawer
              placement="right"
              onClose={this.onClose}
              visible={this.state.visible}
              width={600}
              title={
                <Row type="flex" justify="start" gutter={24}>
                  <p>增加成员</p>
                </Row>
              }
            >
              <DrawerContarner
                ref={node => {
                  this.$drawer = node;
                }}
                onBatchAdd={(param, bool) => this.onBatchAdd(param, bool)}
                currentGroup={this.state.currentGroup}
              />
            </Drawer>
          </Page>
        </div>
      </Spin>
    );
  }
}

export default SystemSettingsRoleManagement;
