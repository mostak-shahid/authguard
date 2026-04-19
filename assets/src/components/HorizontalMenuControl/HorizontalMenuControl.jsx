import { __ } from "@wordpress/i18n";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav, SideSheet, Button, } from '@douyinfe/semi-ui';
import { IconMenu, } from '@douyinfe/semi-icons';
import './HorizontalMenuControl.css';

export default function HorizontalMenuControl({items, breakpoint, headerContent={}, footerContent={}}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [isCollapse, setIsCollapse] = useState(window.innerWidth <= breakpoint);
    const [menuVisible, setMenuVisible] = useState(false);

    const [openKeys, setOpenKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            setIsCollapse(window.innerWidth <= breakpoint);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const path = location.pathname;
        const active = findActiveKeys(items, path);
        setSelectedKeys([active.selected]);
        setOpenKeys(active.openKeys);
    }, [location.pathname]);

    const findActiveKeys = (menuItems, path, parents = []) => {
        for (const item of menuItems) {

            // Match exact OR prefix
            if (item.url && (item.url === path || path.startsWith(item.url + '/'))) {
                return { selected: item.itemKey, openKeys: parents };
            }

            if (item.items) {
                const result = findActiveKeys(item.items, path, [...parents, item.itemKey]);
                if (result.selected) return result;
            }
        }
        return { selected: '', openKeys: [] };
    };


    const findItemByKey = (menuItems, key) => {
        for (const item of menuItems) {
            if (item.itemKey === key) return item;
            if (item.items) {
                const result = findItemByKey(item.items, key);
                if (result) return result;
            }
        }
        return null;
    };

    // --- Accordion utilities ---
    const findParentKeys = (menuItems, targetKey, parents = []) => {
        for (const item of menuItems) {
            if (item.itemKey === targetKey) return parents;
            if (item.items) {
                const found = findParentKeys(item.items, targetKey, [...parents, item.itemKey]);
                if (found.length > 0) return found;
            }
        }
        return [];
    };

    const isSameLevel = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((v, i) => v === b[i]);
    };

    // --- Shared handlers (horizontal stays as-is, vertical gets accordion) ---
    const handleOpenChange = (data, mode = 'horizontal') => {
        // console.log('handleOpenChange', data, mode);
        const keys = Array.isArray(data) ? data : data?.openKeys || [];

        if (mode === 'vertical') {
            // Accordion per level
            if (keys.length > openKeys.length) {
                const newlyOpenedKey = keys.find((k) => !openKeys.includes(k));
                const parentKeys = findParentKeys(items, newlyOpenedKey);
                const filteredKeys = openKeys.filter((k) => {
                    const parentOfK = findParentKeys(items, k);
                    return !isSameLevel(parentOfK, parentKeys);
                });
                setOpenKeys([...filteredKeys, newlyOpenedKey]);
            } else {
                setOpenKeys(keys);
            }
        } else {
            // Normal horizontal menu
            setOpenKeys(keys);
        }
    };

    const handleSelect = (data, mode = 'horizontal') => {
        // console.log('xxx');
        const itemKey = data?.itemKey;
        if (!itemKey) return;
        const found = findItemByKey(items, itemKey);

        if (mode === 'vertical' && found?.items?.length) {
            const isOpen = openKeys.includes(itemKey);
            const parentKeys = findParentKeys(items, itemKey);

            setOpenKeys((prev) => {
                const filtered = prev.filter((k) => {
                    const parentOfK = findParentKeys(items, k);
                    return !isSameLevel(parentOfK, parentKeys);
                });
                return isOpen ? filtered : [...filtered, itemKey];
            });
        } else if (found?.url) {
            navigate(found.url);
        }

        setSelectedKeys([itemKey]);
        setMenuVisible(false);
    };

    return (
        <>
            {isCollapse && breakpoint ? (
                // --- Mobile Header ---
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 16px',
                        backgroundColor: 'var(--semi-color-bg-1)',
                        borderBottom: '1px solid var(--semi-color-border)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {headerContent.logo}
                        <span style={{ marginLeft: 8, fontWeight: 600 }}>
                            {headerContent.text}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {footerContent}
                        <Button
                            icon={<IconMenu />}
                            type="tertiary"
                            onClick={() => setMenuVisible(true)}
                        />
                    </div>
                </div>
            ) : (
                // --- Desktop (Horizontal) ---
                <Nav
                    className="authguard-desktop-horizontal-menu"
                    mode="horizontal"
                    items={items}
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    onOpenChange={(data) => handleOpenChange(data, 'horizontal')}
                    onSelect={(data) => handleSelect(data, 'horizontal')}
                    // onClick={data => console.log('trigger onClick: ', data)}
                    header={headerContent}
                    footer={footerContent}
                    style={{backgroundColor:'var(--semi-color-bg-2)'}}
                />
            )}
            { breakpoint &&
                <SideSheet
                    placement="right"
                    visible={menuVisible}
                    onCancel={() => setMenuVisible(false)}
                    title={__("Menu", "authguard")}
                    closeOnEsc={true}
                    className="authguard-phone-horizontal-sidesheet"
                >
                    <Nav
                        className="authguard-phone-horizontal-menu"
                        mode="vertical"
                        items={items}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onOpenChange={(data) => handleOpenChange(data, 'vertical')}
                        onSelect={(data) => handleSelect(data, 'vertical')}
                        footer={{ collapseButton: false }}
                        style={{ width: '100%', height: '100%', borderRight: 'none' }}
                    />
                </SideSheet>
            }
            
        </>
    );
}
