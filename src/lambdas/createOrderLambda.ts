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

      const eventCreated = order.createOrder(command);

      await eventStore.save(command.orderId, command.commandId, eventCreated, 1);
    }
  }
