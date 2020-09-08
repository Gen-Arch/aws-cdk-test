import { Construct } from '@aws-cdk/core';
import r53 = require('@aws-cdk/aws-route53')
import {
  Instance,
  IVpc,
} from "@aws-cdk/aws-ec2";


interface R53StackProps {
  vpc: IVpc;
  nodes: { [key: string]: Instance; };
}

export class R53 extends Construct {
  constructor(parent: Construct, name: string, props: R53StackProps) {
    super(parent, name);
    const hostzone: string = this.node.tryGetContext('hostzone');
    const env: string = this.node.tryGetContext('env');

    const private_zone = new r53.PrivateHostedZone(this, `${env}.${hostzone}`, {
      zoneName: `${env}.${hostzone}`,
      vpc: props.vpc
    })

    for (let name in props.nodes) {
      new r53.CnameRecord(this, `${name}.${env}.${hostzone}`, {
        zone: private_zone,
        recordName: name,
        domainName: props.nodes[name].instancePrivateDnsName
      })
    }
  }
}