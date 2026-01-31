import { AdapterAbstract, type CommandTransforms } from '../types';

type Ingress1Payload = {
    id: string;
    customer_name: string;
    customer_id: string;
    currencyValue: string;
    amountValue: number;
    request_id: string;
};

const commandTransforms: CommandTransforms = {
    CreateOrder: {
        supports: (payload) =>
            typeof payload?.id === 'string' &&
            typeof payload?.customer_name === 'string' &&
            typeof payload?.customer_id === 'string' &&
            typeof payload?.request_id === 'string' &&
            typeof payload?.currencyValue === 'string' &&
            typeof payload?.amountValue === 'number',
        toCommand: (payload: Ingress1Payload) => ({
            commandId: payload.request_id,
            orderId: payload.id,
            customerId: payload.customer_id,
            currency: payload.currencyValue,
            amount: payload.amountValue,
        }),
    },
};

export class Ingress1Adapter extends AdapterAbstract {
    support(): CommandTransforms {
        return commandTransforms;
    }
}
