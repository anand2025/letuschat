import os
import shutil
import re
import uuid
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from database import create_db_and_tables, get_session, engine
from models import User, Message, Conversation, UserConversation
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from websocket_manager import manager
from pydantic import BaseModel
from jose import jwt
from contextlib import asynccontextmanager

# Static files for avatars
UPLOAD_DIR = "uploads"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_db_and_tables()
    # Ensure uploads directory exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    yield
    # Shutdown logic (none needed for now)

app = FastAPI(title="LetUsChat API", lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

class UserRegister(BaseModel):
    display_name: str
    email: str
    password: str

@app.post("/register")
async def register(
    display_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    # Validations
    if not display_name.strip() or not email.strip() or not password.strip():
        raise HTTPException(status_code=400, detail="All fields are required")
    
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    if len(password) > 72:
        raise HTTPException(status_code=400, detail="Password must not exceed 72 characters")

    # Check if user exists
    from sqlalchemy import func
    existing_user = session.exec(select(User).where(func.lower(User.email) == email.lower())).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Save avatar
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    user = User(
        display_name=display_name,
        email=email,
        hashed_password=get_password_hash(password),
        photo_url=f"/uploads/{file_name}"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"user": user, "access_token": access_token}

@app.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
):
    if not email.strip() or not password.strip():
        raise HTTPException(status_code=400, detail="Email and password are required")

    from sqlalchemy import func
    user = session.exec(select(User).where(func.lower(User.email) == email.lower())).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"user": user, "access_token": access_token}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users/search", response_model=List[User])
async def search_users(q: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(User).where(User.display_name.ilike(f"%{q}%")).where(User.id != current_user.id)
    results = session.exec(statement).all()
    return results

@app.get("/conversations", response_model=List[dict])
async def get_conversations(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Find all conversations where current user is a participant
    statement = select(Conversation).join(UserConversation).where(UserConversation.user_id == current_user.id)
    convs = session.exec(statement).all()
    results = []
    for conv in convs:
        # Find the other user in each conversation
        user_stmt = select(User).join(UserConversation).where(UserConversation.conversation_id == conv.id).where(User.id != current_user.id)
        other_user = session.exec(user_stmt).first()
        if other_user:
            # Get last message
            last_msg = session.exec(
                select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at.desc())
            ).first()
            results.append({
                "id": str(conv.id),
                "userInfo": {
                    "id": other_user.id,
                    "display_name": other_user.display_name,
                    "photo_url": other_user.photo_url
                },
                "lastMessage": {"text": last_msg.text if last_msg else ""},
                "date": (last_msg.created_at if last_msg else conv.created_at).isoformat()
            })
    return results

@app.post("/conversations")
async def create_conversation(other_user_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Find all conversations of current user
    user_convs_stmt = select(Conversation).join(UserConversation).where(UserConversation.user_id == current_user.id)
    user_convs = session.exec(user_convs_stmt).all()
    
    # Check if other_user is in any of them
    for conv in user_convs:
        other_participant = session.exec(
            select(UserConversation).where(UserConversation.conversation_id == conv.id).where(UserConversation.user_id == other_user_id)
        ).first()
        if other_participant:
            return conv

    # Create new if not found
    other_user = session.get(User, other_user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    conv = Conversation()
    session.add(conv)
    session.flush() # Populate ID
    
    # Explicitly link users
    uc1 = UserConversation(user_id=current_user.id, conversation_id=conv.id)
    uc2 = UserConversation(user_id=other_user.id, conversation_id=conv.id)
    session.add(uc1)
    session.add(uc2)
    session.commit()
    session.refresh(conv)
    return conv

@app.get("/conversations/{conv_id}/messages", response_model=List[Message])
async def get_messages(conv_id: uuid.UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_at.asc())
    results = session.exec(statement).all()
    return results

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # Authenticate via token in URL for simplicity in WS
    try:
        # We need a session, so we can't easily use Depends here
        # Manual auth logic from auth.py
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        with Session(engine) as session:
            user = session.exec(select(User).where(User.email == email)).first()
            if not user:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
            
            await manager.connect(user.id, websocket)
            try:
                while True:
                    data = await websocket.receive_json()
                    # Expecting: { "type": "message", "conversation_id": "...", "text": "...", "img": "..." }
                    if data.get("type") == "message":
                        try:
                            conv_id = uuid.UUID(data["conversation_id"])
                        except (ValueError, TypeError, KeyError):
                            print(f"Invalid UUID received: {data.get('conversation_id')}")
                            continue
                            
                        msg_text = data.get("text", "")
                        msg_img = data.get("img")
                        
                        msg = Message(
                            conversation_id=conv_id,
                            sender_id=user.id,
                            text=msg_text,
                            img=msg_img
                        )
                        session.add(msg)
                        session.commit()
                        session.refresh(msg)
                        
                        # Broadcast to all users in the conversation
                        conv = session.get(Conversation, conv_id)
                        session.refresh(conv) # Ensure users are loaded
                        print(f"WS: Message from {user.id} in conv {conv_id}. Participants: {[u.id for u in conv.users]}")
                        
                        for participant in conv.users:
                            await manager.broadcast_to_user(participant.id, {
                                "type": "new_message",
                                "message": {
                                    "id": str(msg.id),
                                    "conversation_id": str(msg.conversation_id),
                                    "sender_id": msg.sender_id,
                                    "text": msg.text,
                                    "img": msg.img,
                                    "created_at": msg.created_at.isoformat()
                                }
                            })
            except WebSocketDisconnect:
                print(f"WS: Connection closed for user {user.id}")
                manager.disconnect(user.id, websocket)
    except Exception as e:
        print(f"WS error: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
