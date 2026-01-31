import { Ingress1Adapter } from './ingress1';
import type { AdapterAbstract } from './types';

const adapters: AdapterAbstract[] = [new Ingress1Adapter()];

export function resolveCommand(payload: any) {
    for (const adapter of adapters) {
        const result = adapter.adapt(payload);
        if (result) {
            return result;
        }
    }

    throw new Error('Unsupported payload: no adapter found');
}
