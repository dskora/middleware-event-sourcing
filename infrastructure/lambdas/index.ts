import { Construct } from 'constructs';
import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import type * as sqs from 'aws-cdk-lib/aws-sqs';
import { createOrderLambda } from './createOrderLambda';
import { createOrderTranslationLambda } from './createOrderTranslationLambda';

export function buildLambdas(
  scope: Construct,
  eventsTable: dynamodb.Table,
  commandQueue: sqs.Queue
) {
  return {
    createOrder: createOrderTranslationLambda(scope, commandQueue),
    createOrderHandler: createOrderLambda(scope, eventsTable),
  };
}
