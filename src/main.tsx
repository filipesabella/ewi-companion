import * as React from 'react';
import { createRoot } from 'react-dom/client';
import 'reset-css/reset.css';
import 'typeface-barlow/index.css';
import { App } from './components/App';

import './styles/main.scss';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
