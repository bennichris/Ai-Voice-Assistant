variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "public_key_path" {
  description = "Path to your public SSH key file (absolute path)"
  type        = string
}

variable "instance_type" {
  default = "t3.micro"
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH from (restrict to your IP for security)"
  default     = "0.0.0.0/0"
}
