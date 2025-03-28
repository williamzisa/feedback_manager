"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/navigation/header";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";
import { queries } from "@/lib/supabase/queries";

interface PageParams {
  id: string;
  [key: string]: string | string[];
}

type Person = {
  id: string;
  name: string;
  remainingAnswers: number;
};

type Skill = {
  type: 'Execution' | 'Strategy' | 'Soft';
  remainingFeedback: number;
};

type Rating = 0 | 1 | 2 | 3 | 4 | 5;

type FeedbackData = {
  id: string;
  value: number | null;
  receiver: string | null;
  comment: string | null;
  question: {
    id: string;
    type: string;
    description: string;
  } | null;
};

type FeedbackWithRelations = FeedbackData & {
  users: {
    id: string;
    name: string;
    surname: string;
  } | null;
  question: {
    id: string;
    type: string;
    description: string;
  } | null;
};

// Definizione del sistema di temi per i tipi di skill
const skillThemes = {
  SOFT: {
    main: '#F5A623',
    bg: '#FFF8F0',
    text: '#D48519',
    border: 'border-[#F5A623]',
    bgClass: 'bg-[#FFF8F0]',
    textClass: 'text-[#F5A623]',
    buttonClass: 'bg-[#F5A623] hover:bg-[#D48519]'
  },
  STRATEGY: {
    main: '#00BFA5',
    bg: '#E0F7FA',
    text: '#00A693',
    border: 'border-[#00BFA5]',
    bgClass: 'bg-[#E0F7FA]',
    textClass: 'text-[#00BFA5]',
    buttonClass: 'bg-[#00BFA5] hover:bg-[#00A693]'
  },
  EXECUTION: {
    main: '#4285F4',
    bg: '#E8F0FE',
    text: '#3B77DB',
    border: 'border-[#4285F4]',
    bgClass: 'bg-[#E8F0FE]',
    textClass: 'text-[#4285F4]',
    buttonClass: 'bg-[#4285F4] hover:bg-[#3B77DB]'
  }
} as const;

function EvaluateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<PageParams>();
  const sessionId = params.id;
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState<boolean>(false);
  const personId = searchParams.get("person");
  const [selectedSkill, setSelectedSkill] = useState<Skill["type"]>("Execution");
  const [rating, setRating] = useState<Rating>(0);
  const [comment, setComment] = useState<string>("");
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFeedbacks, setCurrentFeedbacks] = useState<FeedbackData[]>([]);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [hasCommentChanged, setHasCommentChanged] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [comment]);

  // Funzioni helper per i conteggi
  const countRemainingFeedbacks = useCallback((feedbacks: FeedbackWithRelations[], personId: string) => {
    return feedbacks.filter(f => 
      f.receiver === personId && 
      f.value === null
    ).length;
  }, []);

  const updatePeopleList = useCallback((feedbacks: FeedbackWithRelations[]) => {
    const peopleMap = new Map<string, { name: string; remaining: number }>();
    
    feedbacks.forEach(feedback => {
      if (feedback.users) {
        const personId = feedback.users.id;
        const fullName = `${feedback.users.name} ${feedback.users.surname}`;
        
        if (!peopleMap.has(personId)) {
          peopleMap.set(personId, {
            name: fullName,
            remaining: 0
          });
        }
      }
    });

    peopleMap.forEach((data, id) => {
      data.remaining = countRemainingFeedbacks(feedbacks, id);
    });

    return Array.from(peopleMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      remainingAnswers: data.remaining
    }));
  }, [countRemainingFeedbacks]);

  const updateSkillsList = useCallback((feedbacks: FeedbackWithRelations[], personId: string): Skill[] => {
    // Filtra prima i feedback della persona
    const personFeedbacks = feedbacks.filter(f => f.receiver === personId);
    
    // Crea un oggetto per tenere traccia dei conteggi per tipo
    const skillCounts: Record<string, { total: number; remaining: number }> = {
      'SOFT': { total: 0, remaining: 0 },
      'EXECUTION': { total: 0, remaining: 0 },
      'STRATEGY': { total: 0, remaining: 0 }
    };
    
    // Conta i feedback per ogni tipo
    personFeedbacks.forEach(feedback => {
      const type = (feedback.question?.type || '').toUpperCase();
      if (skillCounts[type]) {
        skillCounts[type].total++;
        if (feedback.value === null) {
          skillCounts[type].remaining++;
        }
      }
    });

    // Crea l'array delle skill con i conteggi aggiornati
    return [
      { type: 'Soft' as const, remainingFeedback: skillCounts['SOFT'].remaining },
      { type: 'Execution' as const, remainingFeedback: skillCounts['EXECUTION'].remaining },
      { type: 'Strategy' as const, remainingFeedback: skillCounts['STRATEGY'].remaining }
    ];
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        const currentUser = await queries.users.getCurrentUser();

        const { data: feedbacks } = await supabase
          .from('feedbacks')
          .select(`
            id,
            value,
            receiver,
            comment,
            question:questions (
              id,
              type,
              description
            ),
            users!feedbacks_receiver_fkey (
              id,
              name,
              surname
            )
          `)
          .eq('session_id', sessionId)
          .eq('sender', currentUser.id);

        if (feedbacks) {
          const peopleList = updatePeopleList(feedbacks);
          setPeople(peopleList);

          if (personId) {
            const currentPersonData = peopleList.find(p => p.id === personId);
            setCurrentPerson(currentPersonData || null);

            // Filtra e ordina i feedback per tipo (soft -> execution -> strategy)
            const personFeedbacks = feedbacks
              .filter(f => f.receiver === personId)
              .sort((a, b) => {
                const typeOrder = { 'SOFT': 0, 'EXECUTION': 1, 'STRATEGY': 2 };
                const typeA = (a.question?.type || '').toUpperCase();
                const typeB = (b.question?.type || '').toUpperCase();
                return (typeOrder[typeA as keyof typeof typeOrder] || 0) - 
                       (typeOrder[typeB as keyof typeof typeOrder] || 0);
              });

            setCurrentFeedbacks(personFeedbacks);
            
            if (personFeedbacks.length > 0) {
              const firstFeedback = personFeedbacks[0];
              setSelectedSkill(firstFeedback.question?.type as Skill["type"]);
              setRating(firstFeedback.value as Rating || 0);
              setComment(firstFeedback.comment || '');
              setCurrentFeedbackIndex(0);
            }

            setSkills(updateSkillsList(feedbacks, personId));
          }
        }

        // Sottoscrizione real-time per i feedback
        supabase
          .channel('feedbacks-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'feedbacks',
              filter: `session_id=eq.${sessionId} AND sender=eq.${currentUser.id}`
            },
            async () => {
              // Ricarica i dati quando ci sono cambiamenti
              const { data: updatedFeedbacks } = await supabase
                .from('feedbacks')
                .select(`
                  id,
                  value,
                  receiver,
                  comment,
                  question:questions (
                    id,
                    type,
                    description
                  ),
                  users!feedbacks_receiver_fkey (
                    id,
                    name,
                    surname
                  )
                `)
                .eq('session_id', sessionId)
                .eq('sender', currentUser.id);

              if (updatedFeedbacks) {
                // Aggiorna la lista delle persone
                const peopleList = updatePeopleList(updatedFeedbacks);
                setPeople(peopleList);

                // Se abbiamo un personId, aggiorniamo i conteggi per tipo
                if (personId) {
                  const currentPersonData = peopleList.find(p => p.id === personId);
                  setCurrentPerson(currentPersonData || null);

                  // Aggiorna la lista dei tipi
                  setSkills(updateSkillsList(updatedFeedbacks, personId));

                  // Aggiorna i feedback correnti
                  const personFeedbacks = updatedFeedbacks
                    .filter(f => f.receiver === personId)
                    .sort((a, b) => {
                      const typeOrder = { 'SOFT': 0, 'EXECUTION': 1, 'STRATEGY': 2 };
                      const typeA = (a.question?.type || '').toUpperCase();
                      const typeB = (b.question?.type || '').toUpperCase();
                      return (typeOrder[typeA as keyof typeof typeOrder] || 0) - 
                             (typeOrder[typeB as keyof typeof typeOrder] || 0);
                    });
                  setCurrentFeedbacks(personFeedbacks);
                }
              }
            }
          )
          .subscribe();

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId, personId, updatePeopleList, updateSkillsList]);

  // Aggiungiamo questo effetto per aggiornare il currentPerson appena abbiamo i dati delle persone
  useEffect(() => {
    if (people.length > 0 && personId) {
      const person = people.find(p => p.id === personId);
      setCurrentPerson(person || null);
    }
  }, [people, personId]);

  const handlePersonSelect = (person: Person) => {
    router.push(
      `/session/${sessionId}/evaluate?person=${encodeURIComponent(person.id)}`
    );
    setIsPersonMenuOpen(false);
    setIsSkillMenuOpen(false);
  };

  const handleSkillSelect = useCallback((skill: Skill) => {
    setSelectedSkill(skill.type);
    setIsSkillMenuOpen(false);
    setIsPersonMenuOpen(false);
    
    // Trova il primo feedback del tipo selezionato
    const firstIndexOfType = currentFeedbacks.findIndex(
      f => (f.question?.type || '').toUpperCase() === skill.type.toUpperCase()
    );
    
    if (firstIndexOfType !== -1) {
      setCurrentFeedbackIndex(firstIndexOfType);
      const selectedFeedback = currentFeedbacks[firstIndexOfType];
      setRating(selectedFeedback.value as Rating || 0);
      setComment(selectedFeedback.comment || '');
      setHasCommentChanged(false);
    }
  }, [currentFeedbacks]);

  const handleRatingChange = async (newRating: Rating) => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    setRating(newRating);
    const supabase = createClientComponentClient<Database>();
    const currentUser = await queries.users.getCurrentUser();
    
    await supabase
      .from('feedbacks')
      .update({ 
        value: newRating
      })
      .eq('id', currentFeedbacks[currentFeedbackIndex].id);

    // Aggiorna immediatamente i conteggi locali
    const { data: updatedFeedbacks } = await supabase
      .from('feedbacks')
      .select(`
        id,
        value,
        receiver,
        comment,
        question:questions (
          id,
          type,
          description
        ),
        users!feedbacks_receiver_fkey (
          id,
          name,
          surname
        )
      `)
      .eq('session_id', sessionId)
      .eq('sender', currentUser.id);

    if (updatedFeedbacks) {
      // Aggiorna la lista delle persone
      const peopleList = updatePeopleList(updatedFeedbacks);
      setPeople(peopleList);

      // Se abbiamo un personId, aggiorniamo i conteggi per tipo
      if (personId) {
        const currentPersonData = peopleList.find(p => p.id === personId);
        setCurrentPerson(currentPersonData || null);

        // Aggiorna la lista dei tipi
        setSkills(updateSkillsList(updatedFeedbacks, personId));
      }
    }

    // Aggiorna il feedback locale
    const updatedLocalFeedbacks = [...currentFeedbacks];
    updatedLocalFeedbacks[currentFeedbackIndex] = {
      ...updatedLocalFeedbacks[currentFeedbackIndex],
      value: newRating
    };
    setCurrentFeedbacks(updatedLocalFeedbacks);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    setHasCommentChanged(true);
  };

  const handleNoFeedback = async () => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    try {
      const supabase = createClientComponentClient<Database>();
      const currentUser = await queries.users.getCurrentUser();
      const feedbackId = currentFeedbacks[currentFeedbackIndex].id;
      
      const { error: updateError } = await supabase
        .from('feedbacks')
        .update({
          value: 0,
          comment: null
        })
        .eq('id', feedbackId);

      if (updateError) {
        setError('Errore nell\'aggiornamento del feedback');
        throw updateError;
      }

      // Aggiorna immediatamente i conteggi locali
      const { data: updatedFeedbacks } = await supabase
        .from('feedbacks')
        .select(`
          id,
          value,
          receiver,
          comment,
          question:questions (
            id,
            type,
            description
          ),
          users!feedbacks_receiver_fkey (
            id,
            name,
            surname
          )
        `)
        .eq('session_id', sessionId)
        .eq('sender', currentUser.id);

      if (updatedFeedbacks) {
        // Aggiorna la lista delle persone
        const peopleList = updatePeopleList(updatedFeedbacks);
        setPeople(peopleList);

        // Se abbiamo un personId, aggiorniamo i conteggi per tipo
        if (personId) {
          const currentPersonData = peopleList.find(p => p.id === personId);
          setCurrentPerson(currentPersonData || null);

          // Aggiorna la lista dei tipi
          setSkills(updateSkillsList(updatedFeedbacks, personId));
        }
      }

      // Aggiorna il feedback locale
      const updatedLocalFeedbacks = [...currentFeedbacks];
      updatedLocalFeedbacks[currentFeedbackIndex] = {
        ...updatedLocalFeedbacks[currentFeedbackIndex],
        value: 0,
        comment: null
      };
      setCurrentFeedbacks(updatedLocalFeedbacks);
      setRating(0);
      setComment('');
      setHasCommentChanged(false);
    } catch {
      setError('Si è verificato un errore durante l\'operazione');
    }
  };

  const handleSaveComment = async () => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    const supabase = createClientComponentClient<Database>();
    
    await supabase
      .from('feedbacks')
      .update({ 
        comment: comment || null
      })
      .eq('id', currentFeedbacks[currentFeedbackIndex].id);

    // Aggiorna il feedback locale
    const updatedFeedbacks = [...currentFeedbacks];
    updatedFeedbacks[currentFeedbackIndex] = {
      ...updatedFeedbacks[currentFeedbackIndex],
      comment: comment || null
    };
    setCurrentFeedbacks(updatedFeedbacks);
    setHasCommentChanged(false);
  };

  const handleCancelRating = async () => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    try {
      const supabase = createClientComponentClient<Database>();
      const currentUser = await queries.users.getCurrentUser();
      const feedbackId = currentFeedbacks[currentFeedbackIndex].id;

      const { error: updateError } = await supabase
        .from('feedbacks')
        .update({
          value: null,
          comment: null
        })
        .eq('id', feedbackId);

      if (updateError) {
        setError('Errore nell\'annullamento del feedback');
        throw updateError;
      }

      // Aggiorna immediatamente i conteggi locali
      const { data: updatedFeedbacks } = await supabase
        .from('feedbacks')
        .select(`
          id,
          value,
          receiver,
          comment,
          question:questions (
            id,
            type,
            description
          ),
          users!feedbacks_receiver_fkey (
            id,
            name,
            surname
          )
        `)
        .eq('session_id', sessionId)
        .eq('sender', currentUser.id);

      if (updatedFeedbacks) {
        // Aggiorna la lista delle persone
        const peopleList = updatePeopleList(updatedFeedbacks);
        setPeople(peopleList);

        // Se abbiamo un personId, aggiorniamo i conteggi per tipo
        if (personId) {
          const currentPersonData = peopleList.find(p => p.id === personId);
          setCurrentPerson(currentPersonData || null);

          // Aggiorna la lista dei tipi
          setSkills(updateSkillsList(updatedFeedbacks, personId));
        }
      }

      // Aggiorniamo lo stato locale
      const updatedLocalFeedbacks = [...currentFeedbacks];
      updatedLocalFeedbacks[currentFeedbackIndex] = {
        ...updatedLocalFeedbacks[currentFeedbackIndex],
        value: null,
        comment: null
      };
      setCurrentFeedbacks(updatedLocalFeedbacks);
      setRating(0);
      setComment('');
      setHasCommentChanged(false);
    } catch {
      setError('Si è verificato un errore durante l\'operazione');
    }
  };

  const handleNext = useCallback(() => {
    if (!currentFeedbacks.length) return;
    
    // Se ci sono modifiche non salvate al commento, mostra l'alert
    if (hasCommentChanged) {
      const shouldStay = window.confirm('Non hai salvato il commento, sei sicuro di procedere alla prossima domanda?\n\nClicca "OK" per restare qui\nClicca "Annulla" per procedere senza salvare');
      
      if (shouldStay) {
        return; // L'utente ha scelto di restare
      }
      // L'utente ha scelto di procedere senza salvare
    }
    
    // Passa al feedback successivo
    const nextIndex = currentFeedbackIndex + 1;
    if (nextIndex < currentFeedbacks.length) {
      const nextFeedback = currentFeedbacks[nextIndex];
      // Aggiorna il tipo selezionato se cambia
      if ((nextFeedback.question?.type || '').toUpperCase() !== selectedSkill.toUpperCase()) {
        setSelectedSkill(nextFeedback.question?.type as Skill["type"]);
      }
      setCurrentFeedbackIndex(nextIndex);
      setRating(nextFeedback.value as Rating || 0);
      setComment(nextFeedback.comment || '');
      setHasCommentChanged(false);
    }
  }, [currentFeedbacks, currentFeedbackIndex, selectedSkill, hasCommentChanged]);

  const handlePrevious = useCallback(() => {
    if (!currentFeedbacks.length) return;
    
    // Passa semplicemente al feedback precedente, la sequenza è già ordinata
    const prevIndex = currentFeedbackIndex - 1;
    if (prevIndex >= 0) {
      const prevFeedback = currentFeedbacks[prevIndex];
      // Aggiorna il tipo selezionato se cambia
      if ((prevFeedback.question?.type || '').toUpperCase() !== selectedSkill.toUpperCase()) {
        setSelectedSkill(prevFeedback.question?.type as Skill["type"]);
      }
      setCurrentFeedbackIndex(prevIndex);
      setRating(prevFeedback.value as Rating || 0);
      setComment(prevFeedback.comment || '');
      setHasCommentChanged(false);
    }
  }, [currentFeedbacks, currentFeedbackIndex, selectedSkill]);

  // Modifica dei click handler per i dropdown
  const handlePersonMenuClick = () => {
    setIsPersonMenuOpen(!isPersonMenuOpen);
    setIsSkillMenuOpen(false);
  };

  const handleSkillMenuClick = () => {
    setIsSkillMenuOpen(!isSkillMenuOpen);
    setIsPersonMenuOpen(false);
  };

  const handleNextPerson = useCallback(() => {
    if (!people.length) return;
    
    // Trova l'indice della persona corrente
    const currentPersonIndex = people.findIndex(p => p.id === personId);
    
    // Trova la prossima persona con feedback rimanenti
    const nextIndex = (currentPersonIndex + 1) % people.length;
    const nextPerson = people[nextIndex];
    
    // Naviga alla prossima persona
    router.push(`/session/${sessionId}/evaluate?person=${encodeURIComponent(nextPerson.id)}`);
  }, [people, personId, sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={people.find(p => p.id === personId)?.name.split(' ')[0] || ''} showBackButton={true} />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={people.find(p => p.id === personId)?.name.split(' ')[0] || ''} showBackButton={true} />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Errore!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
      </div>
    );
  }

  const currentFeedback = currentFeedbacks[currentFeedbackIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={people.find(p => p.id === personId)?.name.split(' ')[0] || ''} 
        showBackButton={true} 
        backUrl={`/session/${sessionId}`}
      />

      <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32 mt-[60px]">
        {/* Person Selection */}
        <div className="bg-white rounded-[20px] p-3 sm:p-4 mb-3 sm:mb-4 relative shadow-sm hover:shadow-md transition-shadow duration-200">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={handlePersonMenuClick}
          >
            <span className="text-lg font-medium">{currentPerson?.name || 'Seleziona persona'}</span>
            <div className="flex items-center gap-2">
              {currentPerson?.remainingAnswers === 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPerson();
                  }}
                  className="flex items-center gap-1 text-green-500 hover:text-green-600 transition-colors text-sm bg-green-50 px-3 py-1.5 rounded-full"
                >
                  <span>Passa al successivo</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <span className="text-red-500 text-sm">
                  {currentPerson?.remainingAnswers} rimanenti
                </span>
              )}
              <svg
                className={`w-5 h-5 transition-transform ${
                  isPersonMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {isPersonMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[20px] shadow-lg z-10">
              {people
                .sort((a, b) => b.remainingAnswers - a.remainingAnswers)
                .map((person) => (
                  <div
                    key={person.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer first:rounded-t-[20px] last:rounded-b-[20px]"
                    onClick={() => handlePersonSelect(person)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">{person.name}</span>
                      <span className="text-red-500 text-sm">
                        {person.remainingAnswers} rimanenti
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Skill Selection */}
        <div className="bg-white rounded-[20px] p-3 sm:p-4 mb-3 sm:mb-4 relative shadow-sm">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={handleSkillMenuClick}
          >
            <span className={`text-lg font-medium ${
              currentFeedback?.question?.type 
                ? skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].textClass
                : ''
            }`}>{selectedSkill}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                currentFeedback?.question?.type 
                  ? skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].textClass
                  : ''
              }`}>
                {skills.find(s => s.type.toUpperCase() === selectedSkill.toUpperCase())?.remainingFeedback} rimanenti
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isSkillMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {isSkillMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[20px] shadow-lg z-10">
              {skills
                .sort((a, b) => {
                  const typeOrder = { 'SOFT': 0, 'EXECUTION': 1, 'STRATEGY': 2 };
                  const typeA = a.type.toUpperCase();
                  const typeB = b.type.toUpperCase();
                  return (typeOrder[typeA as keyof typeof typeOrder] || 0) - 
                         (typeOrder[typeB as keyof typeof typeOrder] || 0);
                })
                .map((skill) => (
                  <div
                    key={skill.type}
                    className="p-4 hover:bg-gray-50 cursor-pointer first:rounded-t-[20px] last:rounded-b-[20px]"
                    onClick={() => handleSkillSelect(skill)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">{skill.type}</span>
                      <span className="text-[#F4B400] text-sm">
                        {skill.remainingFeedback} rimanenti
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="mb-6">
          {currentFeedback && (
            <>
              <div className={`bg-white rounded-[20px] p-6 mb-6 shadow-sm transition-all duration-200 ${
                currentFeedback.question?.type 
                  ? `${skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].border}`
                  : ''
              }`}>
                <h2 className={`text-xl font-normal text-gray-800 mb-6 transition-opacity duration-200 ${
                  currentFeedback.value !== null ? 'opacity-75' : ''
                }`}>
                  {currentFeedback.question?.description}
                </h2>

                {/* Rating Section */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                    {/* Star Rating */}
                    {(currentFeedback.value === null || currentFeedback.value > 0) && (
                      <div className={`flex justify-center gap-2 sm:gap-3 ${
                        currentFeedback.value !== null ? 'opacity-75' : ''
                      }`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(star as Rating)}
                            disabled={currentFeedback.value !== null}
                            className={`transition-transform duration-200 ${
                              currentFeedback.value === null ? 'hover:scale-110' : ''
                            } ${
                              currentFeedback.value !== null ? 'cursor-default opacity-75' : 'cursor-pointer'
                            }`}
                          >
                            <svg
                              className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 transition-colors duration-200 ${
                                rating >= star ? 'text-[#F4B400]' : 'text-gray-300'
                              }`}
                              fill={rating >= star ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Feedback Button - Mostra solo se value è null o 0 */}
                    {(currentFeedback.value === null || currentFeedback.value === 0) && (
                      <button 
                        onClick={handleNoFeedback}
                        disabled={currentFeedback.value === 0}
                        className={`${
                          currentFeedback.question?.type 
                            ? skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].buttonClass
                            : 'bg-[#F4B400] hover:bg-[#E5A800]'
                        } text-white py-2 px-3 sm:px-4 rounded-full transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                          currentFeedback.value === 0 ? 'opacity-70 cursor-not-allowed shadow-inner' : ''
                        }`}
                      >
                        NON HO ELEMENTI PER UN FEEDBACK UTILE
                      </button>
                    )}
                  </div>

                  {/* Cancel Rating Button - Mostra solo se c'è un value */}
                  {currentFeedback.value !== null && (
                    <button
                      onClick={handleCancelRating}
                      className="w-full sm:w-auto py-2 px-3 sm:px-4 rounded-full transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      ANNULLA
                    </button>
                  )}
                </div>

                {/* Comment Box */}
                <div className={`bg-white rounded-[20px] p-3 sm:p-4 mb-4 sm:mb-6 ${
                  currentFeedback.question?.type 
                    ? `${skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].border}`
                    : 'border-gray-200'
                } border`}>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={comment}
                      onChange={handleCommentChange}
                      placeholder={currentFeedback.value === null ? "Inserisci prima una valutazione per aggiungere un commento..." : "Aggiungi un commento qui.."}
                      className={`w-full min-h-[80px] resize-none focus:outline-none text-gray-700 p-2 pb-12 bg-white overflow-hidden ${
                        currentFeedback.value === null ? 'cursor-not-allowed bg-gray-50' : ''
                      }`}
                      rows={1}
                      disabled={currentFeedback.value === null}
                    />
                    <div className="absolute bottom-3 right-2">
                      {hasCommentChanged && currentFeedback.value !== null && (
                        <button
                          onClick={handleSaveComment}
                          className={`px-4 py-2 text-white rounded-full transition-colors text-base shadow-sm ${
                            currentFeedback.question?.type 
                              ? skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].buttonClass
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          Salva
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Counter */}
                <div className="text-left text-gray-600 mb-4">
                  Domanda {currentFeedbackIndex + 1} di {currentFeedbacks.length}
                </div>

                {/* Navigation Buttons - Mobile Fixed */}
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 sm:hidden">
                  <div className="container mx-auto max-w-2xl flex gap-4">
                    {currentFeedbackIndex > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <svg 
                          className="w-6 h-6 mr-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        INDIETRO
                      </button>
                    )}
                    {currentFeedbackIndex === currentFeedbacks.length - 1 ? (
                      <button
                        onClick={handleNextPerson}
                        className="flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                      >
                        PROSSIMO
                        <svg 
                          className="w-6 h-6 ml-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button 
                        onClick={handleNext}
                        className={`flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors text-white flex items-center justify-center ${
                          currentFeedback.question?.type 
                            ? skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].buttonClass
                            : 'bg-[#4285F4] hover:bg-[#3367D6]'
                        }`}
                      >
                        AVANTI
                        <svg 
                          className="w-6 h-6 ml-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons - Desktop */}
                <div className="hidden sm:flex gap-4">
                  {currentFeedbackIndex > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <svg 
                        className="w-6 h-6 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      INDIETRO
                    </button>
                  )}
                  {currentFeedbackIndex === currentFeedbacks.length - 1 ? (
                    <button
                      onClick={handleNextPerson}
                      className="flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                    >
                      PROSSIMO
                      <svg 
                        className="w-6 h-6 ml-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext}
                      className={`flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors text-white flex items-center justify-center ${
                        currentFeedback.question?.type 
                          ? skillThemes[currentFeedback.question.type.toUpperCase() as keyof typeof skillThemes].buttonClass
                          : 'bg-[#4285F4] hover:bg-[#3367D6]'
                      }`}
                    >
                      AVANTI
                      <svg 
                        className="w-6 h-6 ml-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <EvaluateContent />
  );
}
