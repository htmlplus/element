export function onReady<T>(target: T, callback: (this) => void) {
  (target['setup'] ??= []).push(callback);
}