import { __ } from "@wordpress/i18n";

import { Row, Col, Select, Typography,  Input, Skeleton, Switch, Button } from '@douyinfe/semi-ui';
import React, {Suspense} from 'react';
import { BackgroundControl, BoxShadowControl, ColorPickerControl, FontControl, MediaUploaderControl, MultiColorControl, SkeletonPlaceholder, TextShadowControl, UnitControl } from '../components';
const units = [
    { value: 'px', label: 'px' },
    // { value: '%', label: '%' },
    // { value: 'em', label: 'em' },
    // { value: 'rem', label: 'rem' },
    // { value: 'vw', label: 'vw' },
];
const RemoteLoginForm = React.lazy(() => import("authguardpro/LoginForm"));
const RemoteRegistrationForm = React.lazy(() => import("authguardpro/RegistrationForm"));
const Page = () => {
    const settingLoading = false;
    const settingData = {};
    const { Title, Text, Paragraph } = Typography;
    return (
        <>
            {/* {console.log('settingData in tools page', settingData)} */}
            {/* <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("Delete all the plugin data upon", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <Select 
                                className="w-full"
                                placeholder={__("Action type", "authguard")} 
                                value={ settingData?.tools.delete_data_on }
                                //delete, unstall, none
                                optionList={ [
                                    { label: 'None', value: 'none' },
                                    { label: 'Delete', value: 'delete' },
                                    { label: 'Unstall', value: 'unstall' },
                                ] }
                                onChange={ ( changedValue ) => handleChange('tools.delete_data_on', changedValue ) }
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("BackgroundControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <BackgroundControl
                                defaultValues={settingData?.page?.background}
                                name="page.background"
                                handleChange={handleChange}
                            />  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("BoxShadowControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <BoxShadowControl
                                value={settingData?.page?.boxshadow}
                                onChange={(value) => handleChange('page.boxshadow', value)}
                                // className="border-start border-end border-bottom"
                            />  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("Color", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <ColorPickerControl                                
                                defaultValue={settingData?.page?.color}
                                handleChange={(value) => handleChange('page.color', value)}
                                mode='color'
                                label={__("Color", "authguard")}
                            />  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("Gradient", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <ColorPickerControl                                
                                defaultValue={settingData?.page?.gradient}
                                handleChange={(value) => handleChange('page.gradient', value)}
                                mode='gradient'
                                label={__("Gradient", "authguard")}
                            />  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("Color & Gradient", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <ColorPickerControl                                
                                defaultValue={settingData?.page?.gradient}
                                handleChange={(value) => handleChange('page.gradient', value)}
                                mode='both'
                                label={__("Color & Gradient", "authguard")}
                            />  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("FontControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <FontControl 
                                defaultValues={settingData?.page?.font}
                                name='page.font' 
                                handleChange={handleChange}
                            />  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("TextShadowControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <TextShadowControl 
                                value={settingData?.page?.textshadow}
                                onChange={(value) => handleChange('page.textshadow', value)}/>  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("MultiColorControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <MultiColorControl 
                                options={['primary', 'secondary', 'tertiary']}
                                defaultValues={settingData?.page?.multicolor}
                                name='page.multicolor'
                                handleChange={handleChange}/>  
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("MediaUploaderControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>
                            <MediaUploaderControl 
                                    data={settingData?.page?.media_uploader} 
                                    name={'page.media_uploader'}
                                    handleChange={handleChange}
                                    options = {{
                                        frame:{
                                            title: __("Select or Upload Image", "authguard"),
                                        },
                                        library: {type: 'image'},
                                        buttons: {
                                            upload: __("Upload Image", "authguard"),
                                            remove: __("Remove", "authguard"),
                                            select: __("Use this image", "authguard")                                            
                                        }
                                    }}
                                /> 
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row type="flex" gutter={[24, 24]}>
                    <Col xs={24} lg={12} xl={14}>
                        <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                            <Title heading={4}>{__("UnitControl", "authguard")}</Title>
                            <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                        </Skeleton>
                    </Col>    
                    {
                        !settingLoading &&                               
                        <Col xs={24} lg={12} xl={10}>                            
                            <UnitControl
                                label={__('UnitControl', 'authguard')}
                                onChange={(value) => handleChange('page.unitcontrol', value)}
                                value={settingData?.page?.unitcontrol}
                                units={units}
                                className="w-full"
                            />
                        </Col>
                    }
                </Row>
            </div> */}
            <p>The below item is from pro</p>
            {authguard_ajax_obj.isPro &&            
                <div className="setting-unit py-4">
                    <Row type="flex" gutter={[24, 24]}>
                        <Col xs={24} lg={12} xl={14}>
                            <Skeleton placeholder={<SkeletonPlaceholder />} loading={settingLoading} active>
                                <Title heading={4}>{__("This is from pro", "authguard")}</Title>
                                <Paragraph>{__("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Delectus, odio.", "authguard")}</Paragraph>
                            </Skeleton>
                        </Col>    
                        {
                            !settingLoading &&                               
                            <Col xs={24} lg={12} xl={10}>
                                <Suspense fallback={<div>{__("Loading remote component...", "authguard")}</div>}>
                                    <RemoteLoginForm settingData={settingData} />
                                    <RemoteRegistrationForm settingData={settingData} />
                                </Suspense>
                            </Col>
                        }
                    </Row>
                </div>                            
            }
            <p>The avobe item is from pro</p>
        </>
    )
}
export default Page; 