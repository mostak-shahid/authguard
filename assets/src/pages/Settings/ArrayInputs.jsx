import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Checkbox } from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";
const { Title, Paragraph } = Typography;
const ArrayInputs = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings.array) {
            const arraySettings = settings.array;
            setLocalValues({ ...arraySettings });
            setOriginalValues({ ...arraySettings });
            setHasChanges(false);
        }
    }, [settings]);

    const handleCheckboxChange = (value) => {
        setLocalValues(prev => {
            const updated = { ...prev, checkbox: value };
            const isChanged = JSON.stringify(updated) !== JSON.stringify(originalValues);
            setHasChanges(isChanged);
            return updated;
        });
    };

    const onSave = () => {
        handleSubmit('array', localValues);
    };

    return (
        <>
            {!settingsLoading && settings?.array && (
                <div style={{ maxWidth: '600px' }}>
                    <div className="setting-unit py-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Checkbox Group", "authguard")}</Title>
                                    <Paragraph>{__("Lorem", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <Checkbox.Group
                                        direction="vertical"
                                        value={localValues?.checkbox || []}
                                        onChange={handleCheckboxChange}
                                    >
                                        <Checkbox value="checkbox-1">{__('Checkbox 1', 'authguard')}</Checkbox>
                                        <Checkbox value="checkbox-2">{__('Checkbox 2', 'authguard')}</Checkbox>
                                        <Checkbox value="checkbox-3">{__('Checkbox 3', 'authguard')}</Checkbox>
                                        <Checkbox value="checkbox-4">{__('Checkbox 4', 'authguard')}</Checkbox>
                                    </Checkbox.Group>
                                </Col>
                            }
                        </Row>
                    </div>

                    <ActionButtons hasChanges={hasChanges} section='array' handleReset={handleReset} onSave={onSave} />
                </div>
            )}
        </>
    );
};

export default ArrayInputs;
