import { useState, useEffect } from 'react';
import { useEntityData } from './api-hooks';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/api'; // Import the centralized client
import { Tutor, Student, TutorWithStudent } from '@/types';

const TUTORS_API_BASE_URL = '/tutors'; // Remove base URL since apiClient has it
const STUDENTS_API_BASE_URL = '/student';

export const useTutors = () => {
  const { data: tutors, isLoading, setData: setTutors } = useEntityData<Tutor>(TUTORS_API_BASE_URL);
  const [enrichedTutors, setEnrichedTutors] = useState<TutorWithStudent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const enrichTutors = async () => {
      if (tutors.length > 0) {
        try {
          const tutorsWithStudents = await Promise.all(
            tutors.map(async (tutor) => {
              try {
                const studentResponse = await apiClient.get(`${STUDENTS_API_BASE_URL}/${tutor.studentId}`);
                return { 
                  ...tutor, 
                  student: studentResponse.data 
                };
              } catch (error) {
                console.error(`Failed to fetch student ${tutor.studentId}`, error);
                return { 
                  ...tutor, 
                  student: { 
                    id: tutor.studentId,
                    name: 'Unknown Tutor',
                    email: '',
                    bio: 'No bio available',
                    Location: 'Unknown'
                  } 
                };
              }
            })
          );
          setEnrichedTutors(tutorsWithStudents);
        } catch (error) {
          console.error('Error enriching tutors:', error);
          toast({ 
            title: 'Error', 
            description: 'Failed to load tutor details', 
            variant: 'destructive' 
          });
        }
      }
    };

    enrichTutors();
  }, [tutors, toast]);

  return { 
    tutors: enrichedTutors, 
    isLoading,
    setTutors 
  };
};