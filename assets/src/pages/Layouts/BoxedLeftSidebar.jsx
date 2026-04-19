import { Card, Typography, Nav } from '@douyinfe/semi-ui';
import { IconStar, IconUser, IconUserGroup, IconSetting } from '@douyinfe/semi-icons';
import { BoxedLayout } from '../../layouts';
const { Title, Paragraph } = Typography;


const BoxedLeftSidebar = () => {
    const sidebar = (
        <>
            <Nav
                // bodyStyle={{ height: 320 }}
                style={{height: '100%'}}
                items={[
                    { itemKey: 'user', text: 'User Management', icon: <IconUser /> },
                    { itemKey: 'union', text: 'Union Center', icon: <IconStar /> },
                    {
                        itemKey: 'union-management',
                        text: 'Union Management',
                        icon: <IconUserGroup />,
                        items: ['Announcement Settings', 'Union Query', 'Entry Information']
                    },
                    {
                        text: 'Task Platform',
                        icon: <IconSetting />,
                        itemKey: 'job',
                        items: ['Task Management', 'User Task Query'],
                    },
                ]}
                onSelect={key => console.log(key)}
                header={{
                    logo: <img src="https://sf6-cdn-tos.douyinstatic.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/webcast_logo.svg" />,
                    text: 'Live Platform'
                }}
                footer={{
                    collapseButton: true,
                }}
            />
        </>
    );
    return (
        <BoxedLayout sidebarPosition="left" sidebar={sidebar}>     
            <Card title="Boxed Layout - Left Sidebar" headerLine={true}>
                <Title heading={3}>Boxed Layout with Left Sidebar</Title>
                <Paragraph>
                    This layout demonstrates a boxed container with a left sidebar for navigation.
                </Paragraph>
                <Paragraph>
                    Ideal for content that needs contextual navigation on the left side.
                </Paragraph>
            </Card>
        </BoxedLayout>
    );
};

export default BoxedLeftSidebar;