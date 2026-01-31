#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../stacks/api.stack';
import {EventsStack} from "../stacks/events";
import {EventStoreStack} from "../stacks/eventStore";

const app = new cdk.App();
const env = app.node.tryGetContext('env') ?? 'dev';
const envs = app.node.tryGetContext('envs') ?? {};
const envConfig = envs[env] ?? {};

const eventsStack = new EventsStack(app, `events-stack-${env}`);

const eventStoreStack = new EventStoreStack(app, `event-store-stack-${env}`, {
  eventBusArn: eventsStack.bus.eventBusArn,
});

new ApiStack(app, `api-stack-${env}`, { env, ...envConfig, eventsTable: eventStoreStack.eventsTable });
