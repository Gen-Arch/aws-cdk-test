#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkTestStack } from '../lib/aws-cdk-test-stack';

const app = new cdk.App();
new AwsCdkTestStack(app, 'AwsCdkTestStack');
