# The API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "booking-app-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://room-booking-system-ivory.vercel.app"]
    allow_methods = ["*"]
    allow_headers = ["*"]
    allow_credentials = true
  }
}

# The VPC Link Bridge
resource "aws_apigatewayv2_vpc_link" "link" {
  name               = "fargate-bridge"
  security_group_ids = [aws_security_group.vpc_link_sg.id]
  subnet_ids         = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

# Room Integration
resource "aws_apigatewayv2_integration" "room_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = aws_service_discovery_service.room.arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.link.id
}

# User Integration
resource "aws_apigatewayv2_integration" "user_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = aws_service_discovery_service.user.arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.link.id
}

# Booking Integration
resource "aws_apigatewayv2_integration" "booking_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = aws_service_discovery_service.booking.arn
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.link.id
}

# Room Routes
resource "aws_apigatewayv2_route" "room_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/rooms"
  target    = "integrations/${aws_apigatewayv2_integration.room_integration.id}"
}
resource "aws_apigatewayv2_route" "room_base_singular" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/room"
  target    = "integrations/${aws_apigatewayv2_integration.room_integration.id}"
}
resource "aws_apigatewayv2_route" "room_proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/rooms/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.room_integration.id}"
}

# User Routes
resource "aws_apigatewayv2_route" "user_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/users"
  target    = "integrations/${aws_apigatewayv2_integration.user_integration.id}"
}
resource "aws_apigatewayv2_route" "user_base_singular" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/user"
  target    = "integrations/${aws_apigatewayv2_integration.user_integration.id}"
}
resource "aws_apigatewayv2_route" "user_proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/users/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.user_integration.id}"
}

resource "aws_apigatewayv2_route" "auth_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/auth"
  target    = "integrations/${aws_apigatewayv2_integration.user_integration.id}"
}
resource "aws_apigatewayv2_route" "auth_proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/auth/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.user_integration.id}"
}

# Booking Routes
resource "aws_apigatewayv2_route" "booking_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/bookings"
  target    = "integrations/${aws_apigatewayv2_integration.booking_integration.id}"
}
resource "aws_apigatewayv2_route" "booking_base_singular" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/booking"
  target    = "integrations/${aws_apigatewayv2_integration.booking_integration.id}"
}
resource "aws_apigatewayv2_route" "booking_proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/v1/bookings/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.booking_integration.id}"
}

# Final Stage Deployment
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Output the Live URL to your terminal
output "api_gateway_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}