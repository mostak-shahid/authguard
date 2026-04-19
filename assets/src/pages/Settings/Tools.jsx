import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import {
    Row,
    Col,
    Skeleton,
    Button,
    Typography,
    Notification,
    Switch,
    Select,
    Popconfirm
} from "@douyinfe/semi-ui";
import { IconRefresh, IconCopy } from "@douyinfe/semi-icons";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { SkeletonPlaceholder } from "../../components";
import ActionButtons from "./ActionButtons";

const { Title, Paragraph } = Typography;

const copyToClipboard = (value) => {
    if (!value) {
        Notification.error({
            title: __("Error", "authguard"),
            content: __("No text to copy", "authguard"),
            duration: 3,
            position: 'topRight',
        });
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value)
            .then(() => {
                Notification.success({
                    title: __("Success", "authguard"),
                    content: __("Copied to clipboard", "authguard"),
                    duration: 3,
                    position: 'topRight',
                });
            })
            .catch((err) => {
                console.error("Clipboard API failed:", err);
                fallbackCopyToClipboard(value);
            });
    } else {
        fallbackCopyToClipboard(value);
    }
};

const fallbackCopyToClipboard = (value) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            Notification.success({
                title: __("Success", "authguard"),
                content: __("Copied to clipboard", "authguard"),
                duration: 3,
                position: 'topRight',
            });
        } else {
            Notification.error({
                title: __("Error", "authguard"),
                content: __("Failed to copy", "authguard"),
                duration: 3,
                position: 'topRight',
            });
        }
    } catch (err) {
        console.error("Fallback copy failed:", err);
        Notification.error({
            title: __("Error", "authguard"),
            content: __("Copy not supported in this browser", "authguard"),
            duration: 3,
            position: 'topRight',
        });
    } finally {
        document.body.removeChild(textArea);
    }
};

const Tools = () => {
    const {
        settings,
        settingsLoading,
        handleSubmit,
        handleReset,
        setSettingsReload,
    } = useOutletContext();

    const [hasChanges, setHasChanges] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [localValues, setLocalValues] = useState({});
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        if (settings?.tools) {
            const toolsSettings = settings.tools;
            setLocalValues({ ...toolsSettings });
            setOriginalValues({ ...toolsSettings });
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
        handleSubmit("tools", localValues);
    };

    const handleClick = async () => {
        setProcessing(true);

        try {
            const result = await apiFetch({
                path: "/authguard/v1/options/reset-settings-all",
                method: "POST",
            });

            if (result.success) {
                setSettingsReload(Math.random());
                Notification.success({
                    title: __("Success", "authguard"),
                    content: __("Settings reset successfully!", "authguard"),
                    duration: 3,
                    position: 'topRight',
                });
            } else {
                throw new Error("Reset failed");
            }
        } catch (error) {
            Notification.error({
                title: __("Error", "authguard"),
                content: __("Error resetting settings.", "authguard"),
                duration: 3,
                position: 'topRight',
            });
        } finally {
            setProcessing(false);
            setSettingsReload?.(Math.random());
        }
    };

    return (
        <>
            <div className="setting-unit py-4">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton
                            placeholder={<SkeletonPlaceholder />}
                            loading={settingsLoading}
                            active
                        >
                            <Title heading={4}>
                                {__(
                                    "Hide Plugin",
                                    "authguard"
                                )}
                            </Title>
                            <Paragraph>
                                {__(
                                    "Hide this plugin from plugin list.",
                                    "authguard"
                                )}
                            </Paragraph>
                        </Skeleton>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <Switch
                            checked={localValues?.hide_plugin || false}
                            onChange={(value) => handleChange('hide_plugin', value)}
                        />
                    </Col>
                </Row>
            </div>
            
            <div className="setting-unit py-4">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton
                            placeholder={<SkeletonPlaceholder />}
                            loading={settingsLoading}
                            active
                        >
                            <Title heading={4}>
                                {__(
                                    "Self Defense",
                                    "authguard"
                                )}
                            </Title>
                            <Paragraph>
                                {__(
                                    "Password requirement for Deactivation.",
                                    "authguard"
                                )}
                            </Paragraph>
                        </Skeleton>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <Switch
                            checked={localValues?.self_defense || false}
                            onChange={(value) => handleChange('self_defense', value)}
                        />
                    </Col>
                </Row>
            </div>

            <div className="setting-unit py-4">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton
                            placeholder={<SkeletonPlaceholder />}
                            loading={settingsLoading}
                            active
                        >
                            <Title heading={4}>
                                {__(
                                    "Delete all plugin data upon",
                                    "authguard"
                                )}
                            </Title>
                            <Paragraph>
                                {__(
                                    "Plugin data management.",
                                    "authguard"
                                )}
                            </Paragraph>
                        </Skeleton>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <Select
                            noLabel
                            value={localValues?.delete_data_on || 'none'}
                            optionList={[
                                { label: __("None", "authguard"), value: "none" },
                                { label: __("Delete", "authguard"), value: "delete" },
                                { label: __("Deactivate", "authguard"), value: "deactivate" },
                            ]}
                            onChange={(value) => handleChange('delete_data_on', value)}
                        />
                    </Col>
                </Row>
            </div>

            <div className="setting-unit pt-4">
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={12} xl={14}>
                        <Title heading={4}>
                            {__("Reset Plugin", "authguard")}
                        </Title>
                        <Paragraph>
                            {__("Reset Plugin to it's default settings", "authguard")}
                        </Paragraph>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <Popconfirm
                            title={__("Are you sure you want to proceed?", "authguard")}
                            onConfirm={handleClick}
                        >
                            <Button
                                type="danger"
                                icon={<IconRefresh />}
                                loading={processing}
                            >
                                {processing
                                    ? __("Resetting...", "authguard")
                                    : __("Reset All", "authguard")}
                            </Button>
                        </Popconfirm>
                    </Col>
                </Row>
            </div>

            <ActionButtons
                hasChanges={hasChanges}
                section="tools"
                handleReset={handleReset}
                onSave={onSave}
            />
        </>
    );
};

export default Tools;
