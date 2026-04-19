import { __ } from "@wordpress/i18n";
import { Row, Col, Skeleton, Typography, Switch, Input, Select} from '@douyinfe/semi-ui';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ActionButtons from "./ActionButtons";
import { MediaUploaderControl, SkeletonPlaceholder, UnitControl } from "../../components";
import ImageSelectorStandalone from "../../components/ImageSelector/ImageSelector";

const { Title, Paragraph } = Typography;
const Misc = () => {
    const { settings, settingsLoading, handleSubmit, handleReset } = useOutletContext();
    const [hasChanges, setHasChanges] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings && settings?.misc) {
            const otherSettings = settings.misc;
            setLocalValues({ ...otherSettings });
            setOriginalValues({ ...otherSettings });
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
        handleSubmit('misc', localValues);
    };

    return (
        <>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Disable Remember Me", "authguard")}</Title>
                            <Paragraph>{__("Hide the 'Remember Me' checkbox on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('disable_remember_me', value)}
                                checked={ Boolean(localValues?.disable_remember_me) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Disable Register Link", "authguard")}</Title>
                            <Paragraph>{__("Hide the 'Register' link on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('disable_register_link', value)}
                                checked={ Boolean(localValues?.disable_register_link) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Disable Lost Password Link", "authguard")}</Title>
                            <Paragraph>{__("Hide the 'Lost Password' link on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('disable_lost_password', value)}
                                checked={ Boolean(localValues?.disable_lost_password) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Disable Privacy Policy Link", "authguard")}</Title>
                            <Paragraph>{__("Hide the 'Privacy Policy' link on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('disable_privacy_policy', value)}
                                checked={ Boolean(localValues?.disable_privacy_policy) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Disable Back to Website Link", "authguard")}</Title>
                            <Paragraph>{__("Hide the 'Back to Website' link on the login page", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('disable_back_to_website', value)}
                                checked={ Boolean(localValues?.disable_back_to_website) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Login by", "authguard")}</Title>
                            <Paragraph>{__("Select the method for users to log in", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Select
                                noLabel
                                className="w-full"
                                placeholder={__("Login by", "authguard")}
                                value={localValues?.login_by}
                                optionList={[
                                    { label: 'Default', value: 'both' },
                                    { label: 'Username', value: 'username' },
                                    { label: 'Email', value: 'email' },
                                    { label: 'Phone', value: 'phone' },
                                ]}
                                onChange={(value) => handleChange('login_by', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Restrict Domains", "authguard")}</Title>
                            <Paragraph>{__("Enter each domain in the format @domain.com and press Enter (e.g., @gmail.com, @yahoo.com).", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Input
                                noLabel
                                className="w-full"
                                placeholder={__("@domain.com", "authguard")}
                                value={localValues?.restrict_domains}
                                onChange={(value) => handleChange('restrict_domains', value)}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingsLoading} active>
                            <Title heading={4}>{__("Registered with Password", "authguard")}</Title>
                            <Paragraph>{__("Allow users to log in with their password after registration", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col xs={24} lg={12} xl={10}>
                            <Switch
                                onChange={(value) => handleChange('registered_with_password', value)}
                                checked={ Boolean(localValues?.registered_with_password) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <ActionButtons hasChanges={hasChanges} section='customizer.redesign.other' handleReset={handleReset} onSave={onSave} />
        </>
    );
};

export default Misc;
