import { Layout, } from '@douyinfe/semi-ui';

import {useSettingsBodyHeight} from '../lib/Helpers';
const { Header, Sider, Content } = Layout;

const BoxedLayout = ({ children, sidebar, sidebarPosition='none', className='' }) => {
    return (
        <Layout style={{ minHeight: useSettingsBodyHeight() }} className={`container mx-auto ${className}`}>
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

export default BoxedLayout;