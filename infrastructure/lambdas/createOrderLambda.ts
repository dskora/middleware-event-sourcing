import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export function createOrderLambda(scope: Construct, eventsTable: dynamodb.Table) {
  const fn = new NodejsFunction(scope, 'CreateOrderLambda', {
    entry: path.join(__dirname, '../../src/lambdas/createOrderLambda.ts'),
    functionName: 'create-order-lambda',
    runtime: lambda.Runtime.NODEJS_LATEST,
    environment: {
      EVENT_STORE_TABLE: eventsTable.tableName,
    },
  });

  eventsTable.grantWriteData(fn);

  return fn;
}
