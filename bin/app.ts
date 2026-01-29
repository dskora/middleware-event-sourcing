#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MiddlewareStack } from '../lib/middleware-stack';

const app = new cdk.App();

new MiddlewareStack(app, 'MiddlewareStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work.
   */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
