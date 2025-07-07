import { db } from '@/firebase/admin';

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

export async function getLatestInterviews(params : GetLatestInterviewsParams): Promise<Interview[] | null> {
    try {
        const {userId , limit = 10} = params;

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
