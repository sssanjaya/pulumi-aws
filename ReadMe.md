# How to Run

install docker on your machine: [Install Docker](https://docs.docker.com/engine/install/)


Open terminal and run:
```
docker-compose up
```

Open a web browser and navigate to 
```
http://localhost:3000
```

# Application Details

- Web: ASP.NET Core 5.0 Web APP
  - this application requires an environment variabled called "ApiAddress" which will be the address of the Web Api.
- API: ASP.NET Core 5.0 Web API

# pulumi-aws-infra-bastion-host
AWS infra 
- vpc
- private subnet
- public subnet
- route tables
- internet gateway
- nat gateway
- public ec2 instance
- one private ec2 instance

### Note:Public ec2 instance is used as bastion host or jump server which is used to do ssh login into private instance

## Table of contents
* [Technologies](#technologies)
* [Operating-System](#operating-system)
* [Pre-requisite](#pre-requisite)
* [Set-up](#set-up)
* [Usage](#usage)


## Technologies
Project is created with:
* AWS - Cloud provider
* Pulumi - Infrastructure as Code
* Python - Base programing language of Pulumi

## Operating-System
* Ubuntu

## Pre-requisite
* An AWS Account
* An AWS CLI needs to be installed
* Your AWS credentials. 
  * You can create a new Access Key on this page.[link](https://console.aws.amazon.com/iam/home?#/security_credentials)
* Python3 needs to be installed in machine
* Pulumi Engine needs to be installed in machine. [link](https://www.pulumi.com/docs/get-started/aws/begin/)

## Set-up
* Git needs to be installed in host machine
   * [git](https://linuxconfig.org/install-git-in-linux-redhat-8)
* Install Python3, pulumi locally.
   * [Python3 installation](https://linuxconcept.com/how-to-install-python-3-on-rhel-8-red-hat-enterprise-linux/)
   * Pulumi : 
      * [Download Pulumi](https://www.pulumi.com/docs/get-started/aws/begin/)
      * [Install Pulumi](https://www.pulumi.com/docs/get-started/aws/begin/)
* Set up AWS credentials in ~/.aws/credentials.
   * The easiest way to do so is by setting up the AWS CLI. 
      * [Install CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
      * [Install CLI on linux](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html)
* once aws-cli is installed in host machine, set up aws credentials using below command
   ```
   $ aws configure
   ```
   * This will ask for your AWS access key and AWS Secret as below
      - AWS Access Key ID [None] : ******
      - AWS Secret Access Key [None] : ******
      - Default region name : [leave it none , press enter]
      - Default output format : [leave it none, press enter]
* Generate new pulumi project
   * [Link to pulumi project](https://www.pulumi.com/docs/get-started/aws/create-project/)
   ```
   $ pulumi new
   ```
   Note : Create an empty directory and then run 'pulumi new' command as this command generates set of pre-defined files (requirements.txt,         Pulumi.yaml,__main__.py)
      The pulumi new command creates a new Pulumi project with some basic scaffolding based on the cloud and language specified.

      If this is your first time running pulumi new or most other pulumi commands, you will be prompted to log in to the Pulumi service. The Pulumi CLI works in tandem with the Pulumi service in order to deliver a reliable experience. It is free for individual use, with features available for teams. Hitting ENTER at the prompt opens up a web browser allowing you to either sign in or sign up.

      After logging in, the CLI will proceed with walking you through creating a new project.

      First, you will be asked for a project name and description. Hit ENTER to accept the default values or specify new values.

      Next, you will be asked for the name of a stack. Hit ENTER to accept the default value of dev.

      Finally, you will be prompted for some configuration values for the stack. For AWS projects, you will be prompted for the AWS region. You can accept the default value or choose another value like us-west-2.

## Usage
* Files used in this project with their functionality listed
  * requirements.txt :- list of python libs needs to be installed
  * Pulumi.yaml :- Yaml file containing details about pulumi run-time virtual environment
  * __main__.py :- Python file where logic is being written
  * Pulumi.dev.yaml :- Input parameters mentioned in this file
  
To run this project, execute below commands.
  * create dummy directory with some valid name
    ```
    mkdir pulumi-workshop
    cd pulumi-workshop
    ```
  * Next run 'pulumi new' command
    ```
    pulumi new
    ```
  * Copy contents of __main__.py of this repo into your __main__.py (Auto-generated one)
  * Change Source-Instance-Id , Target-Instance-ID and region in Pulumi.dev.yaml file (Give your instance-ID detials here)
  * Run 'pulumi up' command
    ```
    pulumi up
    ```
  * Pulumi will do dry run and show you output, how does your infra looks like. If you are fine with changes, Select 'Yes' and infra will be created.

  # Architectural Diagram 

  ![alt text](https://github.com/sssanjaya/pulumi-aws/blob/main/aws.png?raw=true)
