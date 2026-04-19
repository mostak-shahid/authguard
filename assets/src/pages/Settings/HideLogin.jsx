import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Input, RadioGroup, Radio, TextArea } from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";

const { Title, Paragraph } = Typography;
const HideLogin = () => {
   const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
   const [hasChanges, setHasChanges] = useState(false);
   const [localValues, setLocalValues] = useState({});
   const [originalValues, setOriginalValues] = useState({});

   useEffect(() => {
       if (settings && settings?.hide_login) {
           const hideLoginSettings = settings.hide_login;
           setLocalValues({ ...hideLoginSettings });
           setOriginalValues({ ...hideLoginSettings });
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
       handleSubmit('hide_login', localValues);
   };

   return (
       <>
           {!settingsLoading && settings?.hide_login && (
               <div>
                   <div className="setting-unit py-4">
                       <Row type="flex" gutter={[24, 24]}>
                           <Col xs={24} lg={12} xl={14}>
                               <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                   <Title heading={4}>{__("Login URL", "authguard")}</Title>
                                   <Paragraph>{__("The URL for the login page.", "authguard")}</Paragraph>
                               </Skeleton>
                           </Col>
                           {
                               !settingsLoading &&
                               <Col xs={24} lg={12} xl={10}>
                                   <Input
                                        prefix={authguard_ajax_obj.home_url + '/'}
                                        placeholder={__("wp-login.php", "authguard")}
                                        style={{ width: '100%' }}
                                        value={localValues?.login_url || ''}
                                        onChange={(value) => handleChange('login_url', value)}
                                    />
                               </Col>
                           }
                       </Row>
                   </div>
                   <ActionButtons hasChanges={hasChanges} section='hide_login' handleReset={handleReset} onSave={onSave} />
               </div>
           )}
       </>
   );
};

export default HideLogin;
