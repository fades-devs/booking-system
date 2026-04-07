# Conference Room Booking System

A scalable, cloud-native conference room booking platform built with a microservices architecture.

**[View Live Project](https://room-booking-system-ivory.vercel.app/)**

> Website's Homepage
<img width="800" alt="room-booking-system-ivory vercel app_(Nest Hub Max)" src="https://github.com/user-attachments/assets/03c54536-498b-4b9c-9780-c51002e3b681" />

## Motivation
This project began as a standard university assignment but quickly evolved beyond local development into scalability, cloud infrastructure and DevOps. Building this allowed me to bridge the gap between writing code and deploying reliable, distributed systems in the cloud.

## What Problem It Solves
Managing conference room bookings effectively requires handling multiple user roles, secure transactions, and real-time availability. This system provides a seamless interface for clients to search and book rooms, and for partners to manage their listings. It also introduces a dynamic pricing engine that automatically adjusts booking costs based on real-time weather forecasts at the room's location.

## Key Features & Architecture Highlights
* **Microservices Architecture:** Independently deployable services (User, Room, Booking, Weather) ensuring loose coupling and separation of concerns.
* **Infrastructure as Code (IaC):** Entire AWS infrastructure provisioned and managed using Terraform.
* **Serverless Computing:** Weather-based dynamic pricing powered by AWS Lambda.
* **Automated CI/CD:** GitHub Actions workflows for automated testing (with Jest), Docker image building, and zero-downtime deployments to AWS ECS Fargate.
* **Identity & Security:** Secure authentication integrated with Auth0 (JWT).
* **Secure Payments:** PCI DSS compliant checkout process handled by Stripe.

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Vercel |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL) |
| **Infrastructure** | AWS (ECS Fargate, API Gateway, Lambda, S3, VPC, CloudWatch), Terraform |
| **DevOps** | Docker, Docker Hub, GitHub Actions |
| **3rd Party Services** | Auth0, Stripe, Weather API |

## System Architecture

> System Architecture Diagram
<img width="1600" alt="architecture-diagram" src="https://github.com/user-attachments/assets/b0f90147-0386-4f14-b948-f3dc04b12cfd" />

## What I Learned
Transitioning this project to the cloud taught me invaluable lessons about distributed systems:
* **Container Orchestration:** Managing container lifecycles, task definitions, and networking using AWS ECS on Fargate.
* **Cloud Networking:** Securing services within an Amazon VPC using public/private subnets and strict Security Groups.
* **State Management in IaC:** Handling Terraform state files securely using S3 backend storage and resolving state drift.
* **API Routing:** Using Amazon API Gateway with VPC Links to securely route public internet traffic to private containers.
* **Debugging Distributed Systems:** Moving away from local terminal logs and utilizing AWS CloudWatch to track multiple microservices.

## Future Roadmap
Here are the next steps planned for this application:
* Implement further client-side and server-side user input validation.
* Frontend Decoupling: Separate the user interfaces (a Client Portal and a Partner Portal). This will enhance security, improve the user experience and improve page load performance.
* Add advanced search filters (e.g., strict availability dates).
* Separate infrastructure into distinct `Development` and `Production` environments via Terraform workspaces.
* Enhance Stripe webhook integration to automatically process `completed` and `cancelled` payment events asynchronously.
