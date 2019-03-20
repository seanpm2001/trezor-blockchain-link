/* @flow */

import TinyWorker from 'tiny-worker';

export const rippleWorkerFactory = (): Worker => {
    if (typeof Worker === 'undefined') {
        return new TinyWorker(() => {
            const requireHack = eval('req' + 'uire');
            requireHack('babel-register')({cache: true});
            requireHack('../../../src/workers/ripple/index.ts');
        });
    }
    return new Worker('../../../src/workers/ripple/index.ts');
};