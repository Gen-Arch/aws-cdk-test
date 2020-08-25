import autoscaling = require('@aws-cdk/aws-autoscaling');
import ec2 = require('@aws-cdk/aws-ec2');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import cdk = require('@aws-cdk/core');

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  sg: { [key: string]: ec2.ISecurityGroup; };
}

export class ComputeStack extends cdk.Stack {
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
    })

    // app instance
    const asg = new autoscaling.AutoScalingGroup(this, `${suffix}-app`, {
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
      targets: [asg]
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

    asg.scaleOnRequestCount('AModestLoad', {
      targetRequestsPerSecond: 1
    });
  }
}
