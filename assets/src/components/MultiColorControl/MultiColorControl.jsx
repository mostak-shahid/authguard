import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { Row, Col} from '@douyinfe/semi-ui';
import {ColorPickerControl} from '../../components';
const MultiColorControl = ({options, defaultValues = {}, name, handleChange}) => {
    // Initialize selected values with defaultValues
    const [values, setValues] = useState(defaultValues);

    const updateValue = (option, value) => {
        const updated = { ...values, [option]: value };
        setValues(updated);
        handleChange(name, updated);
    };
    return (
        <>
            <div className="multi-color-control-wrapper">
                <Row type="flex" gutter={[16, 16]}>
                    {options.map((option) => (
                        <Col xs={12} lg={8} key={option} className={`from-group from-group-${option}`}>
                            {/* color → color picker */}
                            {
                                <ColorPickerControl
                                    defaultValue={values[option] || "#000000"}
                                    handleChange={(value) => updateValue(option, value)}
                                    mode='color'
                                    label={`${option.charAt(0).toUpperCase() + option.slice(1)} Color`}
                                /> 
                            }
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}
export default MultiColorControl;