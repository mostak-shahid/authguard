import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, Input} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { FontControl, MediaUploaderControl, SkeletonPlaceholder, UnitControl } from "../../components";

import { UNITS, COLORS, DEFAULT_BORDER, FONT_SIZES } from '../../lib/Constants';
const { Title, Paragraph } = Typography;
const CustomizerPersonalizeFields = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings?.customizer?.redesign?.fields) {
            const fieldsSettings = settings.customizer.redesign.fields;
            setLocalValues({ ...fieldsSettings });
            setOriginalValues({ ...fieldsSettings });
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
                    fields: localValues
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
                            <Title heading={4}>{__("Size", "authguard")}</Title>
                            <Paragraph>{__("Adjust the size of your login fields", "authguard")}</Paragraph>
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
            <div className="setting-unit pt-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Font", "authguard")}</Title>
                            <Paragraph>{__("Adjust the font for your login page", "authguard")}</Paragraph>
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
            <ActionButtons hasChanges={hasChanges} section='customizer.redesign.fields' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default CustomizerPersonalizeFields;
