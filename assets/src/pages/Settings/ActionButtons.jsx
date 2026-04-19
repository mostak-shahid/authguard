import React from 'react'
import { __ } from "@wordpress/i18n";
import { Button } from '@douyinfe/semi-ui';
export default function ActionButtons({hasChanges, section, handleReset, handleSubmit, onSave, setSettingsReload}) {

    const onReset = () => {
        handleReset(section);
    };

    const onDiscard = () => {
        // window.location.reload();
        setSettingsReload(Math.random());
    };

    const onSaveClick = () => {
        if (onSave) {
            onSave();
        }
    };

    return (
        <div className='mt-6'>
            <Button 
                type="primary" 
                theme='solid'
                disabled={!hasChanges}
                onClick={onSaveClick}
            >
                {__('Save Settings', 'authguard')}
            </Button>
            <Button
                type="danger" 
                theme='solid'
                style={{ marginLeft: '12px' }}
                onClick={onReset}
            >
                {__('Reset', 'authguard')}
            </Button>
            {
                hasChanges && (
                    <>
                        <span style={{ marginLeft: '12px', color: '#faad14' }}>
                            {__('You have unsaved changes', 'authguard')}
                        </span>
                        <Button
                            type="tertiary" 
                            theme='solid'
                            style={{ marginLeft: '12px' }}
                            onClick={onDiscard}
                        >
                            {__('Discard Changes', 'authguard')}
                        </Button>
                    </>
                )
            }
        </div>
    )
}
