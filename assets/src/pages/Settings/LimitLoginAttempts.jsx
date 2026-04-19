import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, InputNumber, TextArea, TagInput } from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";

const { Title, Paragraph } = Typography;

const validateIP = (ip) => {
    if (!ip) return false;

    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:(?:[0-9a-fA-F]{1,4}:){1,7}:)$|^(?:(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$|^::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;
    const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/;
    const ipv6CidrRegex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\/\d{1,3}$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ipv4CidrRegex.test(ip) || ipv6CidrRegex.test(ip);
};

const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const ipBlacklistValidator = (value) => {
    if (!value || value.length === 0) return true;

    const invalidIps = value.filter(ip => !validateIP(ip));

    if (invalidIps.length > 0) {
        return __('Invalid IP format. Use IPv4, IPv6, or CIDR notation.', 'authguard');
    }

    return true;
};

const emailBlacklistValidator = (value) => {
    if (!value || value.length === 0) return true;

    const invalidEmails = value.filter(email => !validateEmail(email));

    if (invalidEmails.length > 0) {
        return __('Invalid email format detected.', 'authguard');
    }

    return true;
};

const LimitLoginAttempts = () => {
   const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
   const [hasChanges, setHasChanges] = useState(false);
   const [localValues, setLocalValues] = useState({});
   const [originalValues, setOriginalValues] = useState({});
   const [ipError, setIpError] = useState('');
   const [emailError, setEmailError] = useState('');

   useEffect(() => {
       if (settings && settings?.limit_login_attempts) {
           const LimitLoginAttemptsSettings = settings.limit_login_attempts;
           setLocalValues({ ...LimitLoginAttemptsSettings });
           setOriginalValues({ ...LimitLoginAttemptsSettings });
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

    const handleIpChange = (value) => {
        const validIps = value.filter(ip => validateIP(ip));
        const hasInvalid = validIps.length !== value.length;
        setIpError(hasInvalid ? __('Invalid IP format. Use IPv4, IPv6, or CIDR notation.', 'authguard') : '');
        handleChange('ip_blacklist', validIps);
    };

    const handleEmailChange = (value) => {
        const validEmails = value.filter(email => validateEmail(email));
        const hasInvalid = validEmails.length !== value.length;
        setEmailError(hasInvalid ? __('Invalid email format detected.', 'authguard') : '');
        handleChange('email_blacklist', validEmails);
    };

   const onSave = () => {
       handleSubmit('limit_login_attempts', localValues);
   };

   return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Enable Limit Login Attempts", "authguard")}</Title>
                            <Paragraph>{__("Enable or disable the limit on login attempts.", "authguard")}</Paragraph>
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
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Attempts Allowed", "authguard")}</Title>
                            <Paragraph>{__("The number of login attempts allowed before lockout.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>  
                            <InputNumber 
                                min={1} 
                                placeholder={__("Attempts Allowed", "authguard")}
                                style={{ width: '100%' }}
                                value={localValues?.attempts_allowed || 1}
                                onChange={(value) => handleChange('attempts_allowed', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Minutes Lockout", "authguard")}</Title>
                            <Paragraph>{__("The number of minutes a user is locked out after exceeding the allowed login attempts.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>  
                            <InputNumber 
                                min={1} 
                                placeholder={__("Minutes Lockout", "authguard")}
                                style={{ width: '100%' }}
                                value={localValues?.minutes_lockout || 1}
                                onChange={(value) => handleChange('minutes_lockout', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Lockout Message", "authguard")}</Title>
                            <Paragraph>{__("The message displayed to users when they are locked out.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>  
                            <TextArea
                                showClear
                                placeholder={__("Too many failed login attempts. Please try again in {minutes} minutes.", "authguard")}
                                style={{ width: '100%' }}
                                value={localValues?.lockout_message || ''}
                                onChange={(value) => handleChange('lockout_message', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("IP Blacklist", "authguard")}</Title>
                            <Paragraph>{__("List of IP addresses that are blacklisted from login attempts.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                     {
                         !settingsLoading &&
                         <Col xs={24} lg={12} xl={10}>
                             <TagInput
                                 addOnBlur={true}
                                 placeholder={__("Please enter IPs...", "authguard")}
                                 value={localValues?.ip_blacklist || []}
                                 onChange={handleIpChange}
                                 validateStatus={ipError ? 'error' : 'default'}
                             />
                             {ipError && (
                                 <p style={{ color: 'var(--semi-color-danger)', fontSize: '12px', marginTop: '4px' }}>
                                     {ipError}
                                 </p>
                             )}
                         </Col>
                     }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Email Blacklist", "authguard")}</Title>
                            <Paragraph>{__("List of email addresses that are blacklisted from login attempts.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                     {
                         !settingsLoading &&
                         <Col xs={24} lg={12} xl={10}>
                             <TagInput
                                 addOnBlur={true}
                                 placeholder={__("Please enter emails...", "authguard")}
                                 value={localValues?.email_blacklist || []}
                                 onChange={handleEmailChange}
                                 validateStatus={emailError ? 'error' : 'default'}
                             />
                             {emailError && (
                                 <p style={{ color: 'var(--semi-color-danger)', fontSize: '12px', marginTop: '4px' }}>
                                     {emailError}
                                 </p>
                             )}
                         </Col>
                     }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='limit_login_attempts' handleReset={handleReset} onSave={onSave} />
        </>
   );
};

export default LimitLoginAttempts;