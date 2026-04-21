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

    const wordpressRoles = [
        { value: 'administrator', label: __('Administrator', 'authguard') },
        { value: 'editor', label: __('Editor', 'authguard') },
        { value: 'author', label: __('Author', 'authguard') },
        { value: 'contributor', label: __('Contributor', 'authguard') },
        { value: 'subscriber', label: __('Subscriber', 'authguard') },
    ];

    useEffect(() => {
        if (settings && settings?.password_policy?.settings) {
            const s = settings.password_policy.settings;
            const newValues = {
                password_rules_enabled: s.password_rules_enabled || false,
                min_length: s.min_length || 8,
                require_uppercase: s.require_uppercase || false,
                require_number: s.require_number || false,
                require_special: s.require_special || false,
                force_password_reset: s.force_password_reset || false,
                password_reset_duration: s.password_reset_duration || 30,
                password_reset_roles: s.password_reset_roles || []
            };
            setLocalValues(newValues);
            setOriginalValues(newValues);
            setHasChanges(false);

            const checkedList = s.password_reset_roles || [];
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
                            <Title heading={4}>{__("Password Rules", "authguard")}</Title>
                            <Paragraph>{__("Enable to enforce password complexity rules for all users.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('password_rules_enabled', value)}
                                checked={Boolean(localValues?.password_rules_enabled)}
                            />
                        </Col>
                    }
                </Row>
            </div>

            {localValues?.password_rules_enabled && (
                <>
                    <div className="setting-unit py-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Minimum Length", "authguard")}</Title>
                                    <Paragraph>{__("Set the minimum password length required.", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <InputNumber
                                        className="w-full"
                                        placeholder={__("8", "authguard")}
                                        value={localValues?.min_length}
                                        onChange={(value) => handleChange('min_length', value)}
                                        min={8}
                                        max={128}
                                        suffix={__('characters', 'authguard')}
                                    />
                                </Col>
                            }
                        </Row>
                    </div>

                    <div className="setting-unit py-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Require Uppercase", "authguard")}</Title>
                                    <Paragraph>{__("Require at least one uppercase letter in the password.", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <Switch
                                        onChange={(value) => handleChange('require_uppercase', value)}
                                        checked={Boolean(localValues?.require_uppercase)}
                                    />
                                </Col>
                            }
                        </Row>
                    </div>

                    <div className="setting-unit py-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Require Number", "authguard")}</Title>
                                    <Paragraph>{__("Require at least one numeric digit in the password.", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <Switch
                                        onChange={(value) => handleChange('require_number', value)}
                                        checked={Boolean(localValues?.require_number)}
                                    />
                                </Col>
                            }
                        </Row>
                    </div>

                    <div className="setting-unit py-4">
                        <Row type="flex" gutter={[24, 24]}>
                            <Col xs={24} lg={12} xl={14}>
                                <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                                    <Title heading={4}>{__("Require Special Symbol", "authguard")}</Title>
                                    <Paragraph>{__("Require at least one special character (e.g. !@#$%) in the password.", "authguard")}</Paragraph>
                                </Skeleton>
                            </Col>
                            {
                                !settingsLoading &&
                                <Col xs={24} lg={12} xl={10}>
                                    <Switch
                                        onChange={(value) => handleChange('require_special', value)}
                                        checked={Boolean(localValues?.require_special)}
                                    />
                                </Col>
                            }
                        </Row>
                    </div>
                </>
            )}

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
