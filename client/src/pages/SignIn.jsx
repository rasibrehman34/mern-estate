import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignIn() {

  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.id] : e.target.value
    })   
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true)
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Add this line
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false){
        setError(data.message);
        setLoading(false);
        return; 
      } 
      setLoading(false)
      setError(null )
      navigate('/')

    } catch (error) {
      setLoading(false)
      setError(error.message)    
    }
  }
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-center text-3xl font-semibold my-7'>Sign In</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4' >
          <input type="email" placeholder='email' id="email" onChange={handleChange} className='p-3 border  bg-white  rounded-lg' />
          <input type="password" placeholder='password' id="password" onChange={handleChange} className='p-3 border  bg-white  rounded-lg' />
          <button disabled={loading} className='p-3 rounded-lg bg-slate-700 text-white uppercase hover:opacity-95 disabled:opacity-80'>{ loading? 'loading...' : 'Sign In' }</button>
        </form>
        <div className='flex gap-2 mt-5'>
          <p>Dont have an account?</p>
          <Link to={"/sign-up"}>
          <span className='text-blue-700'>Sign up</span>
          </Link>
        </div>
        {error && <p className='text-red-600'>{error}</p>}
    </div>
  )
}
