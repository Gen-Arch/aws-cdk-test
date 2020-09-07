#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';

import { Compute } from '../lib/compute';
import { Network } from '../lib/network';
import { R53     } from '../lib/r53';



class AwsCdkTestStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
      super(parent, name, props);
      const env:      string = this.node.tryGetContext('env');
      const params:   any    = this.node.tryGetContext(env);

      const network = new Network(this, 'Network', {env: env, config: params});
      const compute = new Compute(this, 'Compute', {env: env, vpc: network.vpc, sg: network.sg});
      const r53     = new R53(this, 'R53', {env: env, vpc: network.vpc, nodes: compute.nodes});
 }
}

const app = new cdk.App();
new AwsCdkTestStack(app, "AwsCdkTestStack", {
  env: {
    region: "ap-northeast-1"
  }
})
