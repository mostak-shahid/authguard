import React from "react";
import {
    //BrowserRouter,
    HashRouter
} from 'react-router-dom';
import apiFetch from '@wordpress/api-fetch';
import { createRoot } from "react-dom/client";
import App from "./App";

// CSS imports here — Tailwind's postcss-loader can scan all JSX
// files correctly because they're in the same module graph
import "./styles/tailwind.css";
import "./styles/index.css";

if (typeof window.wpApiSettings === 'undefined' && typeof authguard_ajax_obj !== 'undefined') {
    window.wpApiSettings = {
        root: authguard_ajax_obj.root,
        nonce: authguard_ajax_obj.nonce
    };
}

if (typeof window.wpApiSettings !== 'undefined') {
    apiFetch.use(apiFetch.createRootURLMiddleware(window.wpApiSettings.root));
    apiFetch.use(apiFetch.createNonceMiddleware(window.wpApiSettings.nonce));
}

const container = document.getElementById("authguard-settings-react-app");

if (container) {
    const root = createRoot(container);
    root.render(
        <HashRouter>
            <App />
        </HashRouter>
    );
} else {
    console.error("Target container '#authguard-settings-react-app' not found in the DOM.");
}