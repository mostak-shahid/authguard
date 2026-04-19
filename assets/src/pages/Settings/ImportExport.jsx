import { __ } from "@wordpress/i18n";
import apiFetch from '@wordpress/api-fetch';
import { useState } from 'react';
import { Row, Col, Typography, Skeleton, Button, Upload, Space, Notification } from '@douyinfe/semi-ui';
import { IconDownload, IconUpload, IconTickCircle } from '@douyinfe/semi-icons';
import { SkeletonPlaceholder } from '../../components';

const { Title, Paragraph } = Typography;

const ImportExport = () => {
    const { Title, Text, Paragraph } = Typography;
    const [importData, setImportData] = useState('');
    const [processingImport, setProcessingImport] = useState(false);
    const [processingExport, setProcessingExport] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleExport = async() => {
        setProcessingExport(true);
        try {
            const data = await apiFetch({
                path: "/authguard/v1/options",
                method: 'GET'
            });
            if (data) {
                // setSettings(data);
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'authguard-settings.json';
                link.click();
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setProcessingExport(false);
        }        
        // toast.success(__('Settings exported successfully', 'authguard'));
    };
    

    // Handle file upload with Semi Design Upload
    const handleFileChange = ({ fileList, currentFile }) => {
        setFileList(fileList);

        if (currentFile && currentFile.fileInstance) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    JSON.parse(content);
                    setImportData(content);
                } catch (err) {
                    setFileList([]);
                    setImportData('');
                    Notification.error({
                        title: __("Error", "authguard"),
                        content: __("Invalid JSON file format", "authguard"),
                        duration: 3,
                        position: 'topRight',
                    });
                }
            };
            reader.readAsText(currentFile.fileInstance);
        }
    };

    // Handle file removal
    const handleRemove = () => {
        setImportData('');
        setFileList([]);
    };

    // Submit imported JSON
    const handleImport = async () => {
        setProcessingImport(true);
        try {
            const parsed = JSON.parse(importData);
            const response = await apiFetch({
                path: '/authguard/v1/options/import-settings',
                method: 'POST',
                data: parsed,
            });

            if (response.success) {
                setProcessingImport(false);
                setFileList([]);
                setImportData('');
                Notification.success({
                    title: __("Success", "authguard"),
                    content: __("Settings imported successfully!", "authguard"),
                    duration: 3,
                    position: 'topRight',
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setProcessingImport(false);
                Notification.error({
                    title: __("Error", "authguard"),
                    content: response.message || __("Import failed", "authguard"),
                    duration: 5,
                    position: 'topRight',
                });
            }
        } catch (e) {
            setProcessingImport(false);
            Notification.error({
                title: __("Error", "authguard"),
                content: e.message || __("Invalid JSON content or import failed", "authguard"),
                duration: 5,
                position: 'topRight',
            });
        }
    };
    return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24 ]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Title heading={4}>{__("Export Settings", "authguard")}</Title>
                        <Paragraph>{__("Export your current settings", "authguard")}</Paragraph>
                    </Col>                                 
                    <Col xs={24} lg={12} xl={10}>
                        <Button     
                            type="primary" 
                            icon={<IconDownload />}                  
                            onClick={handleExport}
                        >
                            {__( "Export Settings", "authguard" )}
                        </Button>
                    </Col>
                </Row>
            </div>
            
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                            <Title heading={4}>{__("Import Settings", "authguard")}</Title>
                            <Paragraph>{__("Description", "authguard")}</Paragraph>
                    </Col>                                 
                    <Col xs={24} lg={12} xl={10}>
                        <Space vertical spacing='tight' align='start'>
                            <Upload
                                accept="application/json,.json"
                                action=""
                                fileList={fileList}
                                onChange={handleFileChange}
                                onRemove={handleRemove}
                                beforeUpload={() => false}
                                maxSize={5120}
                                limit={1}
                            >
                                <Button icon={<IconUpload />}>
                                    {__("Select JSON File", "authguard")}
                                </Button>
                            </Upload>
                            {importData &&
                                <Button
                                    icon={ !processingImport ? <IconTickCircle /> : null}
                                    onClick={handleImport}
                                    disabled={processingImport}
                                    loading={processingImport}
                                    type="primary"
                                >
                                    {processingImport
                                        ? __("Processing...", "authguard")
                                        : __("Import Settings", "authguard")
                                    }
                                </Button>
                            }
                        </Space>
                        <div>

                            {/* Hidden textarea with the JSON content */}
                            <textarea
                                style={{ display: 'none' }}
                                value={importData}
                                readOnly
                            ></textarea>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default ImportExport;