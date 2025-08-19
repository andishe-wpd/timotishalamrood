import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './font/style.css';
import App from './components/App';
import {levels} from "./levels";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App levels={levels} />);

