import { __ } from "@wordpress/i18n";
import { useCallback, useEffect, useState } from 'react';
import { formDataPost } from "../../lib/Helpers"; // Import utility function
import './PluginCard.css';
import { Space, Tag, Typography } from '@douyinfe/semi-ui';
import {IconHistogram} from '@douyinfe/semi-icons';
import { Rating } from '@douyinfe/semi-ui';
import {WordPress} from '../../lib/Illustrations';
export default function PluginCard(plugin) {
    const {image, name, intro, author, plugin_source='internal', plugin_slug='', plugin_file='', download_url='', version='1.0.0', rating='0', num_ratings='0', active_installs='0', tested} = plugin;
    const { Text, Paragraph, Title } = Typography;
    /*
    data-sub_action="install_activate" 
    data-plugin_source="external" 
    data-download_url="https://github.com/mostak-shahid/mos-woocommerce-protected-categories/archive/refs/heads/main.zip"
    data-plugin_slug="mos-woocommerce-protected-categories-main" 
    data-plugin_file="mos-woocommerce-protected-categories.php" 

    data-sub_action="install_activate"  
    data-plugin_source="internal" 
    data-plugin_slug="mos-product-specifications-tab"
    */
    const [pluginStatus, setPluginStatus] = useState("checking");
    const [errorMessage, setErrorMessage] = useState("");

    // Check plugin status on component mount
    const checkPluginStatus = useCallback(async () => {
        setPluginStatus("checking");
        setErrorMessage("");
        try {
            const result = await formDataPost('authguard_ajax_plugins_status', {
                file:plugin_file,
            });
            // console.log("Result:", result); // check structure here
            setPluginStatus(result?.data?.success_message); // Fix this line based on actual response
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            // setPluginStatusLoading(false);
        }
    }, [plugin_file]);

    useEffect(() => {
        checkPluginStatus();
    }, [checkPluginStatus, plugin_slug]);

    const handlePlugin = async () => {              
        // setProcessing(true);     
        // setActionError(null);   
        // setStatus(status === 'not_active'?'activating':'installing')         
        // try {
        //     const result = await formDataPost('authguard_ajax_install_plugins', {
        //         sub_action:sub_action,
        //         download_url:download_url,                
        //         plugin_slug:plugin_slug,
        //         plugin_file:plugin_file,
        //         plugin_source:plugin_source,
        //     }); 
        //     console.log("Result:", result); // check structure here
        //     setStatus(result.data)
        // } catch (error) {
        //     setActionError(error.message);
        // } finally {
        //     setProcessing(false);
        //     // setStatus(status === 'activating'?'active':'not_active') 
        // }
    };
    
    
    const getButtonLabel = () => {
        switch (pluginStatus) {
            case "checking":
                return __("Checking...", "authguard");
            case "not_installed":
                return __("Install Now", "authguard");
            case "installed":
                return __("Activate", "authguard");
            case "installing":
                return __("Installing...", "authguard");
            case "installation_complete": // New state
                return __("Installed", "authguard");
            case "activating":
                return __("Activating...", "authguard");
            case "activated":
                return __("Activated", "authguard");
            case "error":
                return __("Try Again", "authguard");
            default:
                return __("Install Now", "authguard");
        }
    };
    const handleButtonClick = () => {
		switch (pluginStatus) {
			case "not_installed":
				installPlugin();
				break;
			case "installed":
				activatePlugin();
				break;
			case "error":
				checkPluginStatus();
				break;
			default:
				break;
		}
	};       
    
    const installPlugin = async () => {
        setPluginStatus("installing");
        setErrorMessage("");
        try {
            await formDataPost('authguard_ajax_install_plugins', {
                sub_action:'install',
                download_url:download_url,                
                plugin_slug:plugin_slug,
                plugin_file:plugin_file,
                plugin_source:plugin_source,
            }); 
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setPluginStatus("installed"); 
        }
    };

    const activatePlugin = async () => {
        setPluginStatus("activating");
        setErrorMessage("");        
        try {
            await formDataPost('authguard_ajax_install_plugins', {
                sub_action:'activate',
                download_url:download_url,                
                plugin_slug:plugin_slug,
                plugin_file:plugin_file,
                plugin_source:plugin_source,
            }); 
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setPluginStatus("activated"); 
        }
    };
    const isButtonDisabled = ["checking", "installing", "activating","installation_complete"].includes(
		pluginStatus,
	);
    return (
        <div className="authguard-plugin-card p-4">
            <Space align='center'>
                <img
                    alt={name}
                    src={image}
                    style={{flex: '0 0 80px', maxWidth: '80px'}} 
                />
                <div>
                    <a href={`https://wordpress.org/plugins/${plugin_slug}/`} target="_blank"><Title heading={6} style={{fontSize: 18, marginBottom: 0}} >{name}</Title></a>
                    <Space align='center'>
                        <Rating allowHalf defaultValue={(rating/20).toFixed(2)} disabled/>   
                        <Text type="quaternary">({num_ratings})</Text>
                    </Space> 
                </div>
            </Space>
            {/* <Paragraph ellipsis={{ showTooltip: true }} style={{ maxWidth: 250 }}>{intro}</Paragraph> */}
            <div className="mt-3">
                <Paragraph>{intro}</Paragraph>
            </div>
            <div className="flex justify-between mt-2">
                <span dangerouslySetInnerHTML={{__html: author}}/>
                <Tag color='green' size='large'>{version}</Tag>
            </div>
            <div className="flex justify-between mt-1">
                <Space align='center'><IconHistogram style={{fontSize: 24}} /><span>{__(`${active_installs} ${active_installs>0?"+":""} active installations`, "authguard")}</span></Space>
                <Space align='center'><WordPress width='24' height='24'/> {__(`Tested with ${tested}`, "authguard")}</Space>
            </div>
            
        </div>
    )
}
