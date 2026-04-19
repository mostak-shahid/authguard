import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { Switch, Select, Input, Typography, Space, Popover} from '@douyinfe/semi-ui';
import {capitalizeWords} from '../../lib/Helpers';
// import { ColorIndicator, ColorPalette, GradientPicker, Popover, TabPanel, } from '@wordpress/components';
import {ColorPickerControl, UnitControl} from '../../components';
import { FONT_SIZES } from '../../lib/Constants';
const sanitizeDefaults = (value) => (
    value && typeof value === 'object' ? value : {}
);
const SELECT_OPTIONS = {
    "font-weight": [100,200,300,400,500,600,700,800,900],
    "font-style": ["normal", "italic", "oblique"],
    "font-variant": ["normal", "small-caps"],
    "font-stretch": ["normal", "condensed", "expanded"],
    "text-align": ["left", "right", "center", "justify"],
    "text-decoration": ["none", "underline", "overline", "line-through"],
    "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
};
const units = [
    { value: '', label: __('None', 'authguard') },
    { value: 'px', label: 'px' },
    { value: '%', label: '%' },
    { value: 'em', label: 'em' },
    { value: 'rem', label: 'rem' },
    { value: 'vw', label: 'vw' },
];
const FontControl = ({defaultValues = {}, name, handleChange, className=''}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState(() => ({ ...sanitizeDefaults(defaultValues) }));

    useEffect(() => {
        setValues({ ...sanitizeDefaults(defaultValues) });
    }, [defaultValues]);

    const updateValue = useCallback((option, value) => {
        setValues(prev => {
            const updated = { ...prev, [option]: value };
            handleChange(name, updated);
            return updated;
        });
    }, [handleChange, name]);

    const enableFont = Boolean(values.enabled);
    const options = ["font-family", "color", "font-size", "font-weight", "font-style", "font-variant", "font-stretch", "text-align", "text-decoration", "text-transform", "line-height", "letter-spacing", "word-spacing", ];

    return (
        <>
            <div className={`font-wrapper ${className}`}>
                <Space align='center'>
                    <Switch 
                        aria-label={__('Enable Font Options', 'authguard')}
                        checked={enableFont}
                        onChange={(enabled) => updateValue('enabled', enabled)}
                    />
                    <Typography.Title heading={6} style={{ margin: 8 }}>
                        {enableFont ? __('Enabled', 'authguard') : __('Disabled', 'authguard')}
                    </Typography.Title>
                </Space>  
                {
                    enableFont && 
                        <>
                            {options.map((option) => (
                                <div key={option} className={`mb-2 from-group from-group-${option} col-${(option === 'color' || option === 'font-size') ? '12' : '6'}`}>
                                    
                                    {/* font-family → text input */}
                                    {
                                        option === "color" ? (
                                            <div className='mb-2'>
                                                <ColorPickerControl
                                                    defaultValue={values[option] || "#000000"}
                                                    label={__('Font Color', 'authguard')}
                                                    handleChange={(value) => updateValue(option, value)}
                                                    mode='color'
                                                /> 
                                            </div>
                                        ) : option === "font-size" ? 
                                        (
                                            <UnitControl
                                                label={__('Size', 'authguard')}
                                                onChange={(value) => updateValue(option, value)}
                                                value={values[option]}
                                                units={units}
                                                min={1}
                                                step={1}
                                                className="w-full"
                                            />
                                        ) : (
                                            option === "font-weight" || 
                                            option === "font-style" || 
                                            option === "text-align" || 
                                            option === "text-transform" ||
                                            option === "text-decoration" ||
                                            option === "font-variant" || 
                                            option === "font-stretch" 
                                        ) ?
                                        (
                                            <>
                                                <label className='font-semibold block'><Typography.Text>{capitalizeWords(option.replace('-', ' '))}</Typography.Text></label>
                                                <Select
                                                    placeholder={option.replace('-', ' ')}
                                                    // label={option}
                                                    value={ values[option] || "" }
                                                    // optionList={ SELECT_OPTIONS[option].map(val => {
                                                    //     const valStr = String(val);
                                                    //     return {
                                                    //         label: __(valStr.charAt(0).toUpperCase() + valStr.slice(1), 'authguard'),
                                                    //         value: valStr,
                                                    //     };
                                                    // })}
                                                    optionList={SELECT_OPTIONS[option]?.map((val) => ({ label: val, value: val })) || []}
                                                    onChange={(value) => updateValue(option, value)}
                                                    style={{width: '100%'}}
                                                /> 
                                            </>
                                        ) : (option === "line-height") ? 
                                        (
                                            <UnitControl
                                                label={__('Line Height', 'authguard')}
                                                onChange={(value) => updateValue(option, value)}
                                                value={values[option]}
                                                units={units}
                                                min={0.8}
                                                max={3}
                                                step={0.1}
                                                className="w-full"
                                            />
                                        ) : 
                                        (
                                            <>                                            
                                                <label className='font-semibold block'><Typography.Text>{capitalizeWords(option.replace('-', ' '))}</Typography.Text></label>                                                
                                                <Input
                                                    value={values[option] || ""}
                                                    onChange={(e) => updateValue(option, e.target.value)}
                                                    className="form-control"
                                                />
                                            </>
                                        )
                                    }
                                </div>
                            ))}                    
                        </>
                }        
            </div>
        </>
    );
}
export default FontControl;
/*
// Uses
<FontControl 
    defaultValues={settingData?.customizer?.redesign?.fields?.label_font}
    name='customizer.redesign.fields.label_font' 
    handleChange={handleChange}
    options = {["color", "font-size", "font-weight", "font-style", "font-variant", "font-stretch", "text-align", "text-decoration", "text-transform" ]}
/> 
Core Font Attributes:
font-family: Specifies the typeface to be used. Multiple font names can be provided as a fallback system, e.g., font-family: "Arial", sans-serif;.
font-size: Sets the size of the text. Values can be absolute (e.g., px, pt) or relative (e.g., em, rem, %).
font-weight: Controls the thickness or boldness of the font. Values include keywords like normal, bold, bolder, lighter, or numerical values from 100 to 900.
font-style: Determines the slant of the text, typically normal, italic, or oblique.
font-variant: Specifies whether a text should be displayed in a small-caps font (normal or small-caps). 
line-height: Sets the distance between lines of text.
font-stretch: Allows for the adjustment of the font's width, with values like normal, condensed, expanded, etc.

Additional Font-Related Attributes:
letter-spacing: Adjusts the spacing between characters.
word-spacing: Modifies the spacing between words.
text-align: Controls the horizontal alignment of text within its container (e.g., left, right, center, justify).
text-decoration: Adds decorative lines to text, such as underline, overline, or line-through.
text-transform: Controls the capitalization of text (e.g., uppercase, lowercase, capitalize).
color: Sets the color of the text.

Shorthand Property:
The font shorthand property allows for setting multiple font-related attributes in a single declaration, following a specific order: font-style font-variant font-weight font-stretch font-size/line-height font-family. For example:
//font: italic small-caps bold 16px/1.5 "Times New Roman", serif;
*/