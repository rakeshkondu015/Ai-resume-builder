# AI Resume Builder (SaaS) - End-to-End Documentation

This documentation describes the architecture, implementation, and deployment of the AI Resume Builder SaaS application. It is organized into three pages:

* **Page 1: Architecture, Data Models, & Security**
* **Page 2: Core Services (AI Suggestions & PDF Engine)**
* **Page 3: Production Cloud Deployment & Troubleshooting**

---

# Page 1: Architecture, Data Models, & Security

## 1. System Architecture
The application is designed as a modern decoupled SaaS platform consisting of a **React Frontend**, a **Spring Boot Backend**, a **PostgreSQL Database**, and an external **LLM Provider (Mistral AI)**.

```
       +---------------------------------------------+
       |             React.js Frontend               |
       |  (Vite + Router + Context API + Custom CSS)  |
       +---------------------------------------------+
                              │
                     REST API (Axios + JWT)
                              │
                              ▼
       +---------------------------------------------+
       |             Spring Boot Backend             |
       |  (Spring Security, Data JPA, Flying Saucer) |
       +---------------------------------------------+
            │                      │             │
            ▼                      ▼             ▼
   +----------------+     +---------------+   +------------+
   | PostgreSQL DB  |     | Mistral AI    |   | Local PDF  |
   | (Users,        |     | Chat API      |   | Compiler   |
   |  Documents)    |     | (Suggestions) |   | (OpenPDF)  |
   +----------------+     +---------------+   +------------+
```

## 2. Database Models (JPA Entities)
The database contains three main entities, mapped relationally:
1. **User (`users` table)**: Stores user registration details (name, email, password hashed with BCrypt), active role (`Role.ROLE_USER`), subscription tier (`FREE` or `PREMIUM`), and timestamps.
2. **Resume (`resumes` table)**: Linked to `User` via a Many-to-One relationship. To allow maximum flexibility for custom resume templates without rigid table structures, the resume section data (education, experience, projects, skills, languages) is stored in a dynamic `TEXT` column as a JSON payload.
3. **CoverLetter (`cover_letters` table)**: Stores generated letters, mapped to the user, along with the source job description text.

## 3. Security & Authentication (JWT)
Security is implemented using **Spring Security 6** with **stateless JWT tokens**:
* **BCrypt Hashing**: Passwords are encrypted before database insertion.
* **JWT Filter (`JwtFilter`)**: Every incoming request is intercepted. If a valid `Authorization: Bearer <token>` header is present, it extracts the email, fetches user authorities, and binds them to the Spring SecurityContextHolder.
* **CORS Policy**: Configured to dynamically match origin patterns (`*`) to allow secure cross-origin communication between the frontend client and backend APIs in production.

---

# Page 2: Core Services (AI Suggestions & PDF Engine)

## 1. AI Integration (Mistral AI)
The `MistralAiService` handles AI-related prompts using HTTP communication with the Mistral Chat Completions API. It features three specific optimization features:
1. **Professional Summary Generator**: Takes raw candidate highlights and compiles them into a cohesive 3-4 sentence bio targeted for a specific job title.
2. **Action-Verb Bullet Point Enhancer**: Enhances user-written experience descriptions to start with strong action verbs, quantify achievements, and sound professional.
3. **ATS Keyword Recommender**: Scans the user's current skills and recommends relevant technical terms to pass automated resume parsing systems.

* **Offline Fallback**: In the event that no Mistral API Key is configured, the service switches to a mock simulation mode, returning realistic generated values to ensure the app continues to function smoothly.

## 2. PDF Compiler (HTML-to-PDF)
Instead of forcing server-side template limitations, the PDF compilation engine leverages **Flying Saucer** coupled with **OpenPDF**:
1. The user selects a visual styling template (Modern, Classic, Creative, Minimalist) inside the React client.
2. When the user clicks "Export PDF", the client extracts the exact rendered HTML string representing the resume canvas.
3. The HTML is sent via a `POST /api/pdf/generate` payload to the backend.
4. The backend cleans the HTML (ensuring it is well-formed XML for the PDF engine), injects a print-friendly CSS stylesheet, and compiles it into a downloadable PDF binary stream.

---

# Page 3: Production Cloud Deployment & Troubleshooting

## 1. Containerization (Docker)
The codebase includes deployment instructions for container environments:
* **`backend/Dockerfile`**: A multi-stage build that compiles the Spring Boot JAR inside a Maven image and transfers the build artifact to a lightweight Alpine JRE 21 runtime container.
* **`frontend/Dockerfile`**: Compiles Vite production chunks and deploys them to an Alpine Nginx server.
* **`frontend/nginx.conf`**: Configures Nginx to serve the SPA static assets and proxy backend requests starting with `/api` to the Spring Boot service.

## 2. Deploying on Render.com
Render is used for credit-card-free deployment:
1. **PostgreSQL**: Deployed as a standalone database. The internal connection string is used by the backend.
2. **Spring Boot (Web Service)**: Deployed using the `backend/Dockerfile` config. The database credentials, dialect, and AI API keys are configured via environment variables.
3. **React Frontend (Static Site)**: Deployed from the `/frontend` subfolder. The API endpoint is bound using the `VITE_API_URL` environment variable.

## 3. Crucial Deployment Troubleshooting
1. **CORS Configuration**: Hardcoded origins (like `localhost:5173`) must be disabled in Spring Security in favor of dynamic wildcards (`setAllowedOriginPatterns`) to support hosted client endpoints.
2. **PostgreSQL Dialect Mismatch**: Using MySQL-specific `LONGTEXT` column definitions in JPA models causes table generation to fail in PostgreSQL. Replacing them with standard `TEXT` solves schema creation errors.
3. **JDBC URL Formatting**: Unlike command-line clients, Java JDBC connection strings do not accept inline username/password formatting (`jdbc:postgresql://user:pwd@host`). Instead, they must be formatted as `jdbc:postgresql://host/dbname` with separate user and password variables.
4. **Static Route Rewrites (404 Page)**: In SPAs, direct URL access or page refreshes on sub-paths (like `/login` or `/builder/1`) return a server-side 404. Adding a rewrite rule in the hosting provider (`/*` rewrite to `/index.html`) delegates route resolving to the client.
