import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, Input} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { MediaUploaderControl, SkeletonPlaceholder, UnitControl } from "../../components";
import { UNITS } from "../../lib/Constants";
const { Title, Paragraph } = Typography;
const CustomizerPersonalizeLogo = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings?.customizer?.redesign?.logo) {
            const logoSettings = settings.customizer.redesign.logo;
            setLocalValues({ ...logoSettings });
            setOriginalValues({ ...logoSettings });
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
            customizer: {
                ...settings.customizer,
                redesign: {
                    ...settings.customizer.redesign,
                    logo: localValues
                }
            }
        };
        handleSubmit('customizer', updatedSettings.customizer);
    };

    return (
        <>
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Hide logo", "authguard")}</Title>
                            <Paragraph>{__("Toggle to hide the logo on your login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('disabled', value)}
                                checked={ Boolean(localValues?.disabled) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Upload Logo", "authguard")}</Title>
                            <Paragraph>{__("Upload a logo for your login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <MediaUploaderControl
                                data={localValues?.image}
                                name='image'
                                handleChange={handleChange}
                                options = {{
                                    frame:{
                                        title: __("Select or Upload Image", "authguard"),
                                    },
                                    library: {type: 'image'},
                                    buttons: {
                                        upload: __("Upload Image", "authguard"),
                                        remove: __("Remove", "authguard"),
                                        select: __("Use this image", "authguard")
                                    }
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Logo Size", "authguard")}</Title>
                            <Paragraph>{__("Adjust the size of your logo on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Row type="flex" gutter={[16, 16]}>
                                <Col xs={12}>
                                    <UnitControl
                                        label={__('Width', 'authguard')}
                                        onChange={(value) => handleChange('width', value)}
                                        value={localValues?.width}
                                        units={UNITS}
                                    />
                                </Col>
                                <Col xs={12}>
                                    <UnitControl
                                        label={__('Height', 'authguard')}
                                        onChange={(value) => handleChange('height', value)}
                                        value={localValues?.height}
                                        units={UNITS}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Space below", "authguard")}</Title>
                            <Paragraph>{__("Adjust the space below your logo on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <UnitControl
                                onChange={(value) => handleChange('space', value)}
                                value={localValues?.space}
                                units={UNITS}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Logo URL", "authguard")}</Title>
                            <Paragraph>{__("Enter the URL for your logo", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Input
                                type="url"
                                value={localValues?.url}
                                onChange={(value) => handleChange('url', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='customizer.redesign.logo' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default CustomizerPersonalizeLogo;
