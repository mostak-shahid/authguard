
import { __ } from "@wordpress/i18n";
import { useMemo } from "react";
import { Card, Breadcrumb } from '@douyinfe/semi-ui';


/**
 * Generate breadcrumb items from a pathname and menu structure
 * @param {string} pathname - Current route pathname
 * @param {Array} menuData - Menu data structure
 * @returns {Array} Array of breadcrumb items with { name, path, href }
 */
const generateBreadcrumbs = (pathname, menuData) => {
    const breadcrumbs = [
        {
            name: __("Home", "authguard"),
            href: '#/',
            path: '/'
        }
    ];

    // Helper function to find menu item and build breadcrumb path
    const findInMenu = (items, path, parentCrumbs = []) => {
        for (const item of items) {
            // Skip items with invalid URLs
            if (!item.url || item.url === '#' || item.url.startsWith('http')) {
                continue;
            }

            // Check if current item matches the path
            if (path === item.url || path.startsWith(item.url + '/')) {
                const currentCrumbs = [...parentCrumbs, {
                    name: item.text,
                    path: item.url,
                    href: item.url
                }];

                // If exact match, return
                if (path === item.url) {
                    return currentCrumbs;
                }

                // If has submenu, search in submenu
                if (item.items && item.items.length > 0) {
                    const subResult = findInMenu(item.items, path, currentCrumbs);
                    if (subResult) {
                        return subResult;
                    }
                }

                // If path starts with this url but no exact match found in submenu,
                // return what we have so far
                return currentCrumbs;
            }

            // Search in submenu even if parent doesn't match
            if (item.items && item.items.length > 0) {
                const subResult = findInMenu(item.items, path, [...parentCrumbs, {
                    name: item.text,
                    path: item.url,
                    href: item.url
                }]);
                if (subResult) {
                    return subResult;
                }
            }
        }
        return null;
    };

    // Find breadcrumbs in menu structure
    const foundCrumbs = findInMenu(menuData, pathname);

    if (foundCrumbs && foundCrumbs.length > 0) {
        breadcrumbs.push(...foundCrumbs);
    }

    return breadcrumbs;
};
const BreadcrumbControl = ({ menu=[], url='', className='', style = {} }) => {

    // Generate breadcrumbs based on current path and menu structure
    const breadcrumbItems = useMemo(() => {
        // Add safety check for menuData
        if (!menu || menu.length === 0) {
            return [];
        }
        return generateBreadcrumbs(url, menu);
    }, [url, menu]);

    // Don't render if no breadcrumb items
    if (breadcrumbItems.length === 0) {
        return null;
    }

    // // Default style
    // const defaultStyle = {
    //     marginBottom: '24px',
    //     padding: '12px 16px',
    //     backgroundColor: 'var(--semi-color-bg-3)',
    //     //borderRadius: '4px',
    // // boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    //     ...style
    // };

    return (
        <Card className={`mb-6 ${className}`} style={style}>
            <Breadcrumb
                // style={defaultStyle}
                routes={breadcrumbItems.map(item => ({
                    name: item.name,
                    path: item.path
                }))}
            />
        </Card>
    );
};

export default BreadcrumbControl;