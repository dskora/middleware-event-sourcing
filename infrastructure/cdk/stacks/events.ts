import * as cdk from "aws-cdk-lib";
import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class EventsStack extends Stack {
  public readonly bus: events.EventBus;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.bus = new events.EventBus(this, "DomainBus", {
      eventBusName: "domain-bus",
    });

    // One SQS per consumer (decoupling, backpressure, independent retries)
    const consumerAQueue = this.makeConsumerQueue("ConsumerA");
    const consumerShippingQueue = this.makeConsumerQueue("Shipping");

    // Example routing rule: OrderCreated -> ConsumerA + Shipping
    const orderCreatedRule = new events.Rule(this, "OrderCreatedRule", {
      eventBus: this.bus,
      eventPattern: {
        source: ["middleware.eventstore"],
        detailType: ["DomainEvent"],
        detail: {
          eventType: ["OrderCreated"],
        },
      },
    });

    orderCreatedRule.addTarget(new targets.SqsQueue(consumerAQueue));
    orderCreatedRule.addTarget(new targets.SqsQueue(consumerShippingQueue));
  }

  private makeConsumerQueue(name: string): sqs.Queue {
    const dlq = new sqs.Queue(this, `${name}Dlq`, {
      queueName: `${name.toLowerCase()}-dlq`,
      retentionPeriod: Duration.days(14),
    });

    return new sqs.Queue(this, `${name}Queue`, {
      queueName: `${name.toLowerCase()}-queue`,
      visibilityTimeout: Duration.seconds(60), // align with Lambda timeout
      retentionPeriod: Duration.days(4),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 5,
      },
    });
  }
}
