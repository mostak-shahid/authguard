import React from 'react';
import { InputGroup, InputNumber, Select, Typography } from '@douyinfe/semi-ui';

export default function UnitControl({
    label,
    value,
    onChange,
    units = [],
    className = '',
    min,
    max,
    step,
}) {
    // Parse value like "20px", "1.5rem", "100%"
    const parseValue = (val) => {
        if (!val) {
            return {
                number: null,
                unit: units[0]?.value || '',
            };
        }

        const match = val.toString().match(/^(-?\d*\.?\d+)([a-z%]*)$/i);

        return {
            number: match ? Number(match[1]) : null,
            unit: match?.[2] || units[0]?.value || '',
        };
    };

    const { number, unit } = parseValue(value);

    const handleNumberChange = (num) => {
        if (num === null || num === undefined) {
            onChange('');
            return;
        }
        onChange(`${num}${unit}`);
    };

    const handleUnitChange = (newUnit) => {
        if (number === null) {
            onChange('');
            return;
        }
        onChange(`${number}${newUnit}`);
    };

    return (
        <div
            className={`unit-control ${className}`}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        >
            {label && (
                <label className="font-semibold block">
                    <Typography.Text>{label}</Typography.Text>
                </label>
            )}

            <InputGroup style={{ width: '100%' }}>
                <InputNumber
                    value={number}
                    onChange={handleNumberChange}
                    placeholder="0"
                    min={min}
                    max={max}
                    step={step}
                    style={{ flex: 1 }}
                />

                <Select value={unit} onChange={handleUnitChange}>
                    {units.map((u) => (
                        <Select.Option key={u.value} value={u.value}>
                            {u.label}
                        </Select.Option>
                    ))}
                </Select>
            </InputGroup>
        </div>
    );
}
