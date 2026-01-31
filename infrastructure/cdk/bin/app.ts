#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../stacks/api.stack';

const app = new cdk.App();
const env = app.node.tryGetContext('env') ?? 'dev';
const envs = app.node.tryGetContext('envs') ?? {};
const envConfig = envs[env] ?? {};

new ApiStack(app, `api-stack-${env}`, {env, ...envConfig});
