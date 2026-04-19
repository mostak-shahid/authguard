import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Input, RadioGroup, Radio, TextArea } from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";

const { Title, Paragraph } = Typography;
const BasicInputs = () => {
   const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
   const [hasChanges, setHasChanges] = useState(false);
   const [localValues, setLocalValues] = useState({});
   const [originalValues, setOriginalValues] = useState({});

   useEffect(() => {
       if (settings && settings?.basic) {
           const basicSettings = settings.basic;
           setLocalValues({ ...basicSettings });
           setOriginalValues({ ...basicSettings });
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
       handleSubmit('basic', localValues);
   };

   return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Text Input", "authguard")}</Title>
                            <Paragraph>{__("Lorem", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Input
                                placeholder={__("Enter text", "authguard")}
                                style={{ width: '100%' }}
                                value={localValues?.text || ''}
                                onChange={(value) => handleChange('text', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Text Area", "authguard")}</Title>
                            <Paragraph>{__("Lorem", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <TextArea
                                placeholder={__("Enter textarea content", "authguard")}
                                rows={4}
                                style={{ width: '100%' }}
                                value={localValues?.textarea || ''}
                                onChange={(value) => handleChange('textarea', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Radio Group", "authguard")}</Title>
                            <Paragraph>{__("Lorem", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <RadioGroup
                                type="button"
                                value={localValues?.radio || ''}
                                onChange={(value) => handleChange('radio', value)}
                            >
                                <Radio value="radio-1">{__('Radio 1', 'authguard')}</Radio>
                                <Radio value="radio-2">{__('Radio 2', 'authguard')}</Radio>
                                <Radio value="radio-3">{__('Radio 3', 'authguard')}</Radio>
                            </RadioGroup>
                        </Col>
                    }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='basic' handleReset={handleReset} onSave={onSave} />
        </>
   );
};

export default BasicInputs;
