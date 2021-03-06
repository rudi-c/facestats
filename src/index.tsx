// Import React and React DOM
import * as React from 'react';
import { render } from 'react-dom';
// Import the Hot Module Reloading App Container – more on why we use 'require' below
// TODO: not working right now, but not needed for now
// const { AppContainer } = require('react-hot-loader');

// Redux stuff
import { reduce } from './actions'
import { defaultState } from "./state"
import { createStore } from 'redux'
import { Provider } from 'react-redux'

// Import our App container (which we will create in the next step)
import App from 'view/App';

// Tell Typescript that there is a global variable called module - see below
declare var module: { hot: any };

// Get the root element from the HTML
const rootEl = document.getElementById('app');

const store = createStore(reduce, defaultState);

// And render our App into it, inside the HMR App ontainer which handles the hot reloading
render(
  //<AppContainer>
    <Provider store={store}>
      <App />
    </Provider>,
  //</AppContainer>,
  rootEl
);

// Handle hot reloading requests from Webpack
if (module.hot) {
  module.hot.accept('./view/App', () => {
    // If we receive a HMR request for our App container, then reload it using require (we can't do this dynamically with import)
    const NextApp = require('./view/App').default;

    // And render it into the root element again
    render(
      //<AppContainer>
         <NextApp />,
      //</AppContainer>,
      rootEl
    );
  })
}