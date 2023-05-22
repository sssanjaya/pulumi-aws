import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { getStack } from "@pulumi/pulumi";

//A common tags to reuse 
const commonTags = {
    "Environment": `${getStack()}`,
    "Managed by Pulumi": "yes",
    "pulumi:Project": pulumi.getProject(),
    "pulumi:Stack": pulumi.getStack(),
}

// set up VPC
const vpc = new awsx.ec2.Vpc("vpc",{
    numberOfAvailabilityZones: 2,
    natGateways: {
        strategy: awsx.ec2.NatGatewayStrategy.Single,
    }
})

// An ECS cluster to deploy into
const cluster = new aws.ecs.Cluster("cluster", {
    tags: commonTags,
});

// Security Group
const group = new aws.ec2.SecurityGroup("web-secgrp", {
    vpcId: vpc.vpcId,
    description: "Enable HTTP access",
    ingress: [{
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
    }],
    egress: [{
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    }],
});

// Add load balancer
const loadbalancer = new aws.lb.LoadBalancer("loadbalancer", {
    securityGroups: [group.id],
    subnets: vpc.publicSubnetIds,
    tags: commonTags,
});

const targetGroup = new aws.lb.TargetGroup("app-tg", {
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.vpcId,
  });

const listener = new aws.lb.Listener("web", {
  loadBalancerArn: loadbalancer.arn,
  port: 80,
  defaultActions: [{
    type: "forward",
    targetGroupArn: targetGroup.arn,
  }],
});  

const role = new aws.iam.Role("task-exec-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2008-10-17",
        Statement: [{
        Action: "sts:AssumeRole",
        Principal: {
            Service: "ecs-tasks.amazonaws.com",
        },
        Effect: "Allow",
        Sid: "",
        }],
    }),
});
  
new aws.iam.RolePolicyAttachment("task-exec-policy", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy,
});

// An ECR repository to store our application's container image
const webrepo = new awsx.ecr.Repository("webrepo", {
    forceDelete: true,
    tags: commonTags,
});

const apirepo = new awsx.ecr.Repository("apirepo", {
    forceDelete: true,
    tags: commonTags,
});

// Build and publish our application's container image from ../infra-web to the ECR repository
const web = new awsx.ecr.Image("web", {
    repositoryUrl: webrepo.url,
    path: "../infra-web",
});

// Build and publish our application's container image from ../infra-api to the ECR repository
const api = new awsx.ecr.Image("api", {
    repositoryUrl: apirepo.url,
    path: "../infra-api",
});

// Define task definiton for web frontend
const webTaskDefinition = new aws.ecs.TaskDefinition("web-task", {
    family: "fargate-task-definition",
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: role.arn,
    containerDefinitions: JSON.stringify([{
      name: "web-app",
      image: web.imageUri,
      portMappings: [{
        containerPort: 80,
        hostPort: 80,
        protocol: "tcp",
      }],
    }]),
    tags: commonTags,
  });

// creating service for web frontend
const webService = new aws.ecs.Service("web-svc", {
  cluster: cluster.arn,
  desiredCount: 3,
  launchType: "FARGATE",
  taskDefinition: webTaskDefinition.arn,
  networkConfiguration: {
    assignPublicIp: true,
    subnets: vpc.privateSubnetIds,
    securityGroups: [group.id],
  },
  loadBalancers: [{
    targetGroupArn: targetGroup.arn,
    containerName: "web-app",
    containerPort: 80,
  }],
});  

const apiTaskDefinition = new aws.ecs.TaskDefinition("api-task", {
    family: "fargate-task-definition",
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: role.arn,
    containerDefinitions: JSON.stringify([{
      name: "api-app",
      image: api.imageUri,
      portMappings: [{
        containerPort: 80,
        hostPort: 80,
        protocol: "tcp",
      }],
    }]),
    tags: commonTags,
  });

const apiService = new aws.ecs.Service("api-svc", {
  cluster: cluster.arn,
  desiredCount: 3,
  launchType: "FARGATE",
  taskDefinition: apiTaskDefinition.arn,
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
    securityGroups: [group.id],
  },
  loadBalancers: [{
    targetGroupArn: targetGroup.arn,
    containerName: "api-app",
    containerPort: 80,
  }],
});

// The URL at which the container's HTTP endpoint will be available
export const url = pulumi.interpolate`http://${loadbalancer.dnsName}`;