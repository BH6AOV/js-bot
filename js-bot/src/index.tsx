import './common/es6-polyfill.js';
import React from 'react';
import ReactDOM from 'react-dom';
import CqPanel from './components/CqPanel';
import * as serviceWorker from './serviceWorker';
import * as handler from './myhandler';

ReactDOM.render(<CqPanel handler={handler}/>, document.getElementById('root'));
serviceWorker.unregister();