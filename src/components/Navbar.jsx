import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext)

  return (
    <div className='navbar'>
      <span className="logo">LetUsChat</span>
      <div className="user">
        <img src={currentUser?.photo_url ? `http://localhost:8000${currentUser.photo_url}` : ""} alt="" />
        <div>
          <span>{currentUser?.display_name}</span>
          <span>(Me)</span>
        </div>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

export default Navbar