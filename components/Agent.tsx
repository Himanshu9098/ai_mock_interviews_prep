'use client';

import React, { use, useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { create } from 'domain';
import { createFeedback } from '@/lib/actions/general.action';


enum CallStatus {
  CONNECTING = 'Connecting...',
  INACTIVE = 'Inactive',
  ACTIVE = 'Active',
  FINISHED = 'Finished',
}

interface SavedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");


  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };

        setMessages(prev => [...prev, newMessage]);
      }
    }

    const onSpeechStart = () => {
      setIsSpeaking(true);
    }

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    }

    const onError = (error: Error) => {
      console.log('Error:', error);
    }

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    }

  }, []);

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    console.log("Generating feedback for messages:", messages);
    const result = await createFeedback({
      interviewId:interviewId!,
      userId:userId!,
      transcript: messages
    })

    if(result.success && result.feedbackId){
      console.log("Feedback generated successfully with ID:", result.feedbackId);
      router.push(`/interview/${interviewId}/feedback`);
    }
    else{
      console.error("Failed to generate feedback");
      router.push('/');
    }
  }

  useEffect(() => {
    if (callStatus == CallStatus.FINISHED) {
      if (type == "generate") {
        router.push('/')
      }else{
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId])

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(
        undefined,
        undefined,
        undefined,
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
        {
          variableValues: {
            username: userName,
            userid: userId,
          },
        }
      );
    }
     else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.INACTIVE);
    vapi.stop();
  }

  const latestMessage = messages[messages.length - 1]?.content || '';
  const isCallInactiveORFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;


  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" width={65} height={54} className='object-cover' alt='avatar' />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" width={65} height={54} alt='user-avatar' className='rounded-full object-cover size-[120px]' />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus != CallStatus.ACTIVE ? (
          <button className='relative btn-call' onClick={handleCall}>
            <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus === CallStatus.CONNECTING && 'hidden')}
            />
            <span>
              {isCallInactiveORFinished ? 'Call' : '. . .'}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            <span>End</span>
          </button>
        )}
      </div>
    </>
  )
}

export default Agent