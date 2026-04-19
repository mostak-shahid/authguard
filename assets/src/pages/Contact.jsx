import { useState } from 'react';
import {BoxedLayout} from '../layouts';
import { Card, Form, Button, Toast } from '@douyinfe/semi-ui';

const Contact = () => {
    const [formData, setFormData] = useState({});

    const handleSubmit = (values) => {
        // In a real app, you'd save to backend
        // console.log('Form submitted:', values);
        Toast.success('Contact form submitted successfully!');
    };

    const sidebar = (
        <div style={{ padding: '24px' }}>
            <h3>Contact Details</h3>
            <div style={{ marginTop: '16px' }}>
                <p><strong>Phone:</strong></p>
                <p>+1 234 567 8900</p>
                <p style={{ marginTop: '16px' }}><strong>Email:</strong></p>
                <p>contact@example.com</p>
                <p style={{ marginTop: '16px' }}><strong>Address:</strong></p>
                <p>123 Main Street<br/>City, State 12345</p>
            </div>
        </div>
    );

    return (
        <BoxedLayout sidebar={sidebar} sidebarPosition='right'>
            <Card title="Contact Us">
                <Form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
                <Form.Input field="name" label="Name" placeholder="Enter your name" rules={[{ required: true }]} />
                <Form.Input field="email" label="Email" placeholder="Enter your email" rules={[{ required: true, type: 'email' }]} />
                <Form.TextArea field="message" label="Message" placeholder="Enter your message" rules={[{ required: true }]} />
                <Button type="primary" htmlType="submit">Submit</Button>
                </Form>
            </Card>
        </BoxedLayout>
    );
};

export default Contact;