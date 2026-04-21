import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, Input} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { FontControl, MediaUploaderControl, MultiColorControl, SkeletonPlaceholder, UnitControl, BorderControl } from "../../components";
import ImageSelectorStandalone from "../../components/ImageSelector/ImageSelector";
import { UNITS } from "../../lib/Constants";

const { Title, Paragraph } = Typography;
const CustomizerPersonalizeButton = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings?.customizer?.redesign?.button) {
            const buttonSettings = settings.customizer.redesign.button;
            setLocalValues({ ...buttonSettings });
            setOriginalValues({ ...buttonSettings });
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
                    button: localValues
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
                            <Title heading={4}>{__("Font", "authguard")}</Title>
                            <Paragraph>{__("Adjust the font for your login button", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <FontControl
                                defaultValues={localValues.font}
                                name='font'
                                handleChange={handleChange}
                                options = {["font-size", "font-weight", "font-style", "font-variant", "font-stretch", "text-align", "text-decoration", "text-transform" ]}
                            /> 
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Background", "authguard")}</Title>
                            <Paragraph>{__("Adjust the background for your login button", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <MultiColorControl
                                name='background'
                                options={['normal', 'hover', 'active']}
                                defaultValues={localValues?.background}
                                handleChange={handleChange}
                            /> 
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Text", "authguard")}</Title>
                            <Paragraph>{__("Adjust the text for your login button", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <MultiColorControl
                                name='color'
                                options={['normal', 'hover', 'active']}
                                defaultValues={localValues?.color}
                                handleChange={handleChange}
                            /> 
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Border", "authguard")}</Title>
                            <Paragraph>{__("Adjust the border and border radius for your login button", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <BorderControl
                                name='border'
                                defaultValues={localValues?.border}
                                borderRadiusValue={localValues?.border_radius}
                                handleChange={handleChange}
                                options={['width', 'style', 'color', 'border_radius']}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='customizer.redesign.button' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default CustomizerPersonalizeButton;
