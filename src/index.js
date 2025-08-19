import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './font/style.css';
import App from './components/App';
import {levels} from "./levels";

ReactDOM.render(<App levels={levels} />, document.getElementById('root'));

