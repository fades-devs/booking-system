resource "aws_ecs_cluster" "main" {
  name = "booking-app-cluster"
}

# Create the Log Groups explicitly in Terraform
resource "aws_cloudwatch_log_group" "room_logs" {
  name              = "/ecs/room-service"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "user_logs" {
  name              = "/ecs/user-service"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "booking_logs" {
  name              = "/ecs/booking-service"
  retention_in_days = 7
}

# Task Definition for Room
resource "aws_ecs_task_definition" "room_task" {
  family                   = "room-service-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn # Injects the S3 permissions automatically

  container_definitions = jsonencode([
    {
      name      = "room-container"
      image     = "fadesdevs/room-service:latest"
      essential = true
      portMappings = [{ containerPort = 3001, protocol = "tcp" }]
      environment = [
        { name = "PORT", value = tostring(var.room_port) },
        { name = "MONGO_URI", value = var.mongo_uri },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "S3_BUCKET_NAME", value = aws_s3_bucket.room_images.bucket },
        { name = "AUTH0_ISSUER_BASE_URL", value = var.auth0_issuer_base_url },
        { name = "AUTH0_AUDIENCE", value = var.auth0_audience },
        { name = "FRONTEND_URL", value = var.frontend_url },
        { name = "ORIGIN", value = var.origin }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/room-service"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Task Definition for User
resource "aws_ecs_task_definition" "user_task" {
  family                   = "user-service-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn # Injects the S3 permissions automatically

  container_definitions = jsonencode([
    {
      name      = "user-container"
      image     = "fadesdevs/user-service:latest"
      essential = true
      portMappings = [{ containerPort = 3000, protocol = "tcp" }]
      environment = [
        { name = "PORT", value = tostring(var.user_port) },
        { name = "MONGO_URI", value = var.mongo_uri },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "AUTH0_ISSUER_BASE_URL", value = var.auth0_issuer_base_url },
        { name = "AUTH0_AUDIENCE", value = var.auth0_audience }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/user-service"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Task Definition for Booking
resource "aws_ecs_task_definition" "booking_task" {
  family                   = "booking-service-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn # Injects the S3 permissions automatically

  container_definitions = jsonencode([
    {
      name      = "booking-container"
      image     = "fadesdevs/booking-service:latest"
      essential = true
      portMappings = [{ containerPort = var.booking_port, protocol = "tcp" }]
      environment = [
        { name = "PORT", value = tostring(var.booking_port) },
        { name = "MONGO_URI", value = var.mongo_uri },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "AUTH0_ISSUER_BASE_URL", value = var.auth0_issuer_base_url },
        { name = "AUTH0_AUDIENCE", value = var.auth0_audience },
        { name = "STRIPE_SECRET_KEY", value = var.stripe_secret_key },
        { name = "FRONTEND_URL", value = var.frontend_url },
        { name = "ORIGIN", value = var.origin },
        { name = "USER_API_URL", value = aws_apigatewayv2_api.api.api_endpoint },
        { name = "ROOM_API_URL", value = aws_apigatewayv2_api.api.api_endpoint },
        { name = "WEATHER_API_URL", value = trimsuffix(aws_lambda_function_url.weather_url.function_url, "/") }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/booking-service"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# The Room ECS Service
resource "aws_ecs_service" "room_svc" {
  name            = "room-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.room_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.fargate_sg.id]
    assign_public_ip = true # Bypasses the NAT Gateway requirement
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.room.arn
    container_name = "room-container"
    container_port = 3001
  }
}

# The User ECS Service
resource "aws_ecs_service" "user_svc" {
  name            = "user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.fargate_sg.id]
    assign_public_ip = true # Bypasses the NAT Gateway requirement
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.user.arn
    container_name = "user-container"
    container_port = 3000
  }
}

# The Booking ECS Service
resource "aws_ecs_service" "booking_svc" {
  name            = "booking-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.booking_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.fargate_sg.id]
    assign_public_ip = true # Bypasses the NAT Gateway requirement
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.booking.arn
    container_name = "booking-container"
    container_port = 3002
  }
}