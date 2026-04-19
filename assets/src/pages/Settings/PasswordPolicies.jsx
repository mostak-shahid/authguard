import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, InputNumber, Checkbox, CheckboxGroup } from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { SkeletonPlaceholder } from "../../components";
import { Toast } from '@douyinfe/semi-ui';
const { Title, Paragraph } = Typography;

const PasswordPolicies = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);

    // WordPress default roles
    const wordpressRoles = [
        { value: 'administrator', label: __('Administrator', 'authguard') },
        { value: 'editor', label: __('Editor', 'authguard') },
        { value: 'author', label: __('Author', 'authguard') },
        { value: 'contributor', label: __('Contributor', 'authguard') },
        { value: 'subscriber', label: __('Subscriber', 'authguard') },
    ];

    useEffect(() => {
        if (settings && settings?.password_policy?.settings) {
            const passwordPolicySettings = settings.password_policy.settings;
            const newValues = {
                force_password_reset: passwordPolicySettings.force_password_reset || false,
                password_reset_duration: passwordPolicySettings.password_reset_duration || 30,
                password_reset_roles: passwordPolicySettings.password_reset_roles || []
            };
            setLocalValues(newValues);
            setOriginalValues(newValues);
            setHasChanges(false);

            const checkedList = passwordPolicySettings.password_reset_roles || [];
            setIndeterminate(!!checkedList.length && checkedList.length < wordpressRoles.length);
            setCheckAll(checkedList.length === wordpressRoles.length);
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

    const onRoleChange = (checkedList) => {
        setLocalValues(prev => {
            const updated = { ...prev, password_reset_roles: checkedList };
            setIndeterminate(!!checkedList.length && checkedList.length < wordpressRoles.length);
            setCheckAll(checkedList.length === wordpressRoles.length);

            setTimeout(() => {
                const isChanged = JSON.stringify(updated) !== JSON.stringify(originalValues);
                setHasChanges(isChanged);
            }, 0);

            return updated;
        });
    };

    const onCheckAllChange = (e) => {
        const checked = e.target.checked;
        const checkedList = checked ? wordpressRoles.map(r => r.value) : [];

        setLocalValues(prev => {
            const updated = { ...prev, password_reset_roles: checkedList };
            setIndeterminate(false);
            setCheckAll(checked);

            setTimeout(() => {
                const isChanged = JSON.stringify(updated) !== JSON.stringify(originalValues);
                setHasChanges(isChanged);
            }, 0);

            return updated;
        });
    };

    const onSave = () => {
        if (!localValues.force_password_reset && (!localValues.password_reset_roles || localValues.password_reset_roles.length === 0)) {
            Toast.warning({
                content: __('Please enable password reset and select at least one role.', 'authguard'),
                duration: 3,
            });
            return;
        }

        const updatedSettings = {
            ...settings,
            password_policy: {
                ...settings.password_policy,
                settings: localValues
            }
        };
        handleSubmit('password_policy', updatedSettings.password_policy);
    };

    return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Force Password Reset", "authguard")}</Title>
                            <Paragraph>{__("Enable to enforce password reset after certain duration.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('force_password_reset', value)}
                                checked={ Boolean(localValues?.force_password_reset) }
                            />
                        </Col>
                    }
                </Row>
            </div>

            {localValues?.force_password_reset && (
                <>
                    <div className="setting-unit py-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Password Reset Duration", "authguard")}</Title>
                                    <Paragraph>{__("Set duration in days after which user will be forced to change password again.", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <InputNumber
                                        className="w-full"
                                        placeholder={__("30", "authguard")}
                                        value={localValues?.password_reset_duration}
                                        onChange={(value) => handleChange('password_reset_duration', value)}
                                        min={1}
                                        max={365}
                                        suffix={__('days', 'authguard')}
                                    />
                                </Col>
                            }
                        </Row>
                    </div>

                    <div className="setting-unit pt-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Password Reset For", "authguard")}</Title>
                                    <Paragraph>{__("Choose roles for password reset forcefully to secure your site's security.", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <div>
                                        <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--semi-color-border)' }}>
                                            <Checkbox
                                                indeterminate={indeterminate}
                                                onChange={onCheckAllChange}
                                                checked={checkAll}
                                                aria-label="Select all roles"
                                            >
                                                {__("Select All", "authguard")}
                                            </Checkbox>
                                        </div>
                                        <CheckboxGroup
                                            style={{ marginTop: 12 }}
                                            options={wordpressRoles}
                                            value={localValues?.password_reset_roles || []}
                                            onChange={onRoleChange}
                                            aria-label="Select roles for password reset"
                                        />
                                    </div>
                                </Col>
                            }
                        </Row>
                    </div>
                </>
            )}

            <ActionButtons hasChanges={hasChanges} section='password_policy.settings' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default PasswordPolicies;
