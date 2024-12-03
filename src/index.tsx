import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'urql';
import { client } from './api/client';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Provider value={client}>

        <App />
      </Provider>
    </React.StrictMode>,
  );
}
