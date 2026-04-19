import { __ } from '@wordpress/i18n';
import {useState} from 'react';
import {ColorPickerControl, UnitControl} from '../../components';
import { Switch, Space, Typography } from '@douyinfe/semi-ui';
const units = [
    { value: 'px', label: 'px' },
    // { value: '%', label: '%' },
    // { value: 'em', label: 'em' },
    // { value: 'rem', label: 'rem' },
    // { value: 'vw', label: 'vw' },
];
const TextShadowControl = ({ value = {}, onChange, className='' }) => {
    const [shadow, setShadow] = useState(value);

    const update = (key, val) => {
        const newShadow = { ...shadow, [key]: val };
        setShadow(newShadow);
        onChange(newShadow);
    };

    return (
        <div className={`box-shadow-wrapper ${className}`}>

            <Space align='center'>
                <Switch 
                    aria-label={__('Enable Text Shadow', 'authguard')}
                    checked={!!shadow.enabled}
                    onChange={(enabled) => update('enabled', enabled)}
                />
                <Typography.Title heading={6} style={{ margin: 8 }}>
                    {shadow.enabled ? __('Enabled', 'authguard') : __('Disabled', 'authguard')}
                </Typography.Title>
            </Space>
            
            {shadow.enabled && (
                <Space vertical align='start' className='w-full'>
                    <UnitControl
                        label={__('Horizontal Offset (px)', 'authguard')}
                        onChange={(x) => update('x', x)}
                        value={shadow.x}
                        units={units}
                        className='w-full'
                    />
                    <UnitControl
                        label={__('Vertical Offset (px)', 'authguard')}
                        onChange={(y) => update('y', y)}
                        value={shadow.y}
                        units={units}
                        className='w-full'
                    />
                    <UnitControl
                        label={__('Blur (px)', 'authguard')}
                        onChange={(blur) => update('blur', blur)}
                        value={shadow.blur}
                        units={units}
                        className='w-full'
                    />
                    <ColorPickerControl
                        defaultValue={shadow.color || "#000000"}
                        handleChange={(color) => update('color', color)}
                        mode='color'
                        label={__('Shadow Color', 'authguard')}
                        className="w-full"
                    />                     
                </Space>
            )}
        </div>
    );
};

export default TextShadowControl;
//Usage Example
{/* <TextShadowControl
    value={attributes.textShadow}
    onChange={(textShadow) => setAttributes({ textShadow })}
/> */}