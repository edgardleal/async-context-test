/**
 * kareem.ts
 * Copyright (C) 2021 Sanar
 *
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module kareem.ts
 */
import debug from 'debug';
import {
  AsyncLocalStorage,
} from 'async_hooks';

import { randomSleep } from './sleep';
import Data from './data';

const Kareem = require('kareem');

const storage = new AsyncLocalStorage<Data>();

/**
 * To activate this log, set the invironment variable DEBUG to value: node:kareem
 *
 * DEBUG='node:kareem'
 *
 */
const logger = debug('node:kareem');

/**
 * A simple version of mongoose Schema
 * @author edgardleal@gmail.com
 * @since 03.05.21
 */
export class DBStorage {
  private hooks = new Kareem();

  public async save(): Promise<void> {
    logger('Saving...');
    return new Promise((resolve) => {
      this.hooks.execPre('save', null, async () => {
        logger('Finished preSave...');
        await randomSleep();
        logger('Running postSave...');
        await this.hooks.execPost('save', this, [], function() { // eslint-disable-line
          // await randomSleep();
          logger('Done post Save');
        });
        resolve();
      });
    });
  }

  public preSave(fn: any) {
    this.hooks.pre('save', fn);
  }

  public postSave(fn: any) {
    this.hooks.post('save', fn);
  }
}

async function lastStep() {
  const context = storage.getStore();
  const last = context!.values[context!.values.length - 1] || 0;
  context!.values.push(last + 2);
  await randomSleep();
}

async function add() {
  const context = storage.getStore();
  const last = context!.values[context!.values.length - 1] || 0;
  context!.values.push(last + 2);
  await randomSleep();
}

async function run(value: number) {
  const store: Data = {
    count: 0,
    values: [value],
  };
  storage.enterWith(store);
  const db = new DBStorage();
  db.postSave(async () => {
    const context: Data = storage.getStore()!;
    (context! || { count: 0 }).count! += 1;
    await add();
    await lastStep();
    logger('Running a postSave hook: %d, %o', context.count, context.values);
  });

  db.preSave(async () => {
    const context: Data = storage.getStore()!;
    (context! || { count: 0 }).count! += 1;
    await add();
    logger('Running a preSave hook: %d', context.count);
  });

  await db.save();
}

/**
 * start the tests with kareem
 *
 * @example
 * ```
 * start(); //
 * ```
 * @author edgardleal
 * @since 03.05.21
 */
export default async function start(): Promise<void> {
  logger('====================================');

  const list = new Array(10).fill(0).map((_, index) => index);
  await Promise.all(list.map(run));

  logger('Done.');
}
