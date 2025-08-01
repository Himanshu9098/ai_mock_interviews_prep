import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewByUserId, getLatestInterviews } from '@/lib/actions/general.action'

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewByUserId(user?.id || ''),
    getLatestInterviews({ userId: user?.id || '', limit: 10 })
  ]);
  
  console.log('User Interviews:', userInterviews);
  console.log('Latest Interviews:', latestInterviews);


  const hasPastInterviews = userInterviews && userInterviews.length > 0;
  const hasUpcomingInterviews = latestInterviews && latestInterviews.length > 0;
  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview Ready with AI-powered Practice & Feedback</h2>
          <p className='text-lg'>Practice on real interview questions & get intant feedback</p>
          <Button asChild className='btn-primary max-sm:w-full'>
            <Link href='/interview'>Start an Interview</Link>
          </Button>
        </div>
        <Image src='/robot.png' alt='robo-image' width={400} height={400} className='max-sm:hidden' />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {
            hasPastInterviews ? (
              userInterviews.map((interview) => (
                <InterviewCard {...interview} key={interview.id} />
              ))

            ) : (<p>You haven&apos;t taken any interviews.</p>)
          }
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>
        <div className="interviews-section">
          {
            hasUpcomingInterviews ? (
              latestInterviews.map((interview) => (
                <InterviewCard {...interview} key={interview.id} />
              ))

            ) : (<p>There Are No New Interviews Available.</p>)
          }
        </div>
      </section>
    </>
  )
}

export default page