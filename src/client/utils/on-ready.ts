export function onReady(target, callback: (this) => void): void {
  (target['setup'] ??= []).push(callback);
}
