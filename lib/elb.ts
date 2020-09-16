import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import elb = require("@aws-cdk/aws-elasticloadbalancingv2");
import asg = require("@aws-cdk/aws-autoscaling");
import acm = require("@aws-cdk/aws-certificatemanager");
import r53 = require('@aws-cdk/aws-route53')

interface ElbProps {
  vpc:       ec2.IVpc;
  asgs:      { [key: string]: asg.AutoScalingGroup };
}

export class Elb extends cdk.Construct {
  public readonly albs:      { [key: string]: elb.IApplicationLoadBalancer } = {};

  constructor(parent: cdk.Construct, name: string, props: ElbProps) {
    super(parent, name);
    const env:      string  = this.node.tryGetContext('env');

    // subnets
    const public_subnet:         ec2.SubnetSelection = { subnetGroupName: `${env}-public` }
    const private_subnet:        ec2.SubnetSelection = { subnetGroupName: `${env}-private` }
    const private_secure_subnet: ec2.SubnetSelection = { subnetGroupName: `${env}-private-secure` }

    // [targetgroup] ------------------------------------------------------------------
    // --------------------------------------------------------------------------------

    // [loadbarancer] -----------------------------------------------------------------
    // --------------------------------------------------------------------------------
  }
}
