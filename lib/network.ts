import { Construct } from "@aws-cdk/core";
import {
  Vpc,
  Peer,
  Port,
  SubnetType,
  SecurityGroup,
} from "@aws-cdk/aws-ec2";


export interface NetworkProps {
  env:    string;
  config: any;
}

export class Network extends Construct {
  public readonly vpc: Vpc;
  public readonly sg: { [key: string]: SecurityGroup; } = {};

  //public readonly dbSg: SecurityGroup;
  constructor(parent: Construct, name: string, props: NetworkProps) {
    super(parent, name);

    this.vpc = new Vpc(this, `${props.env}-vpc`, {
      cidr: props.config["vpc"]["ciber"],
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: props.config["maxAzs"],
      subnetConfiguration: [
        { name: `${props.env}-private`, subnetType: SubnetType.PRIVATE, cidrMask: 24 },
        { name: `${props.env}-public`,  subnetType: SubnetType.PUBLIC,  cidrMask: 24 }
      ]
    });

    // create security group
    this.sg['bastion'] = new SecurityGroup(this, "bastion", {
      vpc:               this.vpc,
      allowAllOutbound:  true,
      securityGroupName: `${props.env}-bastion`,
      description:       `${props.env}-bastion`
    });

    this.sg['private-app'] = new SecurityGroup(this, "private-app-default", {
      vpc:               this.vpc,
      allowAllOutbound:  true,
      securityGroupName: `${props.env}-private-app-default`,
      description:       `${props.env}-private-app-default`
    });

    // add ingressrule
    this.sg['bastion'].addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'allow ssh connection')
    this.sg['bastion'].addIngressRule(Peer.anyIpv4(), Port.icmpPing(), 'allow icmp')
    this.sg['private-app'].addIngressRule(Peer.ipv4(props.config["vpc"]["private-1a"]), Port.allTraffic(), 'allow private-subnet-1a')
    this.sg['private-app'].addIngressRule(Peer.ipv4(props.config["vpc"]["private-1c"]), Port.allTraffic(), 'allow private-subnet-1c')
    this.sg['private-app'].addIngressRule(Peer.ipv4(props.config["vpc"]["private-1d"]), Port.allTraffic(), 'allow private-subnet-1d')
    this.sg['private-app'].addIngressRule(Peer.anyIpv4(), Port.icmpPing(), 'allow icmp')
  }
}