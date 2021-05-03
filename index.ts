/**
 * index.ts
 *
 * @module index.ts
 */
import debug from 'debug';
import {
  createHook,
  executionAsyncId,
} from 'async_hooks';

import localStorage from './src/localStorage';
import startKareem from './src/kareem';

/**
 * To activate this log, set the invironment variable DEBUG to value: node:async_hooks
 *
 * DEBUG='node:async_hooks'
 *
 */
const logger = debug('node:async_hooks');

export default interface Data {
  values: number[];
}

const store = new Map<number, Data>();

const hook = createHook({
  init: (asyncId: number, _: string, triggerAsyncId: number) => {
    if (store.has(triggerAsyncId)) {
      store.set(asyncId, store.get(triggerAsyncId) as Data);
    }
  },
  destroy: (asyncId: number) => {
    if (store.has(asyncId)) {
      store.delete(asyncId);
    }
  },
});

hook.enable();

function sleep(time = 100) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function randomSleep() {
  const interval = Math.round(Math.random() * 100);
  await sleep(interval);
}

function createContext(initialValue: number) {
  logger('Creating context for value: %d', initialValue);
  store.set(executionAsyncId(), { values: [initialValue] });
}

function getContext(): Data | undefined {
  return store.get(executionAsyncId());
}

async function add() {
  const context = getContext();
  if (context) {
    const prev = context.values[context.values.length - 1];
    context.values.push(prev + 2);
  } else {
    logger('Context not found...');
  }
  await randomSleep();
}

async function start(value: number) {
  createContext(value);
  await add();
  logger('%o', getContext()!.values);
}

(async () => {
  console.log('Starting...'); // eslint-disable-line
  const list = new Array(10).fill(0).map((_, index) => index);
  await Promise.all(list.map(start)); // run in paralell
  console.log('Done.'); // eslint-disable-line

  console.log('Running localStorage...'); // eslint-disable-line
  await localStorage();
  console.log('Done.'); // eslint-disable-line

  await startKareem();
})();
