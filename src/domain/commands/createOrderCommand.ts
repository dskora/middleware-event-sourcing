export type CreateOrderCommand = {
  commandId: string;
  orderId: string;
  customerId: string;
  currency: string;
  amount: number;
};
