import * as cdk from "aws-cdk-lib";
import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as pipes from "aws-cdk-lib/aws-pipes";

interface EventStoreStackProps extends StackProps {
  eventBusArn: string; // passed from EventsStack (or imported)
}

export class EventStoreStack extends Stack {
  public readonly eventsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: EventStoreStackProps) {
    super(scope, id, props);

    // Event Store / Outbox table
    this.eventsTable = new dynamodb.Table(this, "EventsTable", {
      tableName: "event-store",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING }, // e.g. ORDER#123
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },      // e.g. EVT#<ulid>
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_IMAGE, // recommended for publishing event payload
      removalPolicy: RemovalPolicy.RETAIN,        // keep events as source of truth
      pointInTimeRecovery: true,
    });

    // Pipe execution role
    const pipeRole = new iam.Role(this, "DdbStreamToEventBridgePipeRole", {
      assumedBy: new iam.ServicePrincipal("pipes.amazonaws.com"),
    });

    // Allow reading stream
    pipeRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [this.eventsTable.tableStreamArn!],
      })
    );

    // Allow putting events to EventBridge bus
    pipeRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["events:PutEvents"],
        resources: [props.eventBusArn],
      })
    );

    // EventBridge Pipe: DynamoDB Stream -> EventBridge Bus
    new pipes.CfnPipe(this, "DdbStreamToEventBridgePipe", {
      roleArn: pipeRole.roleArn,
      source: this.eventsTable.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: "LATEST",
          batchSize: 10,
          maximumBatchingWindowInSeconds: 2,
          maximumRetryAttempts: 10,
          deadLetterConfig: undefined, // you can wire an SQS DLQ here if you want
        },
        // Optional: filter only INSERTs if your stream includes MODIFY/REMOVE
        filterCriteria: {
          filters: [
            {
              pattern: JSON.stringify({
                eventName: ["INSERT"],
              }),
            },
          ],
        },
      },
      target: props.eventBusArn,
      targetParameters: {
        eventBridgeEventBusParameters: {
          // You can set fixed Source/DetailType here, but I prefer mapping from item fields via inputTemplate
          source: "middleware.eventstore",
          detailType: "DomainEvent",
        },
        inputTemplate: JSON.stringify({
          // Map DynamoDB stream record into an EventBridge event "detail"
          // IMPORTANT: Stream images are DynamoDB-typed JSON ({"S":"..","N":".."}).
          // Keep your consumers aware, or add a transformation later.
          eventId: "<$.dynamodb.NewImage.eventId.S>",
          aggregateId: "<$.dynamodb.NewImage.aggregateId.S>",
          eventType: "<$.dynamodb.NewImage.eventType.S>",
          occurredAt: "<$.dynamodb.NewImage.occurredAt.S>",
          version: "<$.dynamodb.NewImage.version.N>",
          payload: "<$.dynamodb.NewImage.payload.S>", // often store JSON string; consumers parse it
        }),
      },
    });
  }
}
