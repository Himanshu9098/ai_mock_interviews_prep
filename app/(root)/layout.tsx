import Link from 'next/link';
import Image from 'next/image';
import React, { ReactNode } from 'react'
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import SignOut from '@/components/SignOut';

const Rootlayout = async ({children}:{children:ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated(); // Replace with actual authentication logic

  if(!isUserAuthenticated)  redirect('/sign-in'); // Redirect to sign-in page if not authenticated
  

  return (
    <div className="root-layout">
      <nav className='flex items-center justify-between px-4 py-2'>
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo.svg' alt='logo' width={38} height={32}/>
          <h2 className='text-primary-100'>PrepWise</h2>
        </Link>

        <SignOut />
      </nav>

      {children}
    </div>
  )
}

export default Rootlayout;