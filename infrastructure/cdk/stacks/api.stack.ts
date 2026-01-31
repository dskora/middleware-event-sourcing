import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { buildApi } from '../../api/apiBuilder';
import { buildLambdas } from '../../lambdas';

interface ApiStackProps extends cdk.StackProps {
  eventsTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'middleware-api', {
      restApiName: `middleware-api-${props.env}`,
    });

    const commandQueue = new sqs.Queue(this, 'command-queue', {
      queueName: `command-queue-${props.env}`,
    });

    const lambdas = buildLambdas(this, props.eventsTable, commandQueue);

    buildApi(api, lambdas);

    lambdas.createOrderHandler.addEventSource(
      new SqsEventSource(commandQueue, {
        batchSize: 10,
      })
    );
  }
}
