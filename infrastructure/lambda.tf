# 1. Zip the local Weather Node.js code
data "archive_file" "weather_zip" {
  type        = "zip"
  source_file  = "../weather-service/index.js" # Path to weather code folder (only index file)
  output_path = "weather-api.zip"
}

# 2. The IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "weather-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

# Give Lambda basic permission to write logs to CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 3. The Actual Lambda Function
resource "aws_lambda_function" "weather_api" {
  function_name    = "weather-service"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler" # matches your exported function
  runtime          = "nodejs18.x"    # Or nodejs20.x depending on code

  environment {
    variables = {
      WEATHER_API_KEY = var.weather_api_url
    }
  }
  
  filename         = data.archive_file.weather_zip.output_path
  source_code_hash = data.archive_file.weather_zip.output_base64sha256
}

# 4. Generate the Live Function URL
resource "aws_lambda_function_url" "weather_url" {
  function_name      = aws_lambda_function.weather_api.function_name
  authorization_type = "NONE" # Allows your Booking service to ping it without AWS signing
}

# 1. Permission to hit the Function URL
resource "aws_lambda_permission" "allow_public_url" {
  statement_id           = "FunctionURLAllowPublicAccessFromTerraform"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.weather_api.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

# 2. Permission for the URL to trigger the actual Lambda code
resource "aws_lambda_permission" "allow_public_invoke" {
  statement_id           = "FunctionURLAllowInvokeActionFromTerraform"
  action                 = "lambda:InvokeFunction"
  function_name          = aws_lambda_function.weather_api.function_name
  principal              = "*"
}