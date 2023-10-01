import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import MainApp from "./components/app/MainApp";
import "./index.css";
import store from './redux/store';

function App() {
    return (
        <MainApp/>
    )
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    </Provider>
);
