import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { unlockSound } from './shared/sound';
import './styles.css';

// trình duyệt chỉ cho phát tiếng sau khi người dùng bấm hoặc gõ phím
window.addEventListener('pointerdown', unlockSound);
window.addEventListener('keydown', unlockSound);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
