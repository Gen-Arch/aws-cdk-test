#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ComputeStack } from '../lib/compute-stack';
import { NetworkStack } from '../lib/network-stack';

const app = new cdk.App();
const networkStack = new NetworkStack(app, "NetworkStack");

new ComputeStack(app, 'ComputeStack', {
  vpc: networkStack.vpc,
  sg: networkStack.sg
});
