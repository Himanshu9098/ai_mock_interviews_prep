'use client'
import React from 'react'
import { signOut } from '@/lib/actions/auth.action';
import { toast } from 'sonner';

const SignOut = () => {
    const handleSignOut = async () => {
    const response = await signOut();
    if (response.success) {
      toast.success(response.message);
    } else {
      console.error('Failed to sign out:', response.message);
      toast.error(response.message);
    }
  };

  return (
    <>
        <button className='btn-secondary' onClick={handleSignOut}>
          <span className='text-white'>Sign Out</span>
        </button>
    </>
  )
}

export default SignOut