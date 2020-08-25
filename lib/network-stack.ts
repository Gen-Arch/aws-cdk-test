import { Construct, Stack, StackProps, Tag } from "@aws-cdk/core";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "@aws-cdk/aws-ec2";

export class NetworkStack extends Stack {
	public readonly vpc: 	Vpc;
	public readonly sg: 	{[key: string]: SecurityGroup; } = {};

	//public readonly dbSg: SecurityGroup;
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const env: 			string 	= this.node.tryGetContext('env');
		const app_name: string 	= this.node.tryGetContext('prj');
		const suffix: 	string 	= `${env}-${app_name}`
		const params: 	any 		= this.node.tryGetContext(env);

		this.vpc = new Vpc(this, `${suffix}-vpc`, {
			enableDnsHostnames: true,
			enableDnsSupport: true,
			maxAzs: 2,
			subnetConfiguration: [
				{ name: `${suffix}-public`, 	subnetType: SubnetType.PUBLIC, 	cidrMask: 24 },
				{ name: `${suffix}-private`,  subnetType: SubnetType.PRIVATE, cidrMask: 24 }
			]
		});

		this.sg['bastion'] = new SecurityGroup(this, "bastion", {
      allowAllOutbound: true,
      vpc: this.vpc,
      securityGroupName: `${suffix}-bastion`,
      description: `${suffix}-app`
		});

    this.sg['bastion'].addIngressRule(Peer.anyIpv4(), Port.tcp(22), 		'allow ssh connection')
    this.sg['bastion'].addIngressRule(Peer.anyIpv4(), Port.icmpPing(), 	'allow icmp')
	}
}