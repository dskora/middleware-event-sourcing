import type { CreateOrderCommand } from "../domain/commands/createOrderCommand";
import { EventStoreRepository } from "../services/eventStoreRepository";
import { SQSEvent } from "aws-lambda";
import {OrderAggregate} from "../domain/aggregates/orderAggregate";

export const handler = async (
  event: SQSEvent
): Promise<void> => {
    const tableName = process.env.EVENT_STORE_TABLE;
    if (!tableName) {
      throw new Error('EVENT_STORE_TABLE is not set');
    }

    const order = new OrderAggregate();
    const eventStore = new EventStoreRepository(tableName);
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      const { commandName, command } = body ?? {};

      if (commandName !== 'CreateOrder') {
        throw new Error('Unsupported command for this handler');
      }

      if (!isCreateOrderCommand(command)) {
        throw new Error('Invalid CreateOrder command payload');
      }

      const eventCreated = order.createOrder(command);

      try {
        await eventStore.save(command.orderId, command.commandId, eventCreated, 1);
      } catch (error) {
        if (!isConditionalCheckFailed(error)) {
          throw error;
        }
      }
    }
  };

function isCreateOrderCommand(value: unknown): value is CreateOrderCommand {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as CreateOrderCommand;
  return (
    typeof candidate.commandId === 'string' &&
    typeof candidate.orderId === 'string' &&
    typeof candidate.customerId === 'string' &&
    typeof candidate.currency === 'string' &&
    typeof candidate.amount === 'number'
  );
}

function isConditionalCheckFailed(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'ConditionalCheckFailedException'
  );
}
