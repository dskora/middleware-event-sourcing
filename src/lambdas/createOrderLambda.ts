import { resolveCommand } from '../adapters/index';
import {OrderAggregate} from "../domain/aggregates/orderAggregate";

export const handler = async (event: any) => {
  const payload = JSON.parse(event.body);

  const { commandName, command } = resolveCommand(payload);

  if (commandName !== 'CreateOrder') {
    throw new Error('Unsupported command for this endpoint');
  }

  const aggregate = new OrderAggregate();
  const eventCreated = aggregate.createOrder(command);

  return { statusCode: 200 };
};
