#!/usr/bin/env node
import * as cdk    from '@aws-cdk/core';
import { Compute } from '../lib/compute';
import { Network } from '../lib/network';
import { R53 }     from '../lib/r53';
import { Elb }     from '../lib/elb';

class AwsCdkTestStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    const network = new Network(this, 'Network');
    const compute = new Compute(this, 'Compute', { vpc: network.vpc });
    const elb     = new Elb(this, 'ELB', { vpc: network.vpc, asgs: compute.asgs});
    const r53     = new R53(this, 'R53', { vpc: network.vpc, instances: compute.instances, albs: elb.albs });
  }
};

const app = new cdk.App();
new AwsCdkTestStack(app, "AwsCdkTestStack", {
  env: {
    account:  process.env.CDK_DEFAULT_ACCOUNT,
    region:   process.env.CDK_DEFAULT_REGION
  }
});
