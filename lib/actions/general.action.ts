import { feedbackSchema } from '@/constants';
import { db } from '@/firebase/admin';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    try {
        const interviews = await db
            .collection('interviews')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return interviews.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Interview[];
    } catch (error) {
        console.error('Error fetching interview by user ID', error);
        return null; // Error occurred while fetching the interview
    }
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    try {
        const { userId, limit = 10 } = params;

        const interviews = await db
            .collection('interviews')
            .orderBy('createdAt', 'desc')
            .where('userId', '!=', userId)
            .where('finalized', '==', true)
            .limit(limit)
            .get();

        return interviews.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Interview[];
    } catch (error) {
        console.error('Error fetching interviews', error);
        return null; // Error occurred while fetching the interview
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const interview = await db
            .collection('interviews')
            .doc(id)
            .get();

        return interview.data() as Interview | null;
    } catch (error) {
        console.error('Error fetching interview by user ID', error);
        return null; // Error occurred while fetching the interview
    }
}


export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;

    try {
        const formattedTranscript = transcript.map((sentence : {role: string; content: string})=>(
            `-${sentence.role}: ${sentence.content}\n`
        )).join('');

        const {object : {totalScore,categoryScores, strengths,areasForImprovement,finalAssessment}} = await generateObject({
            model: google("gemini-2.0-flash-001",
            {structuredOutputs : false}),
            schema: feedbackSchema,
            prompt: `Generate feedback for the following interview transcript:\n\n${formattedTranscript}\n`,
            system: `You are an expert interviewer and feedback generator.
            Provide detailed feedback based on the transcript provided.`
        });

        const feedback = await db.collection('feedback').add({
            interviewId,
            userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt : new Date().toISOString()
        })

        return {
            success : true,
            feedbackId: feedback.id,
        }
    } catch (error) {
        console.error('Error creating feedback', error);
        return {
            success: false
        }
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const {interviewId,userId} = params;
    try {
        const feedback = await db
            .collection('feedback')
            .where('interviewId','==',interviewId)
            .where('userId','==',userId)
            .limit(1)
            .get();

        if(feedback.empty) return null;

        const feedbackDoc = feedback.docs[0]

        return {
            id:feedbackDoc.id,
            ...feedbackDoc.data()
        } as Feedback;
    } catch (error) {
        console.error('Error fetching interview by user ID', error);
        return null; // Error occurred while fetching the interview
    }
}