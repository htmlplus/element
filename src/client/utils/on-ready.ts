export function onReady(target, callback: (this) => void) {
  (target['setup'] ??= []).push(callback);
}
