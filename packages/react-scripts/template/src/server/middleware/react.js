import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../../universal/routes';
import reducers from '../../universal/store/reducers';
import storeEnhancer from '../../universal/store/storeEnhancer';

module.exports = function reactMiddleware(req, res, next) {
  match({ routes, location: req.url }, function (
    error,
    redirectLocation,
    renderProps
  ) {
    if (error) {
      handleError(res, error);
    } else if (redirectLocation) {
      handleRedirect(res, redirectLocation);
    } else if (renderProps) {
      handleRender(res, renderProps);
    } else {
      next();
    }
  });
};

function handleRender(res, renderProps) {
  var store = createStore(reducers, {}, storeEnhancer);
  var reduxState = store.getState();

  var app = (
    <Provider store={store}>
      <RouterContext {...renderProps} />
    </Provider>
  );

  var appHtml = renderToString(app);

  res
    .status(200)
    .render('react', {
      appHtml,
      reduxState
    });
}

function handleRedirect(res, redirect) {
  res.redirect(302, redirect.pathname + redirect.search);
}

function handleError(res, err) {
  res.status(500).send(err.message);
}
