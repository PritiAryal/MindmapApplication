# MindmapApplication

## AI-Powered Mind Mapping Application

A professional, interactive mind mapping platform packed with advanced features—**AI-powered mind map generation (OpenAI ChatGPT API)**, **YouTube Data API video enrichment**, plus robust tools for manual mind map creation, drag-and-drop editing, search, user management, and security. The application is built with **React** (frontend), **Spring Boot (Java)** (REST API backend), and **Python** (AI and automation). Secure user authentication is managed with **JWT**.

---

## Project Overview

This platform enables users to generate, organize, and visualize mind maps enhanced by **artificial intelligence**—and also offers a manual editing and management tools. Users can automatically generate mind maps from a topic (using OpenAI ChatGPT API), manually build and edit maps, search and manage their own content, and explore related YouTube videos for every concept. All data and operations are protected by robust security and role-based access.

---

## Key Technologies & Integrations

- **Java Spring Boot REST API**: Robust backend exposing all data, authentication, and business logic endpoints.
- **JWT-Based Authentication**: Secure user session management and granular authorization.
- **Python Microservice**: Handles AI-powered mind map generation and video enrichment.
    - **OpenAI ChatGPT API**: For intelligent topic suggestion.
    - **YouTube Data API**: For fetching, and recommending videos per node.
- **React Frontend**: Modern UI and **ReactFlow** for mind map creation and editing.
- **Tailwind CSS**: For responsive, mobile-first design.

---

## Key Features

### AI-Powered Automatic Mind Map Generation
- **Input a keyword or topic** and instantly receive a structured mind map, automatically generated via **OpenAI ChatGPT API**.
- **Automatic video enrichment**: Each node is linked to relevant YouTube videos (via **YouTube Data API**) for deeper exploration.

#### Example
If a user enters `Machine Learning`:
- The system generates nodes like "Algorithms", "Data Preprocessing", "Model Evaluation", etc.
- Each node is automatically linked to curated YouTube videos.

---

### Manual Mind Map Creation & Editing
- **Create your own mind maps** from scratch—add, edit, and organize nodes and concepts.
- **Drag-and-drop interface**: Move nodes, restructure relationships, and connect ideas visually.
- **Dynamic node creation**: Add, edit, and position nodes.
- **Hierarchical structure**: Parent-child relationships with expand/collapse functionality.
- **Custom node types**: Specialized nodes for different content types.
- **Smart edge connections**: Automatic relationship detection and visual connections.

---

### Interactive Visual Interface
- **ReactFlow integration**: node-based editor.
- **Drag & drop**: Intuitive node positioning and rearrangement.
- **Zoom & pan**: Navigate large mind maps with smooth controls.
- **MiniMap**: Bird's-eye view for quick navigation.
- **Expand/collapse node hierarchy** for efficient navigation.
- **Real-time node and edge manipulation** with immediate visual feedback.

---

### Search, User Management & Security
- **Search functionality**: Instantly find mind maps by title or content.
- **User-specific mind maps**: Each user has their own private workspace; data is securely stored and isolated.
- **JWT authentication**: Secure sessions and data protection.
- **CRUD operations**: Full lifecycle management for mind maps, nodes, edges, and videos.

---

### Modern Web Technologies
- **Responsive design**: **Tailwind CSS**.
- **RESTful API**: Clean, documented endpoints for all operations.
- **Real-time updates**: Live synchronization of changes.
- **Cross-origin support**: Seamless frontend-backend communication.

---

## Architecture Principles

- **Component-based React design**.
- **Service layer pattern** (Spring Boot) for clean separation of business logic.
- **RESTful API** design for stateless, scalable backend.
- **Python microservice** for AI and video logic, connecting via API.
- **Entity relationship modeling** for normalized database design (Spring Data JPA).

---

## System Architecture


```mermaid
graph TB
    A[React App Tailwind CSS]
    B[ReactFlow Canvas]
    C[Authentication JWT]
    D[State Management]
    E[Custom Nodes]
    F[Interactive Edges]
    G[Spring Boot REST API]
    H[Authentication Service JWT]
    I[Mindmap Service]
    J[Node Service]
    K[Edge Service]
    Q[Python Microservice]
    R[OpenAI ChatGPT API]
    S[YouTube Data API]
    T[SQLite & Audio Cache]
    L[H2 Database]
    M[Applicationuser Entity]
    N[Mindmap Entity]
    O[Node Entity]
    P[Edge Entity]
    V[Video Entity]

    A --> B
    A --> C
    A --> D
    B --> E
    B --> F
    A --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> Q
    Q --> R
    Q --> S
    Q --> T
    H --> L
    I --> L
    J --> L
    K --> L
    M --> N
    N --> O
    O --> P
    O --> V
    O --> O
```


## MindmapApplication Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend [Frontend React Tailwind]
        FE[React App]
        FE --> FE_RF[ReactFlow Canvas]
        FE --> FE_AUTH[JWT Auth Login or Register]
        FE --> FE_API[Axios API calls]
    end

    subgraph Backend [Backend Spring Boot]
        BE_API[/REST API/]
        BE_AUTH[SecurityService JWT Token]
        BE_USER[ApplicationuserController]
        BE_MM[MindmapController]
        BE_NODE[NodeController]
        BE_EDGE[EdgeController]
        BE_VIDEO[VideoController]
        BE_GENMM[GenerateMindmapService]
        BE_USER --> BE_AUTH
        BE_USER --> BE_API
        BE_MM --> BE_API
        BE_NODE --> BE_API
        BE_EDGE --> BE_API
        BE_VIDEO --> BE_API
        BE_MM --> BE_GENMM
    end

    subgraph AI_Microservice [Python AI Microservice]
        PY_GENMM[Python: \Generate mindmap]
        PY_GPT[OpenAI ChatGPT API]
        PY_YT[YouTube Data API]
        PY_SQLITE[Audio/Video Cache sqlite3]
        PY_GENMM --> PY_GPT
        PY_GENMM --> PY_YT
        PY_GENMM --> PY_SQLITE
    end

    subgraph Database [Database]
        DB_H2[H2 DB]
        DB_USER[Applicationuser]
        DB_MM[Mindmap]
        DB_NODE[Node]
        DB_EDGE[Edge]
        DB_VIDEO[Video]
        DB_USER --> DB_MM
        DB_MM --> DB_NODE
        DB_NODE --> DB_EDGE
        DB_NODE --> DB_VIDEO
    end

    %% Data Flow
    FE_API --> BE_API
    FE_AUTH --> BE_AUTH
    BE_API -.-> DB_H2
    BE_GENMM -->|generate mindmap| PY_GENMM
    PY_GENMM -->|POST new data| BE_API
    BE_API --> DB_H2

    %% User actions
    FE -- "User interacts (login, create, edit, etc.)" --> FE_API
    FE_API -- "REST calls" --> BE_API
    BE_API -- "CRUD user, mindmap, node, edge, video" --> DB_H2

    %% AI features
    FE_API -- "Request: Generate Mindmap from Keyword" --> BE_GENMM
    BE_GENMM -- "Invoke Python microservice" --> PY_GENMM
    PY_GENMM -- "Calls OpenAI & YouTube APIs" --> PY_GPT
    PY_GENMM -- "Fetches videos" --> PY_YT
    PY_GENMM -- "Returns nodes/videos to backend" --> BE_GENMM
    BE_GENMM -- "Save to DB" --> DB_H2
    FE_API -- "Get AI-generated mindmap & videos" --> BE_API
    BE_API -- "Respond to frontend" --> FE

    %% Video links
    FE_API -- "Get videos per node" --> BE_VIDEO
    BE_VIDEO -- "Query videos in DB" --> DB_VIDEO
    DB_VIDEO --> FE

    %% JWT Authentication flow
    FE_AUTH -- "Login/Register" --> BE_USER
    BE_USER -- "Create/validate JWT Token" --> BE_AUTH
    BE_AUTH -- "Return JWT" --> FE_AUTH
    FE_API -- "JWT in headers" --> BE_API

    %% Node linking & paste-link
    FE_API -- "Paste node/link nodes" --> BE_NODE
    BE_NODE -- "Update mindmap/node/edge" --> DB_NODE
    BE_NODE -- "Create edge" --> BE_EDGE
    BE_EDGE -- "Save edge" --> DB_EDGE
```

```mermaid
flowchart LR
    subgraph Frontend
        FE[React App\nReactFlow, JWT, Tailwind]
    end

    subgraph Backend
        BE_API[Spring Boot REST API Controllers, Services, JWT]
    end

    subgraph Database
        DB[H2 Database]
    end

    subgraph AI_Microservice
        PY[Python Microservice OpenAI & YouTube API]
    end

    FE -- "REST API calls Axios, JWT" --> BE_API
    BE_API -- "CRUD + AI requests" --> DB
    BE_API -- "Trigger AI Generation" --> PY
    PY -- "POST Mindmap/Video Data" --> BE_API
```

### AI-powered mind map generation 

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Python
    participant OpenAI
    participant YouTube
    participant Database

    User->>Frontend: Input topic, click "Generate Mindmap"
    Frontend->>Backend: POST /mindmaps/generate/{userId} (keyword)
    Backend->>Python: Generate mindmap request
    Python->>OpenAI: Request mindmap structure
    Python->>YouTube: Search & enrich nodes with videos
    Python->>Backend: POST mindmap, nodes, edges, videos
    Backend->>Database: Save generated data
    Backend->>Frontend: Respond "Mindmap generated"
    Frontend->>User: Show new mindmap, enriched with videos
```


---

## Data Flow

1. **Manual mode**: Users build mind maps interactively in React; changes are persisted via REST API.
2. **AI mode**: Users input a topic; Spring Boot backend delegates to Python microservice.
3. Python service uses **OpenAI ChatGPT API** to generate mind map structure and **YouTube Data API** to find relevant videos.
4. Python service sends POST requests to backend to persist mind map, node, edge, and video data.
5. Frontend retrieves and displays the mind map for the authenticated user (**JWT authentication**).

---

## Technology Stack

### Frontend

| Technology      | Purpose                                    |
|-----------------|--------------------------------------------|
| **React**           | User interface, interactive editing      |
| **ReactFlow**       | Node-based mind map visualization        |
| React Router    | Routing                                    |
| **Tailwind CSS**    | Responsive design                       |
| Axios           | API communication                          |
| JWT Decode      | Token parsing/authentication               |
| React Icons     | Icon library                               |
| Heroicons       | SVG icons                                  |

### Backend

| Technology          | Purpose                                     |
|---------------------|---------------------------------------------|
| **Spring Boot (Java)**   | Backend framework, exposes REST API      |
| **Spring Security**      | JWT authentication, role-based access    |
| Spring Data JPA     | ORM/database abstraction                    |
| **H2 Database**         | Embedded relational DB                   |
| Jackson             | JSON serialization                          |
| Lombok              | Boilerplate reduction                       |

### AI & Python Integration

| Technology           | Purpose                                |
|----------------------|----------------------------------------|
| **Python**               | AI and microservices                 |
| **OpenAI ChatGPT API**   | Topic generation, NLP                |
| **YouTube Data API**     | Video search and metadata            |
| NetworkX             | Graph data structures                  |
| Plotly               | Visualization                          |
| yt-dlp               | YouTube audio download                 |
| sqlite3              | Local video/audio cache                |
| requests             | API communication with backend         |

---

## Domain Model Overview

- **Applicationuser**: Represents an authenticated user (id, name, email, password, mindmaps).
- **Mindmap**: Mind map entity (id, title, reference to Applicationuser, list of nodes).
- **Node**: Mind map element (id, label, parentId, x, y, reference to Mindmap, children, videos, expanded, edges).
- **Edge**: Link between nodes (id, source Node, target Node, hidden).
- **Video**: YouTube video (id, url, title, reference to Node).

---

## Entity Relationship Diagram

```mermaid
erDiagram
    Applicationuser ||--o{ Mindmap : owns
    Mindmap ||--o{ Node : contains
    Node ||--o{ Edge : outgoingEdges
    Node ||--o{ Edge : incomingEdges
    Node ||--o{ Video : videos

    Applicationuser {
        int id PK
        string name
        string email
        string password
    }

    Mindmap {
        int id PK
        string title
        int applicationuser_id FK
    }

    Node {
        string id PK
        string label
        string parentId
        double x
        double y
        int mindmap_id FK
        boolean expanded
    }

    Edge {
        string id PK
        string sourceId FK
        string targetId FK
        boolean hidden
    }

    Video {
        string id PK
        string url
        string title
        string node_id FK
    }
```

---

## Python-side SQLite Table Schema

- `mindmap_keyword_topic (sha256 TEXT, topic TEXT, url TEXT, UNIQUE(sha256, topic, url))` (**Python**, **YouTube Data API** integration)

---

## API Documentation (Spring Boot REST API)

### Mind Map Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/mindmaps/user/{userId}` | Create new mind map (**JWT required**) |
| GET    | `/mindmaps/user/{userId}` | Get user's mind maps (**JWT required**) |
| GET    | `/mindmaps/{id}`          | Get mind map by id (**JWT required**) |
| GET    | `/mindmaps/user/{userId}/search` | Search mind maps (**JWT required**) |
| PUT    | `/mindmaps/{id}`          | Update mind map (**JWT required**) |

### Node Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/mindmaps/mindmap/{mindmapId}/node` | Create new node (**JWT required**) |
| GET    | `/mindmaps/mindmap/{mindmapId}/node` | Get nodes for mind map (**JWT required**) |
| PUT    | `/node/{nodeId}`                     | Update node (**JWT required**) |
| DELETE | `/node/{nodeId}`                     | Delete node (**JWT required**) |

### Edge Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/mindmaps/edges/{sourceId}/{targetId}` | Create edge (**JWT required**) |
| GET    | `/nodes/{nodeId}/edges`                 | Get edges for node (**JWT required**) |
| PUT    | `/edges/{edgeId}`                       | Update edge (**JWT required**) |

### Video & AI Endpoints (**Python Microservice → Spring Boot REST API**)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/mindmaps/node/{nodeId}/video` | Add YouTube video to node |
| POST   | `/mindmaps/user/{userId}`       | Create mind map (from AI service) |
| POST   | `/mindmaps/mindmap/{mindmapId}/node` | Create node (from AI service) |
| POST   | `/mindmaps/edges/{sourceId}/{targetId}` | Create edge (from AI service) |

### Authentication Endpoints

| Method | Endpoint | Description      |
|--------|----------|------------------|
| POST   | `/auth/login`     | User authentication (**JWT issued**) |
| POST   | `/auth/register`  | User registration                    |
| GET    | `/auth/profile`   | Get user profile (**JWT required**)  |

---
