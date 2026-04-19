import React, { useRef } from 'react';
import { Typography, Divider } from '@douyinfe/semi-ui';
import LogsCharts from './LogsCharts';
import LogsTable from './LogsTable';

const { Title } = Typography;

export default function Logs() {
    const chartsRef = useRef(null);

    const handleDataRefresh = () => {
        if (chartsRef.current && chartsRef.current.fetchChartsData) {
            chartsRef.current.fetchChartsData();
        }
    };

    return (
        <div>
            <LogsTable onDataRefresh={handleDataRefresh} />
            <Divider margin="12px" />
            <LogsCharts ref={chartsRef} />
        </div>
    );
}
