import r53 = require('@aws-cdk/aws-route53')
import ec2 = require('@aws-cdk/aws-ec2');
import cdk = require('@aws-cdk/core');


interface R53StackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  ec2s: { [key: string]: ec2.Instance; };
}

export class R53Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: R53StackProps) {
    super(scope, id, props);

    const env: string = this.node.tryGetContext('env');
    const hostzone: string = this.node.tryGetContext('hostzone');

    const private_zone = new r53.PrivateHostedZone(this, `${env}.${hostzone}`, {
      zoneName: `${env}.${hostzone}`,
      vpc: props.vpc
    })

    const public_zone = new r53.PublicHostedZone(this, hostzone, {
      zoneName: hostzone
    })

    new r53.CnameRecord(this, `bastion.${env}.${hostzone}`, {
      zone: private_zone,
      recordName: "bastion",
      domainName: props.ec2s["bastion"].instancePrivateDnsName
    })

    new r53.CnameRecord(this, `bastion.${hostzone}`, {
      zone: public_zone,
      recordName: "bastion",
      domainName: props.ec2s["bastion"].instancePublicDnsName
    })
  }
}