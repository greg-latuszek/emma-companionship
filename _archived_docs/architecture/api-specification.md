# API Specification

## API Style Decision

Based on our Tech Stack selection, we've chosen **REST** as our primary API communication standard. This decision was made because:
- Native support in Next.js API Routes
- Universal understanding across development teams  
- Excellent OpenAPI documentation ecosystem
- Simple integration with TanStack Query on the frontend

**Alternative Formats Considered:**
- **GraphQL**: Would provide flexible querying but adds complexity for our domain-specific workflows
- **tRPC**: Would give end-to-end type safety but limits API reusability for future mobile applications

For future iterations, if query flexibility becomes critical for complex relationship filtering, GraphQL could be considered as an additional endpoint alongside REST.

## REST API Specification

This OpenAPI 3.0 specification defines all REST endpoints for the emmaCompanionship application, including authentication, member management, companionship workflows, and graph visualization.

**Security Note:** The Member schema intentionally excludes the `passwordHash` field for security reasons. Password hashes are never returned in API responses and are only used internally for authentication validation.

```yaml
openapi: 3.0.0
info:
  title: emmaCompanionship API
  version: 1.0.0
  description: REST API for managing community members, companionship relationships, and organizational workflows
  contact:
    name: Development Team
    email: dev@emma-companionship.org

servers:
  - url: http://localhost:3000/api
    description: Local development server
  - url: https://emma-companionship.vercel.app/api
    description: Production server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
            - timestamp
            - correlationId
          properties:
            code:
              type: string
              example: "VALIDATION_FAILED"
            message:
              type: string
              example: "Invalid member data provided"
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            correlationId:
              type: string
              format: uuid

    Member:
      type: object
      required:
        - id
        - firstName
        - lastName
        - gender
        - maritalStatus
        - communityEngagementStatus
        - accompanyingReadiness
        - languages
        - geographicUnitId
      properties:
        id:
          type: string
          format: uuid
        firstName:
          type: string
        lastName:
          type: string
        gender:
          type: string
          enum: [male, female]
        maritalStatus:
          type: string
          enum: [single, married, widowed, consecrated]
        communityEngagementStatus:
          type: string
          enum: [Looker-On, In-Probation, Commited, In-Fraternity-Probation, Fraternity]
        accompanyingReadiness:
          type: string
          enum: [Not Candidate, Candidate, Ready, Active, Overwhelmed, Deactivated]
        languages:
          type: array
          items:
            type: string
        geographicUnitId:
          type: string
          format: uuid
        email:
          type: string
          format: email
        phone:
          type: string
        dateOfBirth:
          type: string
          format: date
        imageUrl:
          type: string
          format: uri
        notes:
          type: string
        consecratedStatus:
          type: string
          enum: [priest, deacon, seminarian, sister, brother]
        coupleId:
          type: string
          format: uuid

    Companionship:
      type: object
      required:
        - id
        - companionId
        - companionType
        - accompaniedId
        - accompaniedType
        - status
        - startDate
      properties:
        id:
          type: string
          format: uuid
        companionId:
          type: string
          format: uuid
        companionType:
          type: string
          enum: [member, couple]
        accompaniedId:
          type: string
          format: uuid
        accompaniedType:
          type: string
          enum: [member, couple]
        status:
          type: string
          enum: [proposed, active, archived]
        healthStatus:
          type: string
          enum: [green, yellow, red, gray]
        healthStatusUpdatedAt:
          type: string
          format: date-time
          description: "Timestamp when health status was last updated"
        startDate:
          type: string
          format: date
        endDate:
          type: string
          format: date

    GraphData:
      type: object
      required:
        - nodes
        - edges
      properties:
        nodes:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              type:
                type: string
                enum: [member, couple]
              data:
                type: object
        edges:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              source:
                type: string
              target:
                type: string
              type:
                type: string
                enum: [companionship, supervision]

security:
  - BearerAuth: []

paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: Authenticate user and get access token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/Member'
                  roles:
                    type: array
                    items:
                      type: object
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /members:
    get:
      tags:
        - Members
      summary: List members with optional filtering
      parameters:
        - name: unitId
          in: query
          schema:
            type: string
            format: uuid
        - name: filters
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of members
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Member'
    
    post:
      tags:
        - Members
      summary: Create a new member
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Member'
      responses:
        '201':
          description: Member created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /members/{id}:
    get:
      tags:
        - Members
      summary: Get member by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Member details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Member'
        '404':
          description: Member not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /members/{id}/eligible-companions:
    get:
      tags:
        - Members
      summary: Get eligible companions for a member
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Categorized list of eligible companions
          content:
            application/json:
              schema:
                type: object
                properties:
                  perfectMatches:
                    type: array
                    items:
                      $ref: '#/components/schemas/Member'
                  softViolations:
                    type: array
                    items:
                      $ref: '#/components/schemas/Member'

  /data/import/analyze:
    post:
      tags:
        - Data Import
      summary: Analyze spreadsheet for complete data import mapping
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Detected data structure and column headers for mapping
          content:
            application/json:
              schema:
                type: object
                properties:
                  detectedHeaders:
                    type: array
                    items:
                      type: string
                  suggestedMappings:
                    type: object

  /data/import/execute:
    post:
      tags:
        - Data Import
      summary: Execute bulk data import (members + companionships) with field mappings
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                mappings:
                  type: object
      responses:
        '200':
          description: Data import (members + companionships) completed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  created:
                    type: integer
                  errors:
                    type: integer
                  errorDetails:
                    type: array
                    items:
                      type: object
        '207':
          description: Partial success with some errors
          content:
            application/json:
              schema:
                type: object
                properties:
                  created:
                    type: integer
                  failed:
                    type: integer
                  errors:
                    type: array

  /companionships:
    post:
      tags:
        - Companionships
      summary: Propose a new companionship (initiates approval workflow)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - companionId
                - companionType
                - accompaniedId
                - accompaniedType
              properties:
                companionId:
                  type: string
                  format: uuid
                companionType:
                  type: string
                  enum: [member, couple]
                accompaniedId:
                  type: string
                  format: uuid
                accompaniedType:
                  type: string
                  enum: [member, couple]
      responses:
        '201':
          description: Companionship proposal created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'

  /companionships/direct:
    post:
      tags:
        - Companionships
      summary: Create companionship directly (bypass approval if authorized)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - companionId
                - accompaniedId
              properties:
                companionId:
                  type: string
                  format: uuid
                accompaniedId:
                  type: string
                  format: uuid
      responses:
        '201':
          description: Companionship created directly
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'
        '202':
          description: Sent for approval workflow
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'

  /companionships/reassign:
    post:
      tags:
        - Companionships
      summary: Reassign an accompanied member to a new companion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - oldCompanionshipId
                - newCompanionId
                - accompaniedId
              properties:
                oldCompanionshipId:
                  type: string
                  format: uuid
                newCompanionId:
                  type: string
                  format: uuid
                accompaniedId:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Reassignment proposal created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'
        '400':
          description: Constraint violations prevent reassignment
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /companionships/{id}/health:
    patch:
      tags:
        - Companionships
      summary: Update companionship health status
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - healthStatus
              properties:
                healthStatus:
                  type: string
                  enum: [green, yellow, red, gray]
      responses:
        '200':
          description: Health status updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Companionship'

  /graph/{unitId}:
    get:
      tags:
        - Graph
      summary: Get graph visualization data for a geographic unit
      parameters:
        - name: unitId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: filters
          in: query
          schema:
            type: string
          description: Comma-separated filter criteria (e.g., healthStatus,memberType,roleType)
      responses:
        '200':
          description: Graph data with nodes and edges
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GraphData'
```

-----
