#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ComputeStack } from '../lib/compute-stack';
import { NetworkStack } from '../lib/network-stack';
import { R53Stack } from '../lib/r53-stack';

const app = new cdk.App();
const networkStack = new NetworkStack(app, "NetworkStack");

const computeStack = new ComputeStack(app, 'ComputeStack', {
  vpc: networkStack.vpc,
  sg: networkStack.sg,
});

const r35Stack  = new R53Stack(app, "R53Stack", {
  vpc: networkStack.vpc,
  ec2s: computeStack.ec2s,
})
