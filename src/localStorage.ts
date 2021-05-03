/**
 * localStorage.ts
 * Copyright (C) 2021 Sanar
 *
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module localStorage.ts
 */
import debug from 'debug';
import {
  AsyncLocalStorage,
} from 'async_hooks';
import Data from './data';
import { randomSleep } from './sleep';

/**
 * To activate this log, set the invironment variable DEBUG to value: node:async_hooks
 *
 * DEBUG='node:async_hooks'
 *
 */
const logger = debug('node:async_hooks');

async function add(storage: AsyncLocalStorage<Data>) {
  const context = storage.getStore();
  if (context) {
    const prev = context.values[context.values.length - 1];
    context.values.push(prev + 2);
  } else {
    logger('Context not found...');
  }
  await randomSleep();
}

async function start(value: number) {
  const store = {
    values: [value],
  };
  const storage = new AsyncLocalStorage<Data>();
  storage.run(store, async () => {
    await add(storage);
    logger('%o', storage.getStore()!.values);
  });
}

export default async function localStorage() {
  console.log('Starting...'); // eslint-disable-line
  const list = new Array(10).fill(0).map((_, index) => index);
  await Promise.all(list.map(start)); // run in paralell
  console.log('Done.'); // eslint-disable-line
}
