/**
 * sleep.ts
 * Copyright (C) 2021 Sanar
 *
 * @author Edgard Leal <edgard.leal@sanar.com>
 * @module sleep.ts
 */

export function sleep(time = 100) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function randomSleep() {
  const interval = Math.round(Math.random() * 100);
  await sleep(interval);
}
