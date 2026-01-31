import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export function createOrderLambda(scope: Construct) {
  return new NodejsFunction(scope, 'CreateOrderLambda', {
    entry: path.join(__dirname, '../../src/lambdas/createOrderLambda.ts'),
    functionName: 'create-order-lambda',
    runtime: lambda.Runtime.NODEJS_LATEST,
  });
}
