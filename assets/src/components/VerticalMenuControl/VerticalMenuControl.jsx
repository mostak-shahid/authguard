import { useState, useEffect } from 'react';
import { Nav, } from '@douyinfe/semi-ui';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerticalMenuControl({items=[], breakpoint, headerContent, footerContent, className=""}) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isCollapse, setIsCollapse] = useState(window.innerWidth <= breakpoint);
    const [openKeys, setOpenKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);

    useEffect(() => {
        const handleResize = () => setIsCollapse(window.innerWidth <= breakpoint);
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
            if (item.url === path) {
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

    const handleOpenChange = (data) => {
        const keys = Array.isArray(data) ? data : data?.openKeys || [];

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
    };

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

    const handleSelect = (data) => {
        const itemKey = data?.itemKey;
        if (!itemKey) return;
        const found = findItemByKey(items, itemKey);

        if (found?.items?.length) {
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
    };

    return (
        <Nav
            isCollapsed={isCollapse}
            items={items}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onSelect={handleSelect}
            onCollapseChange={setIsCollapse}
            {...(headerContent && { header: headerContent })}
            style={{height: '100%'}}
            className={className}
        >
            {footerContent && (
                <Nav.Footer style={{padding: 0, marginTop: 'auto'}}>
                    {footerContent}
                </Nav.Footer>
            )}
            {breakpoint && <Nav.Footer collapseButton={true} />}
        </Nav>
    );
}