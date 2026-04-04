# 1. The S3 Bucket
resource "aws_s3_bucket" "room_images" {
  bucket = "room-picture-s3-fades-2026"
}

# Turn off the public block
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket                  = aws_s3_bucket.room_images.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Allow anyone on the internet to READ (GetObject) the images
resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.room_images.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = ["s3:GetObject"]
        Effect    = "Allow"
        Principal = "*"
        Resource  = "${aws_s3_bucket.room_images.arn}/*"
      },
    ]
  })
  # Ensure the block is removed before applying the policy
  depends_on = [aws_s3_bucket_public_access_block.public_access] 
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