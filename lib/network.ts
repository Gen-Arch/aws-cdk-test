import cdk   = require("@aws-cdk/core");
import ec2   = require("@aws-cdk/aws-ec2");

export class Network extends cdk.Construct {
  public readonly vpc: ec2.Vpc;
  public readonly sg: { [key: string]: ec2.SecurityGroup; } = {};

  //public readonly dbSg: SecurityGroup;
  constructor(parent: cdk.Construct, name: string) {
    super(parent, name);

    const env: string = this.node.tryGetContext('env');
    const params: any = this.node.tryGetContext(env);

    // create vpc
    this.vpc = new ec2.Vpc(this, `${env}-vpc`, {
      cidr: params["cibr"],
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: params["maxAzs"],
      subnetConfiguration: [
        { name: `${env}-private`,        subnetType: ec2.SubnetType.PRIVATE, cidrMask: 24 },
        { name: `${env}-private-secure`, subnetType: ec2.SubnetType.PRIVATE, cidrMask: 24 },
        { name: `${env}-public`,         subnetType: ec2.SubnetType.PUBLIC,  cidrMask: 24 }
      ]
    });
    this.vpc.addFlowLog(`${env}-vpc-flow-log`)

    // create securityGroup
    this.sg['redis'] = new ec2.SecurityGroup(this, "redis", {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: `${env}-redis`,
      description: `${env}-redis`
    });
  }
}
