import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    Table,
    Input,
    Select,
    Space,
    Button,
    Typography,
    Spin,
    Tag,
    Popconfirm,
    DatePicker,
    Dropdown,
    Toast,
    Row,
    Col,
} from '@douyinfe/semi-ui';
import {
    IconSearch,
    IconDelete,
    IconEdit,
    IconCalendar,
    IconChevronDown,
    IconClose,
} from '@douyinfe/semi-icons';

const { Text } = Typography;

const timeFilterOptions = [
    { label: __('All Time', 'authguard'), value: 'any' },
    { label: __('Today', 'authguard'), value: 'today' },
    { label: __('Last 7 Days', 'authguard'), value: 'week' },
    { label: __('This Month', 'authguard'), value: 'month' },
];

export default function LogsTable({ onDataRefresh }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('any');
    const [dateRange, setDateRange] = useState([]);
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const handleEdit = (record) => {
        console.log('Edit:', record);
    };

    const handleDelete = async (id) => {
        try {
            await apiFetch({
                path: `/authguard/v1/logs/${id}`,
                method: 'DELETE',
            });
            Toast.success(__('Log deleted successfully', 'authguard'));
            fetchData();
            if (onDataRefresh) {
                onDataRefresh();
            }
        } catch (error) {
            console.error('Error deleting log:', error);
            Toast.error(__('Failed to delete log', 'authguard'));
        }
    };

    const handleBulkDelete = async () => {
        console.log('Bulk delete clicked, selected keys:', selectedRowKeys);
        if (selectedRowKeys.length === 0) {
            Toast.warning(__('Please select logs to delete', 'authguard'));
            return;
        }

        setDeleting(true);
        try {
            console.log('Sending bulk delete request for:', selectedRowKeys);
            await apiFetch({
                path: '/authguard/v1/logs/bulk-delete',
                method: 'DELETE',
                data: { ids: selectedRowKeys },
            });
            Toast.success(`${selectedRowKeys.length} ${__('logs deleted successfully', 'authguard')}`);
            setSelectedRowKeys([]);
            fetchData();
            if (onDataRefresh) {
                onDataRefresh();
            }
        } catch (error) {
            console.error('Error bulk deleting logs:', error);
            Toast.error(__('Failed to delete logs', 'authguard'));
        } finally {
            setDeleting(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: pageSize,
                search: search,
                filter,
                sort_field: sortField,
                sort_order: sortOrder,
            });

            if (dateRange && dateRange.length === 2) {
                const formatDate = (date) => {
                    const d = new Date(date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                const startDate = formatDate(dateRange[0]);
                const endDate = formatDate(dateRange[1]);
                console.log('Adding date range:', startDate, endDate);
                params.append('date_from', startDate);
                params.append('date_to', endDate);
            }

            const queryString = params.toString();
            console.log('Fetching logs with params:', queryString);

            const response = await apiFetch({
                path: `/authguard/v1/logs?${queryString}`,
            });
            setData(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [
        page,
        pageSize,
        search,
        filter,
        dateRange,
        sortField,
        sortOrder,
    ]);

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleFilterChange = (value) => {
        setFilter(value);
        setDateRange([]);
        setPage(1);
    };

    const handleDateRangeChange = (dates) => {
        console.log('Date range changed:', dates);
        setDateRange(dates || []);
        setFilter('any');
        setPage(1);
    };

    const handleClearDateRange = () => {
        setDateRange([]);
        setFilter('any');
        setPage(1);
        console.log('Date range cleared');
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'ID',
            key: 'ID',
            width: 80,
            sorter: true,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'User',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 150,
            sorter: true,
            render: (text, record) => (
                <div>
                <Text strong>{text || 'Unknown'}</Text>
                <br />
                <Text type="tertiary" size="small">
                    ID: {record.user_id}
                </Text>
                </div>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
            width: 140,
            sorter: true,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 140,
            render: (text) => <Tag color="success">{text}</Tag>,
            sorter: true,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            ellipsis: { showTitle: true },
            sorter: true,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            ellipsis: { showTitle: true },
            render: (text) => (
                <Text ellipsis={{ showTooltip: true }} style={{ width: 280 }}>
                {text}
                </Text>
            ),
        },
        {
            title: 'User Agent',
            dataIndex: 'user_agent',
            key: 'user_agent',
            width: 200,
            ellipsis: { showTitle: true },
            render: (text) => (
                <Text ellipsis={{ showTooltip: true }} type="tertiary" size="small">
                {text}
                </Text>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            sorter: true,
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                <Button
                    icon={<IconEdit />}
                    type="tertiary"
                    size="small"
                    onClick={() => handleEdit(record)}
                />
                <Popconfirm
                    title={__('Are you sure you want to delete this log?', 'authguard')}
                    onConfirm={() => handleDelete(record.ID)}
                    okText={__('Yes', 'authguard')}
                    cancelText={__('No', 'authguard')}
                >
                    <Button
                    icon={<IconDelete />}
                    type="danger"
                    theme="borderless"
                    size="small"
                    />
                </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            console.log('Row selection changed:', keys);
            setSelectedRowKeys(keys);
        },
        getCheckboxProps: (record) => ({
            name: record.id,
        }),
    };

    const handleTableChange = ({ pagination, sorter }) => {
        if (pagination) {
            setPage(pagination.currentPage);
            setPageSize(pagination.pageSize);
        }
        if (sorter) {
            setSortField(sorter.dataIndex);
            setSortOrder(sorter.sortOrder === 'ascend' ? 'ASC' : 'DESC');
        }
    };

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Space align="center">
                        <Text strong>{__('Time Filter:', 'authguard')}</Text>
                        <Select
                            value={filter}
                            onChange={handleFilterChange}
                            optionList={timeFilterOptions}
                            style={{ width: 150 }}
                        />
                        {selectedRowKeys.length > 0 && (
                            <>
                                <Text strong style={{ marginLeft: 16 }}>
                                    {__('Selected:', 'authguard')} {selectedRowKeys.length}
                                </Text>
                                <Popconfirm
                                    title={`${__('Are you sure you want to delete', 'authguard')} ${selectedRowKeys.length} ${__('selected log(s)?', 'authguard')}`}
                                    onConfirm={handleBulkDelete}
                                    okText={__('Yes, Delete', 'authguard')}
                                    cancelText={__('Cancel', 'authguard')}
                                >
                                    <Button
                                        type="primary"
                                        theme="solid"
                                        loading={deleting}
                                    >
                                        <Space>
                                            <IconDelete />
                                            <IconChevronDown />
                                        </Space>
                                    </Button>
                                </Popconfirm>
                            </>
                        )}
                    </Space>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Space align="center">
                        <Input
                            prefix={<IconSearch />}
                            placeholder={__('Search…', 'authguard')}
                            value={search}
                            onChange={handleSearchChange}
                            showClear
                            style={{ width: 250 }}
                        />
                        <Space align="center">
                            <DatePicker
                                type="dateRange"
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                placeholder={[__('Start Date', 'authguard'), __('End Date', 'authguard')]}
                                style={{ width: 280 }}
                            />
                            {dateRange && dateRange.length > 0 && (
                                <Button
                                    icon={<IconClose />}
                                    type="tertiary"
                                    size="small"
                                    onClick={handleClearDateRange}
                                >
                                    {__('Clear', 'authguard')}
                                </Button>
                            )}
                        </Space>
                    </Space>
                </Col>
            </Row>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="ID"
                    rowSelection={rowSelection}
                    // scroll={{ y: 'calc(100vh - 700px)' }}
                    scroll={{ y: 'calc(700px)' }}
                    pagination={{
                        currentPage: page,
                        pageSize,
                        total,
                        pageSizeOpts: [10, 20, 50, 100],
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                    bordered
                    size="small"
                />
            </Spin>
        </div>
    );
}
