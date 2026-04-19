import React, { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import {
    Row,
    Col,
    Skeleton,
    Typography,
    Switch,
    Input,
} from "@douyinfe/semi-ui";

import { SkeletonPlaceholder, MediaUploaderControl } from "../components";

const { Title, Paragraph } = Typography;

const ProfileApp = () => {
    const [switchValue, setSwitchValue] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [mediaValue, setMediaValue] = useState({
        id: 0,
        url: '',
        thumbnail: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserMeta = async () => {
            try {
                const data = await apiFetch({
                    path: '/plugin-starter/v1/user-profile-meta',
                });
                setSwitchValue(data.plugin_starter_switch === '1' || data.plugin_starter_switch === true);
                setInputValue(data.plugin_starter_custom_input || '');
                setMediaValue(data.plugin_starter_media || { id: 0, url: '', thumbnail: '' });
            } catch (error) {
                console.error('Error fetching user meta:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserMeta();
    }, []);

    useEffect(() => {
        const switchHidden = document.getElementById('plugin_starter_switch_hidden');
        const inputHidden = document.getElementById('plugin_starter_custom_input_hidden');
        const mediaIdHidden = document.getElementById('plugin_starter_media_id_hidden');
        const mediaUrlHidden = document.getElementById('plugin_starter_media_url_hidden');

        if (switchHidden) {
            switchHidden.value = switchValue ? '1' : '0';
        }
        if (inputHidden) {
            inputHidden.value = inputValue;
        }
        if (mediaIdHidden) {
            mediaIdHidden.value = mediaValue.id || '0';
        }
        if (mediaUrlHidden) {
            mediaUrlHidden.value = mediaValue.url || '';
        }
    }, [switchValue, inputValue, mediaValue]);

    return (
        <>
            <div className="setting-unit py-4">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton
                            placeholder={<SkeletonPlaceholder />}
                            loading={loading}
                            active
                        >
                            <Title heading={4}>
                                {__(
                                    "Switch",
                                    "plugin-starter"
                                )}
                            </Title>
                            <Paragraph>
                                {__(
                                    "Switch to hide plugin from plugins list page. It can be useful when you want to prevent other users from deactivating or deleting plugin. You can still access plugin settings page by directly visiting the URL.",
                                    "plugin-starter"
                                )}
                            </Paragraph>
                        </Skeleton>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <Switch
                            checked={switchValue}
                            onChange={setSwitchValue}
                            loading={loading}
                        />
                    </Col>
                </Row>
            </div>

            <div className="setting-unit py-4">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton
                            placeholder={<SkeletonPlaceholder />}
                            loading={loading}
                            active
                        >
                            <Title heading={4}>
                                {__("Custom Input Field", "plugin-starter")}
                            </Title>
                            <Paragraph>
                                {__("Enter your custom value here. This field will be saved when you update your profile.", "plugin-starter")}
                            </Paragraph>
                        </Skeleton>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <Input
                            value={inputValue}
                            onChange={setInputValue}
                            placeholder={__("Enter value", "plugin-starter")}
                            disabled={loading}
                        />
                    </Col>
                </Row>
            </div>

            <div className="setting-unit py-4">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton
                            placeholder={<SkeletonPlaceholder />}
                            loading={loading}
                            active
                        >
                            <Title heading={4}>
                                {__("Profile Image", "plugin-starter")}
                            </Title>
                            <Paragraph>
                                {__("Upload a profile picture. This image will be saved when you update your profile.", "plugin-starter")}
                            </Paragraph>
                        </Skeleton>
                    </Col>

                    <Col xs={24} lg={12} xl={10}>
                        <MediaUploaderControl
                            data={mediaValue}
                            name="media_uploader"
                            handleChange={(name, value) => setMediaValue(value)}
                            options={{
                                frame: {
                                    title: __("Select or Upload Profile Image", "plugin-starter"),
                                },
                                library: { type: 'image' },
                                buttons: {
                                    upload: __("Upload Image", "plugin-starter"),
                                    remove: __("Remove Image", "plugin-starter"),
                                    select: __("Use this image", "plugin-starter"),
                                },
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default ProfileApp;