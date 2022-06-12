import React from 'react';
import ReactDOM from 'react-dom';
import './app/layout/styles.css';
import App from './app/layout/App';
import reportWebVitals from './reportWebVitals';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { store } from './app/store/configureStore';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export const history = createBrowserHistory();

ReactDOM.render(
    <React.StrictMode>           {/* must be included esp in dev mode to make sure we have no hidden errors */}
    <Router history={history}>   {/*must be included to add React-Router functionality to app*/}
      <Provider store={store}>   {/*now the whole app has access to redux store*/}
        <App />
      </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
