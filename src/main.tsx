import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono';
import 'reset-css/reset.css';
import { App } from './components/App';

import './styles/main.scss';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
