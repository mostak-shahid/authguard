import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";
import ImageSelectorStandalone from "../../components/ImageSelector/ImageSelector";


const { Title, Paragraph } = Typography;
const CheckIcon = () => {
   return (
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
           <polyline points="20 6 9 17 4 12" />
       </svg>
   );
}

const deepMerge = (target, source) => {
   if (typeof source !== "object" || source === null) return source;
   if (typeof target !== "object" || target === null) return source;

   const output = { ...target };

   Object.keys(source).forEach((key) => {
       output[key] =
           key in target ? deepMerge(target[key], source[key]) : source[key];
   });

   return output;
};
const CustomizerPresets = () => {
   const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
   const [hasChanges, setHasChanges] = useState(false);
   const [localValues, setLocalValues] = useState({});
   const [originalValues, setOriginalValues] = useState({});
   const defaultPresets = authguard_ajax_obj?.default_presets || [];

   useEffect(() => {
       if (settings && settings?.customizer?.redesign?.templates) {
           const templateSettings = settings.customizer.redesign.templates;
           setLocalValues({ ...templateSettings });
           setOriginalValues({ ...templateSettings });
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

   const handlePresetChange = (template) => {
       const selectedPreset = defaultPresets.find(p => p.template === template);
       if (selectedPreset && selectedPreset.preset) {
           const updatedSettings = {
               ...settings,
               customizer: deepMerge(settings.customizer, selectedPreset.preset.customizer)
           };
           handleSubmit('customizer', updatedSettings.customizer);
       }
   };

   const onSave = () => {
       const updatedSettings = {
           ...settings,
           customizer: {
               ...settings.customizer,
               redesign: {
                   ...settings.customizer.redesign,
                   templates: localValues
               }
           }
       };
       handleSubmit('customizer', updatedSettings.customizer);
   };

   return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    {
                        !settingsLoading &&
                        <Col xs={24}>
                            <div className="authguard-image-selector">
                                {
                                    defaultPresets.map(preset => (
                                        <div
                                            key={preset.template}
                                            className={`image-container ${localValues.layout === preset.template ? 'selected' : ''}`}
                                            onClick={() => {
                                                handleChange('layout', preset.template);
                                                handlePresetChange(preset.template);
                                            }}
                                            style={{
                                                display: 'inline-block',
                                                cursor: 'pointer',
                                                marginRight: '16px',
                                                padding: '8px',
                                                border: localValues.layout === preset.template ? '2px solid #1890ff' : '2px solid transparent',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            <div className="image-container-inner">
                                                <img src={preset.img} alt={preset.label}/>
                                                <span>{preset.name}</span>
                                                {localValues.layout === preset.template && (
                                                    <div className="authguard-image-selected">
                                                        <CheckIcon />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </Col>
                    }
                </Row>
            </div>
        </>
   );
};

export default CustomizerPresets;
