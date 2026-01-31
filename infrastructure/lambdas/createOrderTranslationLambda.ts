import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import type * as sqs from 'aws-cdk-lib/aws-sqs';

export function createOrderTranslationLambda(scope: Construct, commandQueue: sqs.Queue) {
  const fn = new NodejsFunction(scope, 'CreateOrderTranslationLambda', {
    entry: path.join(__dirname, '../../src/lambdas/createOrderTranslationLambda.ts'),
    functionName: 'create-order-translation-lambda',
    runtime: lambda.Runtime.NODEJS_LATEST,
    environment: {
      COMMAND_QUEUE_URL: commandQueue.queueUrl,
    },
  });

  commandQueue.grantSendMessages(fn);

  return fn;
}
