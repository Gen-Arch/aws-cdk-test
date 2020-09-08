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
  env: string;
  vpc: IVpc;
  sg: { [key: string]: ISecurityGroup; };
}

export class Compute extends Construct {
  public readonly nodes: { [key: string]: Instance; } = {};

  constructor(parent: Construct, name: string, props: ComputeStackProps) {
    super(parent, name);

    const hostzone: string = this.node.tryGetContext('hostzone');

    // create mgmt instance
    this.nodes["bastion"] = new Instance(this, `${props.env}-bastion`, {
      vpc: props.vpc,
      vpcSubnets: { subnetName: `${props.env}-public` },
      instanceType: new InstanceType("t3a.micro"),
      machineImage: new LookupMachineImage({ name: "bastion" }),
      securityGroup: props.sg['bastion'],
      keyName: "mgmt",
    });
    this.nodes["bastion"]
    // add rule for mgmt-instance
    props.sg["private-app"].addIngressRule(
      Peer.ipv4(this.nodes["bastion"].instancePrivateIp + "/32"),
      Port.tcp(22),
      "allow ssh for bastion"
    );

    // create instance
    this.nodes["redis-cli"] = new Instance(this, `${props.env}-redis-cli`, {
      vpc: props.vpc,
      vpcSubnets: { subnetName: `${props.env}-private` },
      instanceType: new InstanceType("t3a.micro"),
      machineImage: new AmazonLinuxImage({ generation: AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      securityGroup: props.sg['private-app'],
      keyName: "bastion"
    });

    props.sg["redis"].addIngressRule(
      Peer.ipv4(this.nodes["redis-cli"].instancePrivateIp + "/32"),
      Port.tcp(6379),
      "allow redis-cli"
    );

    // default setup commands
    for (let name in this.nodes) {
      this.nodes[name].addUserData(
        `hostnamectl set-hostname ${props.env}-${name}`,
        `sudo sh -c 'echo "search ${props.env}.${hostzone}" >> /etc/resolv.conf'`,
        "sudo yum update -y",
        "sudo yum install -y vim git"
      )
      if (name == "redis-cli") {
        this.nodes[name].addUserData(
          "sudo amazon-linux-extras install -y redis4.0"
        )
      }
    
    };
  }
}
