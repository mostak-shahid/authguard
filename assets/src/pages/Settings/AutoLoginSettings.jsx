import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, Select} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { MediaUploaderControl, SkeletonPlaceholder, UnitControl } from "../../components";
import { UNITS } from "../../lib/Constants";
const { Title, Paragraph } = Typography;
const AutoLoginSettings = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings?.auto_login?.settings) {
            const autoLoginSettings = settings.auto_login.settings;
            setLocalValues({ ...autoLoginSettings });
            setOriginalValues({ ...autoLoginSettings });
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
        const updatedSettings = {
            ...settings,
            auto_login: {
                ...settings.auto_login,
                settings: localValues
            }
        };
        handleSubmit('auto_login', updatedSettings.auto_login);
    };

    return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Enable auto login", "authguard")}</Title>
                            <Paragraph>{__("Enable or disable the auto login feature", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('enabled', value)}
                                checked={ Boolean(localValues?.enabled) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Select Methods", "authguard")}</Title>
                            <Paragraph>{__("Choose the methods for auto login", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Select
                                noLabel
                                multiple
                                // max={2}
                                // maxTagCount={2}
                                className="w-full"
                                placeholder={__("Select Methods", "authguard")}
                                value={localValues?.selected_auto_login}
                                optionList={[
                                    { label: 'Link Login', value: 'link_login' },
                                    { label: 'Social Login', value: 'social_login', disabled: true },
                                    { label: 'Barcode Login', value: 'barcode_login', disabled: true },
                                ]}
                                onChange={(value) => handleChange('selected_auto_login', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='auto_login.settings' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default AutoLoginSettings;
