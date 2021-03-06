import {
  createStore,
  applyMiddleware,
  combineReducers,
  compose,
} from 'redux';
import createSagaMiddleware, {
  END,
} from 'redux-saga';
import {
  windowsManager,
} from 'shared/reducers';

import rendererEnhancer from './middleware';

const sagaMiddleware = createSagaMiddleware();
const middleware = [
  rendererEnhancer,
  sagaMiddleware,
].filter(Boolean);

export default function configureStore(
  initialState = {},
  reducers = {},
) {
  const store = createStore(
    combineReducers({
      windowsManager,
      ...reducers,
    }),
    initialState,
    compose(
      applyMiddleware(...middleware),
    ),
  );

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);
  return store;
}
