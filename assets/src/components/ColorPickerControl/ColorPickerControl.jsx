import { useState, useEffect } from 'react';
import { GRADIENTS, COLORS } from '../../lib/Constants';
import { ColorIndicator, ColorPalette, GradientPicker, Popover, TabPanel, } from '@wordpress/components';
import { Typography, Space } from '@douyinfe/semi-ui';
import { IconCopy, IconTickCircle, } from '@douyinfe/semi-icons';
import './ColorPickerControl.css';

const DEFAULT_COLOR = '#ffffff';
const DEFAULT_GRADIENT =
    'linear-gradient(135deg, #ffffff 0%, #eaeaea 100%)';

const isGradient = (val) =>
    typeof val === 'string' && val.includes('gradient');

export default function ColorPickerControl({
    defaultValue,
    handleChange,
    mode = 'both',
    label = '',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(DEFAULT_COLOR);
    const [activeTab, setActiveTab] = useState('color');

    useEffect(() => {
        if (!defaultValue) {
            const initial =
                mode === 'gradient' ? DEFAULT_GRADIENT : DEFAULT_COLOR;
            setValue(initial);
            setActiveTab(mode === 'gradient' ? 'gradient' : 'color');
            return;
        }

        setValue(defaultValue);
        setActiveTab(isGradient(defaultValue) ? 'gradient' : 'color');
    }, [defaultValue, mode]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);

        if (tabName === 'color' && isGradient(value)) {
            setValue(DEFAULT_COLOR);
            handleChange(DEFAULT_COLOR);
        }

        if (tabName === 'gradient' && !isGradient(value)) {
            setValue(DEFAULT_GRADIENT);
            handleChange(DEFAULT_GRADIENT);
        }
    };

    const availableTabs = [];
    if (mode === 'color' || mode === 'both') {
        availableTabs.push({ name: 'color', title: 'Color' });
    }
    if (mode === 'gradient' || mode === 'both') {
        availableTabs.push({ name: 'gradient', title: 'Gradient' });
    }

    return (
        <div className={`color-picker-control ${className}`}>
            {label && (
                <label className="font-semibold block mb-1">
                    <Typography.Text>{label}</Typography.Text>
                </label>
            )}

            <Space className='semi-button-secondary semi-button-light p-[10px]'>
                <ColorIndicator className='cursor-pointer' colorValue={value}  onClick={() => setIsOpen(!isOpen)}/>
                <Typography.Text
                    // copyable
                    copyable = {{
                        content: value,
                        render: (copied, doCopy, config) => {
                            return (
                                <span onClick={doCopy} className='inline-block ml-1 cursor-pointer'>{copied ? <IconTickCircle /> : <IconCopy />}</span>
                            );
                        }
                    }}
                >
                    {value}
                </Typography.Text>
                {/* {label && (
                    <span className="color-picker-label ml-2 font-bold">
                        {label}
                    </span>
                )} */}
            </Space>

            {isOpen && (
                <Popover
                    className="color-picker-popover"
                    onClose={() => setIsOpen(false)}
                >
                    <TabPanel
                        className="color-gradient-tabs"
                        tabs={availableTabs}
                        activeClass="active-tab"
                        initialTabName={activeTab}
                        onSelect={handleTabChange}
                    >
                        {(tab) => (
                            <>
                                {tab.name === 'color' && (
                                    <ColorPalette
                                        colors={COLORS}
                                        value={value}
                                        onChange={(color) => {
                                            setValue(color);
                                            handleChange(color);
                                        }}
                                        enableAlpha
                                        asButtons
                                    />
                                )}

                                {tab.name === 'gradient' && (
                                    <GradientPicker
                                        value={value}
                                        gradients={GRADIENTS}
                                        onChange={(gradient) => {
                                            setValue(gradient);
                                            handleChange(gradient);
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </TabPanel>
                </Popover>
            )}
        </div>
    );
}
