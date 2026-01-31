import { DynamoDB } from 'aws-sdk';

export type DomainEvent = {
  type: string;
  payload: unknown;
};

export type EventStoreItem = {
  pk: string;
  sk: string;
  eventId: string;
  aggregateId: string;
  eventType: string;
  occurredAt: string;
  version: number;
  payload: string;
};

export class EventStoreRepository {
  private readonly tableName: string;
  private readonly ddb: DynamoDB.DocumentClient;

  constructor(tableName: string, ddb: DynamoDB.DocumentClient = new DynamoDB.DocumentClient()) {
    this.tableName = tableName;
    this.ddb = ddb;
  }

  async save(
    aggregateId: string,
    eventId: string,
    event: DomainEvent,
    version = 1
  ): Promise<EventStoreItem> {
    const occurredAt = new Date().toISOString();
    const item: EventStoreItem = {
      pk: `ORDER#${aggregateId}`,
      sk: `EVT#${eventId}`,
      eventId,
      aggregateId,
      eventType: event.type,
      occurredAt,
      version,
      payload: JSON.stringify(event.payload),
    };

    await this.ddb
      .put({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(sk)',
      })
      .promise();

    return item;
  }
}
