import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, Select} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { MediaUploaderControl, SkeletonPlaceholder, UnitControl } from "../../components";
import { UNITS } from "../../lib/Constants";
const { Title, Paragraph } = Typography;
const CaptchasSettings = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings?.captcha?.settings) {
            const captchaSettings = settings.captcha.settings;
            setLocalValues({ ...captchaSettings });
            setOriginalValues({ ...captchaSettings });
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
            captcha: {
                ...settings.captcha,
                settings: localValues
            }
        };
        handleSubmit('captcha', updatedSettings.captcha);
    };

    return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Enable captcha", "authguard")}</Title>
                            <Paragraph>{__("Enable or disable the captcha feature", "authguard")}</Paragraph>
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
                            <Title heading={4}>{__("Select Captcha", "authguard")}</Title>
                            <Paragraph>{__("Choose the type of captcha to display", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Select
                                noLabel
                                className="w-full"
                                placeholder={__("Background type", "authguard")}
                                value={localValues?.selected_captcha}
                                optionList={[
                                    { label: 'Math Captcha', value: 'math_captcha' },
                                    { label: 'Icon Captcha', value: 'icon_captcha', disabled: true },
                                    { label: 'Alphanumeric Captcha', value: 'alphanumeric_captcha', disabled: true },
                                    { label: 'Puzzle Captcha', value: 'puzzle_captcha', disabled: true },

                                ]}
                                onChange={(value) => handleChange('selected_captcha', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='captcha.settings' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default CaptchasSettings;
