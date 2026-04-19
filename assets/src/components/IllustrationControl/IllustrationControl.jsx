import React, {useState, useEffect} from 'react';

/**
 * IllustrationControl Component
 * Automatically switches between light and dark mode images based on Semi Design theme
 * 
 * @param {React.ReactNode} image - Light mode illustration
 * @param {React.ReactNode} darkModeImage - Dark mode illustration
 * @param {React.CSSProperties} style - Inline styles
 * @param {string} className - Additional CSS classes
 */
const IllustrationControl = ({ 
    image, 
    darkModeImage, 
    style, 
    className = '' 
}) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const checkTheme = () => {
        const bodyMode = document.body.getAttribute('theme-mode');
        setIsDarkMode(bodyMode === 'dark');
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'theme-mode') {
                checkTheme();
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['theme-mode']
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div style={style} className={className}>
            {isDarkMode ? darkModeImage : image}
        </div>
    );
};

export default IllustrationControl;


// ============================================
// USAGE EXAMPLE
// ============================================

/*
import { IllustrationSuccess, IllustrationSuccessDark } from '@douyinfe/semi-illustrations';
import IllustrationControl from './IllustrationControl';

function MyComponent() {
    return (
        <IllustrationControl
            image={<IllustrationSuccess style={{ width: 150, height: 150 }} />}
            darkModeImage={<IllustrationSuccessDark style={{ width: 150, height: 150 }} />}
            style={{ width: 800, margin: '0 auto' }}
            className="my-custom-class"
        />
    );
}
*/