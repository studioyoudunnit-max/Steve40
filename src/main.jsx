import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import IconSprite from './IconSprite.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <IconSprite />
    <App />
  </>
);
