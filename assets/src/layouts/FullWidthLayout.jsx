import { Layout, } from '@douyinfe/semi-ui';

import {useSettingsBodyHeight} from '../lib/Helpers';

const { Header, Sider, Content } = Layout;

const FullWidthLayout = ({ children, sidebar, sidebarPosition='none', className='' }) => {
    return (
        <Layout className={className} style={{ minHeight: useSettingsBodyHeight() }}>
            {sidebarPosition === 'left' &&
                <Sider style={{ backgroundColor: 'var(--semi-color-bg-2)' }}>
                    {sidebar}
                </Sider>            
            }
            <Content style={{ padding: '24px' }}>
                {children}
            </Content>
            {sidebarPosition === 'right' &&
                <Sider style={{ backgroundColor: 'var(--semi-color-bg-2)' }}>
                    {sidebar}
                </Sider>            
            }
        </Layout>
    );
};

export default FullWidthLayout;