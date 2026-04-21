import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { ColorPickerControl, UnitControl } from '../../components';
import { Select, Space, Typography } from '@douyinfe/semi-ui';

const units = [
    { value: 'px', label: 'px' },
];

const BORDER_STYLES = [
    { value: 'none', label: __('None', 'authguard') },
    { value: 'solid', label: __('Solid', 'authguard') },
    { value: 'dashed', label: __('Dashed', 'authguard') },
    { value: 'dotted', label: __('Dotted', 'authguard') },
    { value: 'double', label: __('Double', 'authguard') },
    { value: 'groove', label: __('Groove', 'authguard') },
    { value: 'ridge', label: __('Ridge', 'authguard') },
    { value: 'inset', label: __('Inset', 'authguard') },
    { value: 'outset', label: __('Outset', 'authguard') },
];

const BorderControl = ({
    defaultValues = {},
    borderRadiusValue = '',
    name,
    handleChange,
    options = [],
}) => {
    const [values, setValues] = useState(defaultValues);
    const [radius, setRadius] = useState(borderRadiusValue);

    useEffect(() => {
        setValues(defaultValues);
    }, [defaultValues]);

    useEffect(() => {
        setRadius(borderRadiusValue);
    }, [borderRadiusValue]);

    const updateBorder = (key, val) => {
        const updated = { ...values, [key]: val };
        setValues(updated);
        handleChange(name, updated);
    };

    const updateRadius = (val) => {
        setRadius(val);
        handleChange('border_radius', val);
    };

    const showWidth = options.length === 0 || options.includes('width');
    const showStyle = options.length === 0 || options.includes('style');
    const showColor = options.length === 0 || options.includes('color');
    const showRadius = options.length === 0 || options.includes('border_radius');

    return (
        <div className="border-control-wrapper">
            <Space vertical align='start' style={{ width: '100%' }}>
                {showWidth && (
                    <UnitControl
                        label={__('Border Width', 'authguard')}
                        onChange={(val) => updateBorder('width', val)}
                        value={values?.width}
                        units={units}
                        className="w-full"
                    />
                )}
                {showStyle && (
                    <div style={{ width: '100%' }}>
                        <label className="font-semibold block mb-1">
                            <Typography.Text>{__('Border Style', 'authguard')}</Typography.Text>
                        </label>
                        <Select
                            value={values?.style || 'none'}
                            onChange={(val) => updateBorder('style', val)}
                            optionList={BORDER_STYLES}
                            style={{ width: '100%' }}
                            placeholder={__('Select style', 'authguard')}
                        />
                    </div>
                )}
                {showColor && (
                    <ColorPickerControl
                        defaultValue={values?.color || '#000000'}
                        handleChange={(color) => updateBorder('color', color)}
                        mode='color'
                        label={__('Border Color', 'authguard')}
                        className="w-full"
                    />
                )}
                {showRadius && (
                    <UnitControl
                        label={__('Border Radius', 'authguard')}
                        onChange={updateRadius}
                        value={radius}
                        units={units}
                        className="w-full"
                    />
                )}
            </Space>
        </div>
    );
};

export default BorderControl;
