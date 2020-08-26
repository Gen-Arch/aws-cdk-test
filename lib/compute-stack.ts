import autoscaling = require('@aws-cdk/aws-autoscaling');
import ec2 = require('@aws-cdk/aws-ec2');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import cdk = require('@aws-cdk/core');

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  sg: { [key: string]: ec2.ISecurityGroup; };
}

export class ComputeStack extends cdk.Stack {
  public readonly ec2s: {[key: string]: ec2.Instance;} = {};

  constructor(scope: cdk.Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const env: string = this.node.tryGetContext('env');
    const app_name: string = this.node.tryGetContext('prj');
    const suffix: string = `${env}-${app_name}`
    const params: any = this.node.tryGetContext(env);

    // management instance
    const bastion = new ec2.Instance(this, `${suffix}-bastion`, {
      vpc: props.vpc,
      vpcSubnets: {
        subnetName: `${suffix}-public`
      },
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage(),
      securityGroup: props.sg['bastion'],
      keyName: "mgmt"
    });

    // app instance
    const app = new autoscaling.AutoScalingGroup(this, `${suffix}-app`, {
      vpc: props.vpc,
      vpcSubnets: {
        subnetName: `${suffix}-private`
      },
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage(),
    });

    // app alb
    const lb = new elbv2.ApplicationLoadBalancer(this, `${suffix}-alb`, {
      vpc: props.vpc,
      internetFacing: true
    });

    const listener = lb.addListener('HTTP:80', {
      open: true,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [app]
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

    app.scaleOnRequestCount('AModestLoad', {
      targetRequestsPerSecond: 1
    });

    // execute commandline
    //bastion.addUserData(
    //  "sudo su -",
    //  "yum -y update",
    //  `hostnamectl set-hostname ${env}-bastion`
    //);

    //app.addUserData(
    //  "sudo yum -y update",
    //  `sudo hostnamectl set-hostname ${env}-app`
    //);

    // add instance list
    this.ec2s["bastion"] = bastion
  }
}
