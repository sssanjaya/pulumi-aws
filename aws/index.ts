import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { getStack } from "@pulumi/pulumi";

const config = new pulumi.Config();
const containerPort = config.getNumber("containerPort") || 80;
const cpu = config.getNumber("cpu") || 512;
const memory = config.getNumber("memory") || 128;

const commonTags = {
    "Environment": `${getStack()}`,
    "Managed by Pulumi": "yes",
    "pulumi:Project": pulumi.getProject(),
    "pulumi:Stack": pulumi.getStack(),
}

// An ECS cluster to deploy into
const cluster = new aws.ecs.Cluster("cluster", {
    tags: commonTags,
});

// An ALB to serve the container endpoint to the internet
const loadbalancer = new awsx.lb.ApplicationLoadBalancer("loadbalancer", {
    tags: commonTags,
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

// Deploy an ECS Service on Fargate to host the application container
const webservice = new awsx.ecs.FargateService("web", {
    cluster: cluster.arn,
    assignPublicIp: true,
    taskDefinitionArgs: {
        container: {
            image: web.imageUri,
            cpu: cpu,
            memory: memory,
            essential: true,
            portMappings: [{
                containerPort: containerPort,
                targetGroup: loadbalancer.defaultTargetGroup,
            }],
        },
    },
    desiredCount: 3,
    tags: commonTags,
});

const apiservice = new awsx.ecs.FargateService("api", {
    cluster: cluster.arn,
    assignPublicIp: true,
    taskDefinitionArgs: {
        container: {
            image: web.imageUri,
            cpu: cpu,
            memory: memory,
            essential: true,
            portMappings: [{
                containerPort: containerPort,
                // targetGroup: loadbalancer.defaultTargetGroup,
            }],
        },
    },
    desiredCount: 3,
    tags: commonTags,
});

// The URL at which the container's HTTP endpoint will be available
export const url = pulumi.interpolate`http://${loadbalancer.loadBalancer.dnsName}`;