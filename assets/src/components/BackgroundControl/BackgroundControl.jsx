import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import {ColorPickerControl, MediaUploaderControl} from '../../components';
import { Select, Typography, Space, Row, Col, Button} from '@douyinfe/semi-ui';
import {capitalizeWords} from '../../lib/Helpers';
const SELECT_OPTIONS = {
    position: ["left top", "left center", "left bottom", "center top", "center", "center bottom", "right top", "right center", "right bottom"],
    size: ["auto", "cover", "contain"],
    repeat: ["repeat", "repeat-x", "repeat-y", "no-repeat"],
    origin: ["padding-box", "border-box", "content-box"],
    clip: ["border-box", "padding-box", "content-box", "text"],
    attachment: ["scroll", "fixed", "local"],
};

const BackgroundControl = ({defaultValues = {}, name, handleChange, className=''}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState(() => (
        defaultValues && typeof defaultValues === 'object' ? { ...defaultValues } : {}
    ));

    useEffect(() => {
        setValues(defaultValues && typeof defaultValues === 'object' ? { ...defaultValues } : {});
    }, [defaultValues]);

    const updateValue = useCallback((option, value) => {
        setValues(prev => {
            const updated = { ...prev, [option]: value };
            handleChange(name, updated);
            return updated;
        });
    }, [handleChange, name]);

    const handleImageChange = useCallback((_, value) => {
        setValues(prev => {
            const updated = { ...prev, image: value };
            handleChange(name, updated);
            return updated;
        });
    }, [handleChange, name]);

    const imageData = values?.image && typeof values.image === 'object'
        ? values.image
        : { id: 0, url: '', thumbnail: '' };
    const options = Array.isArray(defaultValues?.options) && defaultValues.options.length > 0
        ? defaultValues.options
        : ["color", "image", "position", "size", "repeat", "origin", "clip", "attachment"];
    return (
        <>
            <div className={`background-wrapper ${className}`}>
                <Row type="flex" gutter={[16, 16]}>
                    {options.map((option) => (
                        <Col xs={24} lg={option === "color" || option === "image" ? 24 : 12} key={option}>
                            {/* color → color picker */}
                            {option === "color" && (
                                <Space className='justify-between' style={{width: '100%'}} align='center'>
                                    <ColorPickerControl
                                        defaultValue={values[option]}
                                        handleChange={(value) => updateValue(option, value)}
                                        mode='both'
                                        // label={__("Background Color", "authguard")}
                                        label=''
                                    />
                                    <Button
                                        theme='outline'
                                        type='primary'
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        {__("More +", "authguard")}
                                    </Button>
                                </Space>

                            )}
                            {isOpen && (
                                <>
                                    {/* image → external component */}
                                    {option === "image" &&  (
                                        <MediaUploaderControl 
                                            data={imageData} 
                                            name={`${name}.image`}
                                            handleChange={handleImageChange}
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
                                    )}
                                    {/* rest → select dropdown */}
                                    {option !== "color" && option !== "image" && (  
                                        <>                            
                                            <label className='font-semibold block mb-1'><Typography.Text>{capitalizeWords(option)}</Typography.Text></label>
                                            <Select
                                                placeholder={option.toUpperCase()}
                                                // label={option}
                                                value={ values[option] || "" }
                                                optionList={SELECT_OPTIONS[option]?.map((val) => ({ label: val, value: val })) || []}
                                                onChange={(value) => updateValue(option, value)}
                                                style={{width: '100%'}}
                                            />  
                                        </>                               
                                    )} 
                                </>
                            )}
                        </Col>
                    ))}                    
                </Row>
            </div>
        </>
    );    
}
export default BackgroundControl;