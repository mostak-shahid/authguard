import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { useState, useEffect } from 'react';
import { Layout, Nav, Card, Notification } from '@douyinfe/semi-ui';
import {FullWidthLayout} from '../../layouts';
import { IconSetting, IconListView, IconUser, IconTemplate, IconCloud, IconPlusCircle, IconLikeThumb, IconHelpCircle, IconLikeHeart, IconUserAdd, IconSend, } from '@douyinfe/semi-icons';
import { Outlet, useLocation } from 'react-router-dom';
import menuItems from '../../data/menu.json';
import { getMenu } from '../../data/menu.js';
import {BreadcrumbControl, PageInfo, VerticalMenuControl} from "../../components";
import { Logo } from '../../lib/Illustrations';
const { Header, Sider, Content } = Layout;
import Details from '../../data/details.json';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsReload, setSettingsReload] = useState(0);
    const location = useLocation();
    useEffect(() => {
        const fetchSettings = async () => {
            setSettingsLoading(true);
            try {
                const data = await apiFetch({
                    path: "/authguard/v1/options",
                    method: 'GET'
                });
                if (data) {
                    setSettings(data);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setSettingsLoading(false);
            }
        };
        fetchSettings();
    }, [settingsReload]);

    const handleSubmit = async (section, values) => {
        try {
            const result = await apiFetch({
                path: "/authguard/v1/options",
                method: 'POST',
                data: { authguard_options: { ...settings, [section]: values } }
            });
            if (result.success) {
                setSettingsReload(Math.random());
                Notification.success({
                    title: __("Success", "authguard"),
                    content: __("Settings saved successfully!!!", "authguard"),
                    duration: 3,
                    position: 'topRight',
                });
            } else {
                Notification.error({
                    title: __("Error", "authguard"),
                    content: __("Error saving settings. Please try again.", "authguard"),
                    duration: 3,
                    position: 'topRight',
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            Notification.error({
                title: __("Error", "authguard"),
                content: __("Error saving settings. Please try again.", "authguard"),
                duration: 3,
                position: 'topRight',
            });
        } finally {
            setSettingsReload(prev => prev + 1);
        }
    };

    const handleReset = async (section) => {
        try {
            const result = await apiFetch({
                path: "/authguard/v1/options/reset-settings",
                method: 'POST',
                data: { name: section }
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
                Notification.error({
                    title: __("Error", "authguard"),
                    content: __("Error resetting settings. Please try again.", "authguard"),
                    duration: 3,
                    position: 'topRight',
                });
            }
        } catch (error) {
            console.error("Error resetting settings:", error);
            Notification.error({
                title: __("Error", "authguard"),
                content: __("Error resetting settings. Please try again.", "authguard"),
                duration: 3,
                position: 'topRight',
            });
        } finally {
            setSettingsReload(prev => prev + 1);
        }
    };


    const [proItems, setProItems] = useState([]);
    const [remoteItems, setRemoteItems] = useState([]);

    // Load MF remote menu array (NOT the React component)
    useEffect(() => {
        if (authguard_ajax_obj?.isPro) {
            import("authguardpro/MenuItems")
                .then((mod) => {
                    setProItems(mod.default || []);
                })
                .catch(() => {
                    console.warn("Pro menu could not be loaded.");
                    setProItems([]);
                });
        }
    }, []);
    
    // Optional: load remote injected menu items
    useEffect(() => {
        if (authguard_ajax_obj?.extraMenuItems) {
            setRemoteItems(authguard_ajax_obj.extraMenuItems);
        }
    }, []);

    // Icon mapping
    const iconMap = {
        'customizer': <IconTemplate />,
        'security': <IconUser />,
        'user-access': <IconUserAdd />,
        'data-logs': <IconListView />,
        'utilities': <IconSetting />,
        'feedback': <IconLikeThumb />,
        'page': <IconUser />,
        'layouts': <IconTemplate />,
        'basic-inputs': <IconSetting />,
        'array-inputs': <IconListView />,
        'import-export': <IconCloud />,
        'more': <IconPlusCircle />,
        'tools': <IconSetting />
    };

    // Get menu data from menu.js
    const menuData = getMenu({menuItems:menuItems, proItems: proItems, remoteItems:remoteItems});
    
    // Add icons to menu items
    const menuItemsWithIcons = menuData.map(item => ({
        ...item,
        icon: iconMap[item.itemKey] || <IconSetting />
    }));

    // Helper function to find menu item by key
    const findMenuItem = (items, key) => {
        for (const item of items) {
            if (item.itemKey === key) return item;
            if (item.items) {
                const found = findMenuItem(item.items, key);
                if (found) return found;
            }
        }
        return null;
    };
    const headerContent = {
        logo: <Logo width={36} height={36} />,
        text: Details?.name,
    };
    const footerContent = (
        <>
            {/* Your bottom menu */}
            <Nav 
                items= {[
                    {
                        itemKey: "vip",
                        text: __("VIP Priority Support", "authguard"),
                        icon: <IconSend />,
                        link: "https://wordpress.org/support/plugin/authguard/",
                        linkOptions: {
                            target: '_blank',
                            rel: 'noopener noreferrer', // recommended for security
                        },
                    },
                    {
                        itemKey: "help",
                        text: __("Help Center", "authguard"),
                        icon: <IconHelpCircle />,
                        link: "https://mostak-shahid.github.io/plugins/authguard.html",
                        linkOptions: {
                            target: '_blank',
                            rel: 'noopener noreferrer', // recommended for security
                        },
                    },
                    {
                        itemKey: "community",
                        text: __("Join the Community", "authguard"),
                        icon: <IconUserAdd />,
                        link: "https://www.facebook.com/mospressbd",
                        linkOptions: {
                            target: '_blank',
                            rel: 'noopener noreferrer', // recommended for security
                        },
                    },
                    {
                        itemKey: "rate",
                        text: __("Rate Us", "authguard"),
                        icon: <IconLikeHeart />,
                        link: "https://wordpress.org/support/plugin/authguard/reviews/",
                        linkOptions: {
                            target: '_blank',
                            rel: 'noopener noreferrer', // recommended for security
                        },
                    },
                ]}
                // onSelect={(data) => footerContentHandleSelect(data.selectedItems[0])}
                style={{ padding: 0, marginBottom: 0, border: 'none' }}
            />

            {/* Collapse Button */}
            {/* <Nav.Footer collapseButton={true} /> */}
        </>
    );
    
    const sidebar = (
        <>
            <VerticalMenuControl 
                items={menuItemsWithIcons}
                breakpoint={960}
                // headerContent={headerContent}
                footerContent={footerContent}
                className="settings-page-menu"
            />
        </>
    );

    return (
        <FullWidthLayout sidebar={sidebar} sidebarPosition="left">
            <Content>
                <BreadcrumbControl menu={menuItemsWithIcons} url={location.pathname} />
                <Card 
                    title={
                        <PageInfo menu={menuItemsWithIcons} url={location.pathname}  />
                    }
                    // title="Title"
                    headerLine={true}
                >
                    {/* {console.log(settings)} */}
                    <Outlet context={{ settings, settingsLoading, handleSubmit, handleReset }} />
                </Card>
            </Content>
        </FullWidthLayout>
    );
};

export default Settings;