/* @flow */

import { MESSAGES, RESPONSES } from '../constants';
import * as IndexTypes from './types/index';

declare function postMessage(data: Response): void;

let _settings: IndexTypes.BlockchainSettings;
let _debugPrefix: string;
let _addresses: string[] = [];
const _subscription: {[key: string]: boolean} = {};

export const setSettings = (s: IndexTypes.BlockchainSettings): void => {
    _settings = s;
    _debugPrefix = `[Worker "${s.name}"]:`;
}

export const getSettings = (): IndexTypes.BlockchainSettings => {
    return _settings;
}

export const debug = (...args: any[]): void => {
    if (_settings && _settings.debug) {
        if (args[0] === 'warn' || args[0] === 'error') {
            console[args[0]](_debugPrefix, ...args.slice(1));
        } else {
            console.log(_debugPrefix, ...args)
        }
    }
} 

export const handshake = (): void => {
    postMessage({
        id: -1,
        type: MESSAGES.HANDSHAKE,
    });
}

export const errorHandler = ({ id, error }: { id: number, error: Record<string, any>}): void => {
    let message = '';
    if (typeof error === 'string') {
        message = error;
    } else if (typeof error === 'object') {
        const keys = Object.keys(error);
        if (keys.indexOf('name') >= 0) {
            message = error.name;
        } else {
            message = error.message;
        }
    }
    
    postMessage({
        id,
        type: RESPONSES.ERROR,
        payload: message
    });
}

export const response = (data: Response): void => {
    postMessage(data);
};

const getUniqueInput = (addresses: string[]): string[] => {
    if (!Array.isArray(addresses)) return [];
    const seen = {};
    return addresses.filter(a => {
        if (typeof a !== 'string') return false;
        return (seen.hasOwnProperty(a) ? false : (seen[a] = true));
    });
}

export const addAddresses = (addresses: string[]): string[] => {
    const unique = getUniqueInput(addresses).filter(a => _addresses.indexOf(a) < 0);
    _addresses = _addresses.concat(unique);
    return unique;
}

export const getAddresses = (): string[] => {
    return _addresses;
}

export const removeAddresses = (addresses: string[]): string[] => {
    const unique = getUniqueInput(addresses);
    _addresses = _addresses.filter(a => unique.indexOf(a) < 0);
    return _addresses;
}

export const addSubscription = (type: string): void => {
    _subscription[type] = true;
};

export const getSubscription = (type: string): boolean => {
    return _subscription[type];
};

export const removeSubscription = (type: string): void => {
    delete _subscription[type];
};

export const clearSubscriptions = (): void => {
    Object.keys(_subscription).forEach(key => _subscription[key] = false);
};