from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

class UserConversation(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id", primary_key=True)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    display_name: str
    photo_url: Optional[str] = None
    
    conversations: List["Conversation"] = Relationship(back_populates="users", link_model=UserConversation)
    messages: List["Message"] = Relationship(back_populates="sender")

class Conversation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    users: List[User] = Relationship(back_populates="conversations", link_model=UserConversation)
    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversation.id")
    sender_id: int = Field(foreign_key="user.id")
    text: str
    img: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    sender: User = Relationship(back_populates="messages")
    conversation: Conversation = Relationship(back_populates="messages")
