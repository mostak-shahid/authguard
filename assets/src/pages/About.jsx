import { Card, Avatar, Space } from '@douyinfe/semi-ui';
import { IconGithubLogo, IconTwitter, IconFacebook } from '@douyinfe/semi-icons';
import {BoxedLayout} from '../layouts';

const About = () => {
    const sidebar = (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <Avatar size="extra-large" src="https://picsum.photos/150/150">U</Avatar>
            <h3 style={{ marginTop: '16px' }}>John Doe</h3>
            <Space style={{ marginTop: '16px' }}>
                <IconGithubLogo size="large" />
                <IconTwitter size="large" />
                <IconFacebook size="large" />
            </Space>
        </div>
    );

    return (
        <BoxedLayout sidebar={sidebar} sidebarPosition="left">
            <Card title="About">
                <p>This is the About page with left sidebar layout.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </Card>
        </BoxedLayout>
    );
};

export default About;