# Security Group for the VPC Link (API Gateway Bridge)
resource "aws_security_group" "vpc_link_sg" {
  name        = "api-gateway-link-sg"
  vpc_id      = aws_vpc.main.id
  description = "Allows API Gateway to enter the VPC"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group for the Fargate Containers
resource "aws_security_group" "fargate_sg" {
  name        = "fargate-containers-sg"
  vpc_id      = aws_vpc.main.id
  description = "Allows traffic from VPC Link to containers"

  # Allow all internal traffic from the VPC Link
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.vpc_link_sg.id]
  }
  # Allow containers to reach the internet (Stripe, Auth0, DockerHub)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}