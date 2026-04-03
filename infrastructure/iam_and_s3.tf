# 1. The S3 Bucket
resource "aws_s3_bucket" "room_images" {
  bucket = "room-picture-s3-fades-2026"
}

# 2. Standard ECS Execution Role (To pull Docker images)
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecsTaskExecutionRole-TF"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" } }]
  })
}
resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 3. ECS Task Role (This REPLACES .env AWS Keys)
resource "aws_iam_role" "ecs_task_role" {
  name = "ecsTaskRole-TF"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" } }]
  })
}

# Give the Task Role permission to use S3
resource "aws_iam_role_policy" "s3_access_policy" {
  name = "S3AccessPolicy"
  role = aws_iam_role.ecs_task_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Action = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"], Effect = "Allow", Resource = "${aws_s3_bucket.room_images.arn}/*" }]
  })
}