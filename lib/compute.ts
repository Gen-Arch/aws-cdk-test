import { Construct } from "@aws-cdk/core";
import {
  Instance,
  InstanceType,
  AmazonLinuxImage,
  Peer,
  Port,
  ISecurityGroup,
  IVpc,
  AmazonLinuxGeneration,
  LookupMachineImage
} from "@aws-cdk/aws-ec2";

interface ComputeStackProps {
  vpc: IVpc;
  sg: { [key: string]: ISecurityGroup; };
}

export class Compute extends Construct {
  public readonly nodes: { [key: string]: Instance; } = {};

  constructor(parent: Construct, name: string, props: ComputeStackProps) {
    super(parent, name);

    const env:      string = this.node.tryGetContext('env');
    const hostzone: string = this.node.tryGetContext('hostzone');

    // create bastion
    this.nodes["bastion"] = new Instance(this, `${env}-bastion`, {
      vpc: props.vpc,
      vpcSubnets: { subnetName: `${env}-public` },
      instanceType: new InstanceType("t3a.micro"),
      machineImage: new LookupMachineImage({ name: "bastion" }),
      securityGroup: props.sg['bastion'],
      keyName: this.node.tryGetContext('bastion-keyname'),
    });

    // add rule for mgmt-instance
    props.sg["private-app"].addIngressRule(
      Peer.ipv4(this.nodes["bastion"].instancePrivateIp + "/32"),
      Port.tcp(22),
      "allow ssh for bastion"
    );

    // create instance
    this.nodes["hoge"] = new Instance(this, `${env}-hoge`, {
      vpc: props.vpc,
      vpcSubnets: { subnetName: `${env}-private` },
      instanceType: new InstanceType("t3a.micro"),
      machineImage: new AmazonLinuxImage({generation: AmazonLinuxGeneration.AMAZON_LINUX_2}),
      securityGroup: props.sg['private-app'],
      keyName: "bastion"
    });

    // default setup commands
    for (let name in this.nodes) {
      this.nodes[name].addUserData(
        `hostnamectl set-hostname ${env}-${name}`,
        `sudo sh -c 'echo "search ${env}.lan.${hostzone}" >> /etc/resolv.conf'`,
        "sudo yum update -y",
        "sudo yum install -y vim git"
      )
    };
  }
}
