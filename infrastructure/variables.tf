variable "room_port" {
  default = 3001
}

variable "user_port" {
  default = 3000
}

variable "booking_port" {
  default = 3002
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "frontend_url" {
  type    = string
  default = "https://room-booking-system-ivory.vercel.app"
}

variable "origin" {
  type    = string
  default = "https://room-booking-system-ivory.vercel.app"
}

variable "auth0_issuer_base_url" {
  type    = string
  default = "https://dev-pscojes1p26xrh78.us.auth0.com/"
}

variable "auth0_audience" {
  type    = string
  default = "https://booking-system-api"
}

variable "mongo_uri" {
  description = "The connection string for the MongoDB cluster"
  type = string
  sensitive = true # This hides the value from the terminal output
}

variable "stripe_secret_key" {
  description = "The secret key for Stripe payments"
  type = string
  sensitive = true
}

variable "weather_api_url" {
    description = "Weather API Key"
    type = string
    sensitive = true
}