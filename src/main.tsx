import 'babel-polyfill';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import 'reset-css';
import { App } from './components/App';

import './styles/main.less';

require('typeface-barlow');

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App  />);
