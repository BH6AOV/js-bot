import './common/es6-polyfill.js';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import CqPanel from './components/CqPanel';
import * as handler from './myhandler-ts';

ReactDOM.render(<CqPanel handler={handler}/>, document.getElementById('root'));
serviceWorker.unregister();