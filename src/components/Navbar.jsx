//this is the navbar section that displays the chatapp name, name of the owner of the user and a logout button
import React, { useContext } from 'react'
import {signOut} from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
  const {currentUser} = useContext(AuthContext)

  return (
    <div className='navbar'>
      <span className="logo">LetUsChat</span>
      <div className="user">
        <img src={currentUser.photoURL} alt="" />
        <div><span>{currentUser.displayName}</span>
        <span>(Me)</span></div>
        <button onClick={()=>signOut(auth)}>Logout</button>
      </div>
    </div>
  )
}

export default Navbar