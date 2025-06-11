terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-022ed17c1748e6763"
  instance_type = "t2.micro"
  key_name = "aws_key"
  user_data = file("${path.module}/userdata.tpl")
  tags = {
    Name = "fish-api"
  }
}

