import { __ } from "@wordpress/i18n";
import { Button, Card, Typography, Row, Col, Skeleton, Switch } from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";

const { Title, Paragraph } = Typography;

const More = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings.more) {
            const moreSettings = settings.more;
            setLocalValues({ ...moreSettings });
            setOriginalValues({ ...moreSettings });
            setHasChanges(false);
        }
    }, [settings]);

    const handleChange = (field, value) => {
        setLocalValues(prev => {
            const updated = { ...prev, [field]: value };
            const isChanged = JSON.stringify(updated) !== JSON.stringify(originalValues);
            setHasChanges(isChanged);
            return updated;
        });
    };

    const onSave = () => {
        handleSubmit('more', localValues);
    };

    return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Enable Scripts", "authguard")}</Title>
                            <Paragraph>{__("Enable/Disable \"Scripts\" functionalities", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                checked={localValues?.enable_scripts || false}
                                onChange={(value) => handleChange('enable_scripts', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>

            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("CSS Editor", "authguard")}</Title>
                            <Paragraph>{__("Add any custom CSS code if necessary", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24}>
                            <AceEditor
                                mode="css"
                                theme="monokai"
                                value={localValues?.css || ''}
                                onChange={(value) => handleChange('css', value)}
                                name="css-editor"
                                width="100%"
                                height="200px"
                                editorProps={{ $blockScrolling: true }}
                            />
                        </Col>
                    }
                </Row>
            </div>

            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("JavaScript Editor", "authguard")}</Title>
                            <Paragraph>{__("Add any custom JS code if necessary", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24}>
                            <AceEditor
                                mode="javascript"
                                theme="monokai"
                                value={localValues?.js || ''}
                                onChange={(value) => handleChange('js', value)}
                                name="js-editor"
                                width="100%"
                                height="200px"
                                editorProps={{ $blockScrolling: true }}
                            />
                        </Col>
                    }
                </Row>
            </div>

            <ActionButtons hasChanges={hasChanges} section='more' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default More;
