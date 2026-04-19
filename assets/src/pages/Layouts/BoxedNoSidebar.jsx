import { Card, Typography } from '@douyinfe/semi-ui';
import { BoxedLayout } from '../../layouts';
const { Title, Paragraph } = Typography;


const BoxedNoSidebar = () => {
    return (
        <BoxedLayout>     
            <Card title="Boxed Layout - No Sidebar" headerLine={true}>
                <Title heading={3}>Boxed Layout without Sidebar</Title>
                <Paragraph>
                    This layout demonstrates a boxed container with a right sidebar for navigation.
                </Paragraph>
                <Paragraph>
                    Ideal for content that needs contextual navigation on the right side.
                </Paragraph>
            </Card>
        </BoxedLayout>
    );
};

export default BoxedNoSidebar;