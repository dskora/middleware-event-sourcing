import type { CreateOrderCommand } from "../commands/createOrderCommand";
import { OrderCreatedEvent } from "../events/orderEvents";

export class OrderAggregate {
  private readonly events: OrderCreatedEvent[] = [];

  createOrder(command: CreateOrderCommand): OrderCreatedEvent {
    if (command.amount <= 0) {
      throw new Error("Order total must be greater than 0");
    }

    const event = new OrderCreatedEvent(command);

    this.apply(event);

    return event;
  }

  private apply(event: OrderCreatedEvent): void {
    this.events.push(event);
  }
}
