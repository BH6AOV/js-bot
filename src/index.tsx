import './common/es6-polyfill.js';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import CqPanel from './components/CqPanel';
import handler from './myhandler';

ReactDOM.render(<CqPanel initialHandler={handler}/>, document.getElementById('root'));
serviceWorker.unregister();