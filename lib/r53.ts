import cdk     = require("@aws-cdk/core");
import r53     = require("@aws-cdk/aws-route53");
import ec2     = require("@aws-cdk/aws-ec2");
import elb     = require("@aws-cdk/aws-elasticloadbalancingv2");
import targets = require('@aws-cdk/aws-route53-targets');

interface R53StackProps {
  vpc:       ec2.IVpc;
  instances: { [key: string]: ec2.IInstance | ec2.BastionHostLinux; };
  albs:      { [key: string]: elb.IApplicationLoadBalancer; };
}

export class R53 extends cdk.Construct {
  constructor(parent: cdk.Construct, name: string, props: R53StackProps) {
    super(parent, name);
    const hostzone: string = this.node.tryGetContext('hostzone');
    const env:      string = this.node.tryGetContext('env');

    if(this.node.tryGetContext('public_hostzone')) {
      // [Public Hostzone] ------------------------------------------------------------------
      // lookup for public hostzone
      const public_zone = r53.HostedZone.fromLookup(this, hostzone, { domainName: hostzone })
      new cdk.CfnOutput(this, 'PublicDns', { value: hostzone });
      // ====================================================================================

      // add records
      new r53.ARecord(this, `www.${hostzone}`, {
        zone: public_zone,
        recordName: "www",
        target: r53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(props.albs["web"])),
      })
      // ------------------------------------------------------------------------------------
    }


    // [Private Hostzone] ------------------------------------------------------------------
    // create private domain
    const private_zone = new r53.PrivateHostedZone(this, `${env}.lan.${hostzone}`, {
      zoneName: `${env}.lan.${hostzone}`,
      vpc: props.vpc
    })
    new cdk.CfnOutput(this, 'PrivateDns', { value: `${env}.lan.${hostzone}` });
    // ====================================================================================

    // add records for all instance
    for (let [name, node] of Object.entries(props.instances)) {
      new r53.CnameRecord(this, `${name}.${env}.${hostzone}`, {
        zone: private_zone,
        recordName: name,
        domainName: node.instancePrivateDnsName
      })
    }
    // ------------------------------------------------------------------------------------
  }
}
