# The Namespace
resource "aws_service_discovery_private_dns_namespace" "internal" {
  name        = "booking-app.local"
  description = "Internal DNS for microservices"
  vpc         = aws_vpc.main.id
}

# The Room Service GPS Entry
resource "aws_service_discovery_service" "room" {
  name = "room"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    dns_records {
      ttl  = 60
      type = "SRV"
    }
  }
}

# The User Service GPS Entry
resource "aws_service_discovery_service" "user" {
  name = "user"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    dns_records {
      ttl  = 60
      type = "SRV"
    }
  }
}

# The Booking Service GPS Entry
resource "aws_service_discovery_service" "booking" {
  name = "booking"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    dns_records {
      ttl  = 60
      type = "SRV"
    }
  }
}