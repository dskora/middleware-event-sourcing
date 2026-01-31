const putMock = jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue(undefined) });
const documentClientMock = jest.fn(() => ({ put: putMock }));

jest.mock('aws-sdk', () => ({
    DynamoDB: {
        DocumentClient: documentClientMock,
    },
}));

import { handler } from './createOrderLambda';

describe('createOrderLambda handler', () => {
    it('stores OrderCreated event for CreateOrder command', async () => {
        process.env.EVENT_STORE_TABLE = 'event-store';

        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        commandName: 'CreateOrder',
                        command: {
                            commandId: 'req-1',
                            orderId: 'order-1',
                            customerId: 'cust-1',
                            currency: 'USD',
                            amount: 42,
                        },
                    }),
                },
            ],
        } as any;

        await handler(event);

        expect(putMock).toHaveBeenCalledWith(
            expect.objectContaining({
                TableName: 'event-store',
                ConditionExpression: 'attribute_not_exists(sk)',
                Item: expect.objectContaining({
                    pk: 'ORDER#order-1',
                    sk: 'EVT#req-1',
                    eventId: 'req-1',
                    aggregateId: 'order-1',
                    eventType: 'OrderCreated',
                    version: 1,
                }),
            })
        );
    });
});
