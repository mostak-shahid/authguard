import { __ } from "@wordpress/i18n";
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from 'react';
import {PluginCard} from "../../components";
import Details from '../../data/details.json';
import './Dashboard.css';
import {FullWidthLayout} from '../../layouts';
// import {
//     Card,
//     CardHeader,
//     CardBody,
// } from '@wordpress/components';
import { Typography, Card, Col, Row  } from '@douyinfe/semi-ui';
export default function Dashboard() {
    const { Text, Paragraph, Title } = Typography;
    const [plugins, setPlugins] = useState([]);
    const [pluginsLoading, setPluginsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchPlugins = async () => {
        try {
            // const response = await apiFetch({ path: 'https://raw.githubusercontent.com/mostak-shahid/update/refs/heads/master/plugin-details.json' });
            const response = await apiFetch({ path: `/authguard/v1/plugins` });
            // 
            setPlugins(response.plugins);
        } catch (error) {
            setError('Error fetching plugin data:', error);
        } finally {
            setPluginsLoading(false);
        }
        };
        fetchPlugins();
    }, []);
    
    return (
        <FullWidthLayout>
            <div className="">
                <Card
                    className="mb-6"
                >
                    <Title heading={2}>{__(`Welcome to ${Details?.name}`, "authguard")}</Title>
                    <Paragraph>
                        {__("Transform your WordPress login experience with AuthGuard - the ultimate login page customizer and security suite. Say goodbye to the default WordPress login screen and hello to a branded, professional authentication experience that matches your site's identity.", "authguard")}
                    </Paragraph>
                    <Paragraph>
                        {__("AuthGuard gives you complete control over your login, registration, and password reset pages with powerful visual customization tools while protecting your site with enterprise-grade security features like two-factor authentication, login attempt limiting, and custom login URLs.", "authguard")}
                    </Paragraph>
                </Card>
                <Row type="flex" gutter={[24,24]}>
                    <Col lg={16}>
                        <Card 
                            title={__("Features", "authguard")}
                            className="dashboard-features-card mb-6"
                        >
                            {/* {Object.values(settingsMenu).map((feature, index) => (
                                <div className="feature" key={index}>
                                    <Title heading={4}>{feature?.title}</Title>
                                    <Paragraph>{feature?.description}</Paragraph>
                                </div>
                            ))} */}
                            {/* {settingsMenu.map((feature) => (
                                <div className="feature" key={feature.itemKey}>
                                    <Title heading={4}>{feature.text}</Title>
                                    {feature.description && (
                                        <Paragraph>{feature.description}</Paragraph>
                                    )}
                                </div>
                            ))} */}
                            <Paragraph>{__("Customize every aspect of your login page with an intuitive visual editor. Choose from beautiful backgrounds including solid colors, gradients, images, or even video overlays. Style your logo with precise sizing and spacing, and personalize form fields with custom fonts, colors, and borders. The glass morphism effects add a modern, professional touch to make your login screen truly stand out.", "authguard")}</Paragraph>
                            <Paragraph>{__("Protect your site with comprehensive security features. Enable two-factor authentication (2FA) to add an extra verification layer via email codes. Limit login attempts to block brute force attacks with configurable thresholds and lockout durations. Hide your default login URL behind a custom path to keep bots and hackers away. Add math-based captcha challenges to prevent automated submissions.", "authguard")}</Paragraph>
                            <Paragraph>{__("Enhance user experience with smart login redirects based on user roles, automatic login functionality for password reset flows, and the option to force login by username, email, or both. The registration with password feature lets users set their password during signup instead of waiting for an email. Everything is backed by a clean, PSR-4 codebase with full REST API support for developers.", "authguard")}</Paragraph>
                        </Card>
                    </Col>
                    <Col lg={8}>
                        <Card
                            className="mb-6"
                            title={__("Get Support", "authguard")}
                        >
                            <Paragraph>
                                {__("Need help with setup or have questions? Our comprehensive documentation and community forums are here to assist you. For advanced issues, check out our detailed guides and troubleshooting tips.", "authguard")}
                            </Paragraph>
                            <Text link={{ href: 'https://wordpress.org/support/plugin/authguard/', target:"_blank" }}>{__("Support Forum", "authguard")}</Text>
                        </Card>

                        <Card
                            className="mb-6"
                            title={__("Documentation", "authguard")}
                        >
                            <Paragraph>
                                {__("Explore our complete documentation to unlock the full potential of AuthGuard. Learn about all customization options, security configurations, API endpoints, and advanced features. Step-by-step guides make it easy to get started and master every aspect of the plugin.", "authguard")}
                            </Paragraph>
                            <Text link={{ href: 'https://mostak-shahid.github.io/plugins/authguard.html', target:"_blank" }}>{__("View Docs", "authguard")}</Text>
                        </Card>
                        
                        <Card 
                            className="mb-6"
                            title={__("Join the Community", "authguard")}  
                        >                   
                            <Paragraph>
                                {__("Got a question about the plugin, want to share your awesome project or just say hi? Join our wonderful community!", "authguard")}                                    
                            </Paragraph>
                            <Text link={{ href: 'https://www.facebook.com/mospressbd', target:"_blank" }}>
                                {__("Join", "authguard")}
                            </Text>                            
                        </Card>
                        <Card
                            title={__("Rate Us", "authguard")} 
                        >
                            <Paragraph>
                                {__("We love to hear from you, we would appreciate every single review.", "authguard")}                                    
                            </Paragraph>
                            <Text link={{ href: 'https://wordpress.org/support/plugin/authguard/reviews/', target:"_blank" }}>
                                {__("Rate", "authguard")}
                            </Text>                            
                        </Card>
                    </Col>
                </Row>
            </div>
        </FullWidthLayout>
        
    )
}
