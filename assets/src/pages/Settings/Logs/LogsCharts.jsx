import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    Card,
    Row,
    Col,
    Spin,
    Typography,
    Divider,
} from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { registerTheme } from '@visactor/vchart';
import '@visactor/vchart-semi-theme';

registerTheme('semi', { theme: 'semi' });

const { Title } = Typography;

const LogsCharts = forwardRef((props, ref) => {
    const [chartsLoading, setChartsLoading] = useState(true);
    const [chartsData, setChartsData] = useState({
        overTime: [],
        byCategory: [],
        topUsers: [],
        topIps: [],
        hourlyActivity: [],
    });

    const fetchChartsData = async () => {
        setChartsLoading(true);
        try {
            const [overTime, byCategory, topUsers, topIps, hourlyActivity] = await Promise.all([
                apiFetch({ path: '/authguard/v1/logs/stats/over-time' }),
                apiFetch({ path: '/authguard/v1/logs/stats/by-category' }),
                apiFetch({ path: '/authguard/v1/logs/stats/top-users' }),
                apiFetch({ path: '/authguard/v1/logs/stats/top-ips' }),
                apiFetch({ path: '/authguard/v1/logs/stats/hourly-activity' }),
            ]);

            setChartsData({
                overTime: overTime.data || [],
                byCategory: byCategory.data || [],
                topUsers: topUsers.data || [],
                topIps: topIps.data || [],
                hourlyActivity: hourlyActivity.data || [],
            });
        } catch (error) {
            console.error('Error fetching charts data:', error);
        } finally {
            setChartsLoading(false);
        }
    };

    useEffect(() => {
        fetchChartsData();
    }, []);

    useImperativeHandle(ref, () => ({
        fetchChartsData,
    }));

    const overTimeSpec = {
        type: 'line',
        theme: 'semi',
        data: {
            values: chartsData.overTime.map(item => ({ date: item.date, total: item.total }))
        },
        xField: 'date',
        yField: 'total',
        // title: { text: 'Logs Over Time' },
        point: { size: 5 },
        smooth: true,
    };

    const byCategorySpec = {
        type: 'bar',
        theme: 'semi',
        data: {
            values: chartsData.byCategory.map(item => ({ category: item.category, total: item.total }))
        },
        xField: 'category',
        yField: 'total',
        // title: { text: 'Logs by Category' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    const topUsersSpec = {
        type: 'bar',
        theme: 'semi',
        data: {
            values: chartsData.topUsers.map(item => ({ user: item.display_name || `User ${item.user_id}`, total: item.total }))
        },
        xField: 'user',
        yField: 'total',
        // title: { text: 'Top 10 Users' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    const categoryPieSpec = {
        type: 'pie',
        theme: 'semi',
        data: {
            values: chartsData.byCategory.map(item => ({ category: item.category, total: item.total }))
        },
        valueField: 'total',
        categoryField: 'category',
        // title: { text: 'Category Share' },
        label: { visible: true },
        outerRadius: 0.8,
        innerRadius: 0.5,
        pie: {
            state: {
                hover: { stroke: '#000', lineWidth: 1 }
            }
        },
    };

    const topIpsSpec = {
        type: 'bar',
        theme: 'semi',
        data: {
            values: chartsData.topIps.map(item => ({ ip: item.ip, total: item.total }))
        },
        xField: 'ip',
        yField: 'total',
        // title: { text: 'Top 10 IPs' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    const hourlyActivitySpec = {
        type: 'bar',
        theme: 'semi',
        data: {
            values: chartsData.hourlyActivity.map(item => ({ hour: `${item.hour}:00`, total: item.total }))
        },
        xField: 'hour',
        yField: 'total',
        // title: { text: 'Hourly Activity' },
        label: { visible: true },
        axis: {
            y: {
                label: { autoHide: true, autoRotate: true }
            }
        }
    };

    return (
        <div>
            <Spin spinning={chartsLoading}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Card style={{ marginBottom: 16 }} bodyStyle={{padding: 0}} title={__('Logs Over Time', 'authguard')} headerLine={true}>
                            <VChart spec={overTimeSpec} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card style={{ marginBottom: 16 }} bodyStyle={{padding: 0}} title={__('Logs by Category', 'authguard')} headerLine={true}>
                            <VChart spec={byCategorySpec} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card style={{ marginBottom: 16 }} bodyStyle={{padding: 0}} title={__('Top Users', 'authguard')} headerLine={true}>
                            <VChart spec={topUsersSpec} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card style={{ marginBottom: 16 }} bodyStyle={{padding: 0}} title={__('Category Share', 'authguard')} headerLine={true}>
                            <VChart spec={categoryPieSpec} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card style={{ marginBottom: 16 }} bodyStyle={{padding: 0}} title={__('Top IPs', 'authguard')} headerLine={true}>
                            <VChart spec={topIpsSpec} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card style={{ marginBottom: 16 }} bodyStyle={{padding: 0}} title={__('Hourly Activity', 'authguard')} headerLine={true}>
                            <VChart spec={hourlyActivitySpec} />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
});

LogsCharts.displayName = 'LogsCharts';

export default LogsCharts;
