import { EventTypes } from "./eventTypes";
import type { CreateOrderCommand } from "../commands/createOrderCommand";

export class OrderCreatedEvent {
  public readonly type = EventTypes.ORDER_CREATED;
  public readonly payload: CreateOrderCommand;

  constructor(payload: CreateOrderCommand) {
    this.payload = payload;
  }
}
