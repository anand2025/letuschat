# LetUsChat Technical Documentation (FastAPI & PostgreSQL Edition)

LetUsChat is a real-time messaging web application. Originally powered by Firebase, it has been migrated to a custom-built backend using FastAPI and PostgreSQL, with WebSockets for real-time communication.

---

## 🚀 Technology Stack

- **Frontend**: React.js, SCSS, Context API
- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **Real-time Messaging**: WebSockets
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local filesystem (under `backend/uploads/`)

---

## 🏗️ Architecture Design

### Backend (Python/FastAPI)
- **`backend/main.py`**: The central application hub, containing all API endpoints and WebSocket connection handling.
- **`backend/models.py`**: Single source of truth for database schemas (User, Conversation, Message, and join tables).
- **`backend/auth.py`**: Handles password hashing (Bcrypt) and JWT generation/validation.
- **`backend/database.py`**: Manages the SQLModel engine and session factory.
- **`backend/websocket_manager.py`**: A dedicated manager to track active WebSocket connections and facilitate message broadcasting.

### Frontend (React)
- **`src/context/AuthContext.js`**: Manages user authentication state using JWT and localStorage.
- **`src/context/ChatContext.js`**: Orchestrates state for the active chat and manages the shared WebSocket connection.
- **`src/components/Input.jsx`**: Sends messages via the WebSocket connection.
- **`src/components/Messages.jsx`**: Renders messages received via the WebSocket and initial history fetched from the REST API.

---

## 📊 Data Model (PostgreSQL)

### 1. `user`
- `id` (Serial, Primary Key)
- `email` (Unique String)
- `hashed_password` (String)
- `display_name` (String)
- `photo_url` (String, points to local filepath)

### 2. `conversation`
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)

### 3. `userconversation`
Join table (Many-to-Many) between users and conversations.

### 4. `message`
- `id` (UUID, Primary Key)
- `conversation_id` (FK to conversation)
- `sender_id` (FK to user)
- `text` (String)
- `img` (Nullable String)
- `created_at` (Timestamp)

---

## ✨ Key Features

1. **Self-Hosted Backend**: Complete control over data and application logic.
2. **JWT Authentication**: Secure, stateless authentication.
3. **Real-time Persistence**: Messages are saved to PostgreSQL and immediately broadcasted via WebSockets.
4. **Local Avatar Storage**: User profile pictures are saved locally within the server's filesystem.
5. **Searchable Users**: Find other users via a case-insensitive name search.

---

## 🛠️ Setup & Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your database in `.env`:
   ```bash
   DATABASE_URL=postgresql://user:pass@localhost/letuschat
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the React app:
   ```bash
   npm start
   ```

---

## 🔐 Security Considerations

- **Password Hashing**: Uses Passlib with Bcrypt for secure storage.
- **Auth Guards**: Routes are protected using dependencies that validate JWT signatures.
- **CORS Configuration**: Restricted origins should be configured for production deployment.
