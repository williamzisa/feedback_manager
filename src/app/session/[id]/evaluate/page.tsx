"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";
import { queries } from "@/lib/supabase/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuestionTag = Database["public"]["Tables"]["question_tags"]["Row"];

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
  type: "Execution" | "Strategy" | "Soft";
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

interface QuestionTagsDisplayProps {
  tags: QuestionTag[] | null;
  selectedRating: number;
  onTagClick: (description: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

function QuestionTagsDisplay({
  tags,
  selectedRating,
  onTagClick,
  isLoading,
  error,
}: QuestionTagsDisplayProps) {
  if (error) {
    return <div className="text-sm text-red-500 mt-2">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-500">
          Caricamento suggerimenti...
        </span>
      </div>
    );
  }

  if (!tags || tags.length === 0 || selectedRating === 0) {
    return null;
  }

  const filteredTags = tags.filter((tag) => tag.score === selectedRating);

  if (filteredTags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-500 mb-2">
        Suggerimenti per il feedback:
      </p>
      <div className="flex flex-wrap gap-2">
        {filteredTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagClick(tag.description)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {tag.description}
          </button>
        ))}
      </div>
    </div>
  );
}

function EvaluateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<PageParams>();
  const sessionId = params.id;
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState<boolean>(false);
  const personId = searchParams.get("person");
  const [selectedSkill, setSelectedSkill] =
    useState<Skill["type"]>("Execution");
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
  const [currentTags, setCurrentTags] = useState<QuestionTag[] | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingRatingChange, setPendingRatingChange] = useState<Rating | null>(
    null
  );
  const [allFeedbacksForPerson, setAllFeedbacksForPerson] = useState<FeedbackWithRelations[]>([]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [comment]);

  // Funzioni helper per i conteggi
  const countRemainingFeedbacks = useCallback(
    (feedbacks: FeedbackWithRelations[], personId: string) => {
      return feedbacks.filter(
        (f) => f.receiver === personId && f.value === null
      ).length;
    },
    []
  );

  const countRemainingByType = useCallback(
    (feedbacks: FeedbackWithRelations[], type: string) => {
      return feedbacks.filter(
        (f) =>
          f.question?.type.toLowerCase() === type.toLowerCase() &&
          f.value === null
      ).length;
    },
    []
  );

  const updatePeopleList = useCallback(
    (feedbacks: FeedbackWithRelations[]) => {
      const peopleMap = new Map<string, { name: string; remaining: number }>();

      feedbacks.forEach((feedback) => {
        if (feedback.users) {
          const personId = feedback.users.id;
          const fullName = `${feedback.users.name} ${feedback.users.surname}`;

          if (!peopleMap.has(personId)) {
            peopleMap.set(personId, {
              name: fullName,
              remaining: 0,
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
        remainingAnswers: data.remaining,
      }));
    },
    [countRemainingFeedbacks]
  );

  const updateSkillsList = useCallback(
    (feedbacks: FeedbackWithRelations[], personId: string): Skill[] => {
      const personFeedbacks = feedbacks.filter((f) => f.receiver === personId);

      return [
        {
          type: "Execution" as const,
          remainingFeedback: countRemainingByType(personFeedbacks, "execution"),
        },
        {
          type: "Strategy" as const,
          remainingFeedback: countRemainingByType(personFeedbacks, "strategy"),
        },
        {
          type: "Soft" as const,
          remainingFeedback: countRemainingByType(personFeedbacks, "soft"),
        },
      ];
    },
    [countRemainingByType]
  );

  useEffect(() => {
    // Define supabase client instance at the effect scope
    const supabase = createClientComponentClient<Database>();

    const loadData = async () => {
      try {
        setLoading(true);
        const currentUser = await queries.users.getCurrentUser();

        // Carica i dati iniziali
        const { data: feedbacks } = await supabase
          .from("feedbacks")
          .select(
            `
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
          `
          )
          .eq("session_id", sessionId)
          .eq("sender", currentUser.id);

        if (feedbacks) {
          // Aggiorna la lista delle persone
          const peopleList = updatePeopleList(feedbacks);
          setPeople(peopleList);

          // Se abbiamo un personId, aggiorniamo i conteggi per tipo
          if (personId) {
            const currentPersonData = peopleList.find((p) => p.id === personId);
            setCurrentPerson(currentPersonData || null);

            // Aggiorna la lista dei tipi
            setSkills(updateSkillsList(feedbacks, personId));

            // Aggiorna i feedback correnti per tipo
            const personFeedbacks = feedbacks.filter(
              (f) => f.receiver === personId
            );
            updateCurrentFeedbacks(
              personFeedbacks,
              selectedSkill.toLowerCase()
            );
          }
        }

        // Sottoscrizione real-time per i feedback
        supabase
          .channel("feedbacks-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "feedbacks",
              filter: `session_id=eq.${sessionId} AND sender=eq.${currentUser.id}`,
            },
            async () => {
              // Ricarica i dati quando ci sono cambiamenti
              const { data: updatedFeedbacks } = await supabase
                .from("feedbacks")
                .select(
                  `
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
                `
                )
                .eq("session_id", sessionId)
                .eq("sender", currentUser.id);

              if (updatedFeedbacks) {
                // Aggiorna la lista delle persone
                const peopleList = updatePeopleList(updatedFeedbacks);
                setPeople(peopleList);

                // Se abbiamo un personId, aggiorniamo i conteggi per tipo
                if (personId) {
                  const currentPersonData = peopleList.find(
                    (p) => p.id === personId
                  );
                  setCurrentPerson(currentPersonData || null);

                  // Aggiorna la lista dei tipi
                  setSkills(updateSkillsList(updatedFeedbacks, personId));

                  // Aggiorna i feedback correnti per tipo
                  const personFeedbacks = updatedFeedbacks.filter(
                    (f) => f.receiver === personId
                  );
                  updateCurrentFeedbacks(
                    personFeedbacks,
                    selectedSkill.toLowerCase()
                  );
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Errore nel caricamento dei dati"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Cleanup function to unsubscribe from Supabase channel
    return () => {
      supabase.removeChannel(supabase.channel("feedbacks-changes"));
    };
  }, [sessionId, personId, selectedSkill, updatePeopleList, updateSkillsList, countRemainingFeedbacks, countRemainingByType]);

  // Effect to update current feedbacks when selectedSkill or allFeedbacksForPerson changes
  useEffect(() => {
    if (personId && allFeedbacksForPerson.length > 0) {
        updateCurrentFeedbacks(allFeedbacksForPerson, selectedSkill);
        // Also update skills list based on potentially updated feedbacks
        setSkills(updateSkillsList(allFeedbacksForPerson, personId));
    } else if (!personId) {
        // Reset when no person is selected
        setCurrentFeedbacks([]);
        setSkills([]);
        setCurrentFeedbackIndex(0);
        setRating(0);
        setComment("");
    }
  }, [personId, selectedSkill, allFeedbacksForPerson, updateSkillsList]);

  const updateCurrentFeedbacks = (
    feedbacks: FeedbackData[],
    type: string
  ) => {
    const feedbacksForType = feedbacks.filter(
      (f) => f.question?.type.toLowerCase() === type.toLowerCase()
    );
    setCurrentFeedbacks(feedbacksForType);
    setCurrentFeedbackIndex(0);

    // Reset form state for new feedback
    const currentFeedback = feedbacksForType[0];
    if (currentFeedback) {
      setRating((currentFeedback.value as Rating) || 0);
      setComment(currentFeedback.comment || "");
    } else {
      // Handle case where there are no feedbacks for this type
      setRating(0);
      setComment("");
      setCurrentFeedbackIndex(0); // Ensure index is reset
    }
  };

  const handlePersonSelect = (person: Person) => {
    router.push(
      `/session/${sessionId}/evaluate?person=${encodeURIComponent(person.id)}`
    );
    setIsPersonMenuOpen(false);
    setIsSkillMenuOpen(false);
  };

  const handleSkillSelect = async (skill: Skill["type"]) => {
    // Reset index and state when skill changes
    setCurrentFeedbackIndex(0);
    setRating(0);
    setComment("");
    setHasCommentChanged(false);
    setCommentError(null);
    setSelectedSkill(skill);
    setIsSkillMenuOpen(false);
    setIsPersonMenuOpen(false);

    // No need to fetch again, just update currentFeedbacks from allPersonFeedbacks
    if (personId && allFeedbacksForPerson.length > 0) {
        updateCurrentFeedbacks(allFeedbacksForPerson, skill);
    }
  };

  const handleRatingChange = async (newRating: Rating) => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    // Se c'è già un valore e un commento, chiedi conferma
    if (
      currentFeedbacks[currentFeedbackIndex].value !== null &&
      currentFeedbacks[currentFeedbackIndex].comment
    ) {
      setPendingRatingChange(newRating);
      setIsConfirmDialogOpen(true);
      return;
    }

    // Impostiamo il rating visivamente senza salvarlo nel database
    setRating(newRating);

    // Reset del commento nell'interfaccia
    setComment("");
    setHasCommentChanged(false);

    // Imposta il value a NULL nel database
    await resetRatingInDatabase();
  };

  const resetRatingInDatabase = async () => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    const supabase = createClientComponentClient<Database>();
    const currentUser = await queries.users.getCurrentUser();

    // Imposta il value a NULL nel database
    await supabase
      .from("feedbacks")
      .update({
        value: null,
        comment: null,
      })
      .eq("id", currentFeedbacks[currentFeedbackIndex].id);

    // Aggiorna il feedback locale
    const updatedLocalFeedbacks = [...currentFeedbacks];
    updatedLocalFeedbacks[currentFeedbackIndex] = {
      ...updatedLocalFeedbacks[currentFeedbackIndex],
      value: null,
      comment: null,
    };
    setCurrentFeedbacks(updatedLocalFeedbacks);

    // Aggiorna immediatamente i conteggi locali
    const { data: updatedFeedbacks } = await supabase
      .from("feedbacks")
      .select(
        `
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
      `
      )
      .eq("session_id", sessionId)
      .eq("sender", currentUser.id);

    if (updatedFeedbacks) {
      // Aggiorna la lista delle persone
      const peopleList = updatePeopleList(updatedFeedbacks);
      setPeople(peopleList);

      // Se abbiamo un personId, aggiorniamo i conteggi per tipo
      if (personId) {
        const currentPersonData = peopleList.find((p) => p.id === personId);
        setCurrentPerson(currentPersonData || null);

        // Aggiorna la lista dei tipi
        setSkills(updateSkillsList(updatedFeedbacks, personId));
      }
    }
  };

  const handleConfirmRatingChange = async () => {
    if (pendingRatingChange !== null) {
      // Reset del commento nell'interfaccia
      setComment("");
      setHasCommentChanged(false);

      // Impostiamo il rating visivamente
      setRating(pendingRatingChange);

      // Reset del valore nel database
      await resetRatingInDatabase();
      setPendingRatingChange(null);
    }
    setIsConfirmDialogOpen(false);
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
        .from("feedbacks")
        .update({
          value: 0,
          comment: null,
        })
        .eq("id", feedbackId);

      if (updateError) {
        console.error("Errore nell'aggiornamento:", updateError);
        throw updateError;
      }

      // Aggiorna immediatamente i conteggi locali
      const { data: updatedFeedbacks } = await supabase
        .from("feedbacks")
        .select(
          `
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
        `
        )
        .eq("session_id", sessionId)
        .eq("sender", currentUser.id);

      if (updatedFeedbacks) {
        // Aggiorna la lista delle persone
        const peopleList = updatePeopleList(updatedFeedbacks);
        setPeople(peopleList);

        // Se abbiamo un personId, aggiorniamo i conteggi per tipo
        if (personId) {
          const currentPersonData = peopleList.find((p) => p.id === personId);
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
        comment: null,
      };
      setCurrentFeedbacks(updatedLocalFeedbacks);
      setRating(0);
      setComment("");
      setHasCommentChanged(false);
    } catch (err) {
      console.error("Errore:", err);
    }
  };

  const handleSaveComment = async () => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    const supabase = createClientComponentClient<Database>();

    await supabase
      .from("feedbacks")
      .update({
        comment: comment || null,
      })
      .eq("id", currentFeedbacks[currentFeedbackIndex].id);

    // Aggiorna il feedback locale
    const updatedFeedbacks = [...currentFeedbacks];
    updatedFeedbacks[currentFeedbackIndex] = {
      ...updatedFeedbacks[currentFeedbackIndex],
      comment: comment || null,
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
        .from("feedbacks")
        .update({
          value: null,
          comment: null,
        })
        .eq("id", feedbackId);

      if (updateError) {
        console.error("Errore nell'annullamento:", updateError);
        throw updateError;
      }

      // Aggiorna immediatamente i conteggi locali
      const { data: updatedFeedbacks } = await supabase
        .from("feedbacks")
        .select(
          `
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
        `
        )
        .eq("session_id", sessionId)
        .eq("sender", currentUser.id);

      if (updatedFeedbacks) {
        // Aggiorna la lista delle persone
        const peopleList = updatePeopleList(updatedFeedbacks);
        setPeople(peopleList);

        // Se abbiamo un personId, aggiorniamo i conteggi per tipo
        if (personId) {
          const currentPersonData = peopleList.find((p) => p.id === personId);
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
        comment: null,
      };
      setCurrentFeedbacks(updatedLocalFeedbacks);
      setRating(0);
      setComment("");
      setHasCommentChanged(false);
    } catch (err) {
      console.error("Errore:", err);
    }
  };

  const handlePrevious = () => {
    if (currentFeedbackIndex > 0) {
      const newIndex = currentFeedbackIndex - 1;
      setCurrentFeedbackIndex(newIndex);
      const prevFeedback = currentFeedbacks[newIndex];
      setRating((prevFeedback.value as Rating) || 0);
      setComment(prevFeedback.comment || "");
      setHasCommentChanged(false); // Reset changed status
      setCommentError(null); // Reset error
    } else {
      // Try to go to the previous skill type
      const currentSkillIndex = skills.findIndex(s => s.type === selectedSkill);
      const previousSkill = skills
        .slice(0, currentSkillIndex)
        .reverse()
        .find(s => {
          // Check if this skill type actually has questions for this person
          return allFeedbacksForPerson.some(f => f.question?.type.toLowerCase() === s.type.toLowerCase());
        });


      if (previousSkill) {
        // Need to update state *after* selecting the skill
        const previousSkillFeedbacks = allFeedbacksForPerson.filter(
          (f) => f.question?.type.toLowerCase() === previousSkill.type.toLowerCase()
        );
        const lastIndex = previousSkillFeedbacks.length - 1;
        handleSkillSelect(previousSkill.type).then(() => {
           setCurrentFeedbackIndex(lastIndex);
           const prevFeedback = previousSkillFeedbacks[lastIndex];
           setRating((prevFeedback?.value as Rating) || 0);
           setComment(prevFeedback?.comment || "");
           setHasCommentChanged(false);
           setCommentError(null);
        });
      }
      // If no previous skill, do nothing (stay on the first item)
    }
  };

  const handleNext = () => {
    // Validazione commento
    if (rating > 0 && !comment?.trim()) {
      setCommentError(
        "È necessario inserire un commento quando si lascia una valutazione"
      );
      return;
    }
    setCommentError(null); // Clear error if validation passes

    saveCurrentFeedback().then(() => {
      setHasCommentChanged(false); // Reset changed status after saving
      if (currentFeedbackIndex < currentFeedbacks.length - 1) {
        const newIndex = currentFeedbackIndex + 1;
        setCurrentFeedbackIndex(newIndex);
        const nextFeedback = currentFeedbacks[newIndex];
        setRating((nextFeedback.value as Rating) || 0);
        setComment(nextFeedback.comment || "");
      } else {
         // Try to go to the next skill type
         const currentSkillIndex = skills.findIndex(s => s.type === selectedSkill);
         const nextSkill = skills
            .slice(currentSkillIndex + 1)
            .find(s => {
               // Check if this skill type actually has questions for this person
               return allFeedbacksForPerson.some(f => f.question?.type.toLowerCase() === s.type.toLowerCase());
             });


         if (nextSkill) {
            handleSkillSelect(nextSkill.type); // This will reset index to 0 and load state
         }
         // If no next skill, the "VAI ALLA SESSIONE" button should be shown instead
      }
    });
  };

  const saveCurrentFeedback = async () => {
    if (!currentFeedbacks[currentFeedbackIndex]) return;

    const supabase = createClientComponentClient<Database>();
    const currentUser = await queries.users.getCurrentUser();

    // Prima di tutto, imposto loading per evitare flicker di UI
    // Blocco temporaneamente l'interfaccia durante l'aggiornamento    
    const prevCurrentPerson = currentPerson;

    // Salva il rating effettivo e il commento
    await supabase
      .from("feedbacks")
      .update({
        value: rating,
        comment: comment || null,
      })
      .eq("id", currentFeedbacks[currentFeedbackIndex].id);

    // Aggiorna il feedback locale
    const updatedLocalFeedbacks = [...currentFeedbacks];
    updatedLocalFeedbacks[currentFeedbackIndex] = {
      ...updatedLocalFeedbacks[currentFeedbackIndex],
      value: rating,
      comment: comment || null,
    };
    setCurrentFeedbacks(updatedLocalFeedbacks);

    // Update allFeedbacksForPerson as well
    const updatedAllFeedbacks = allFeedbacksForPerson.map(fb =>
        fb.id === updatedLocalFeedbacks[currentFeedbackIndex].id
            ? { ...fb, ...updatedLocalFeedbacks[currentFeedbackIndex] }
            : fb
    );
    setAllFeedbacksForPerson(updatedAllFeedbacks);

    // Aggiorna immediatamente le statistiche dei rimanenti
    if (personId) {
      // Ricarica i dati aggiornati per mantenere i conteggi coerenti
      const { data: updatedFeedbacks } = await supabase
        .from("feedbacks")
        .select(
          `
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
        `
        )
        .eq("session_id", sessionId)
        .eq("sender", currentUser.id);

      if (updatedFeedbacks) {
        // Aggiorna la lista delle persone con conteggi corretti
        const peopleList = updatePeopleList(updatedFeedbacks);
        setPeople(peopleList);

        // Aggiorna la persona corrente e i suoi conteggi
        const currentPersonData = peopleList.find(p => p.id === personId);
        // Conserva il conteggio originale fino a quando non abbiamo il nuovo
        if (currentPersonData && prevCurrentPerson) {
          // Assicuriamoci che non ci sia un flash di "0 rimanenti"
          currentPersonData.remainingAnswers = Math.max(currentPersonData.remainingAnswers, 0);
        }
        setCurrentPerson(currentPersonData || null);

        // Aggiorna la lista dei tipi di feedback e relativi conteggi
        setSkills(updateSkillsList(updatedFeedbacks, personId));
      }
    }
  };

  // Modifica dei click handler per i dropdown
  const handlePersonMenuClick = () => {
    setIsPersonMenuOpen(!isPersonMenuOpen);
    setIsSkillMenuOpen(false);
  };

  const handleSkillMenuClick = () => {
    setIsSkillMenuOpen(!isSkillMenuOpen);
    setIsPersonMenuOpen(false);
  };

  useEffect(() => {
    const loadTags = async () => {
      if (!currentFeedbacks[currentFeedbackIndex]?.question?.id) return;

      setIsLoadingTags(true);
      setTagsError(null);

      try {
        const tags = await queries.tags.getForQuestion(
          currentFeedbacks[currentFeedbackIndex].question.id
        );
        setCurrentTags(tags);
      } catch (err) {
        console.error("Errore nel caricamento dei tag:", err);
        setTagsError("Impossibile caricare i suggerimenti per il feedback");
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadTags();
  }, [currentFeedbacks, currentFeedbackIndex]);

  const handleTagClick = (description: string) => {
    const newComment = comment ? `${comment}\n${description}` : description;

    setComment(newComment);
    setHasCommentChanged(true);

    // Aggiusta l'altezza della textarea dopo l'aggiunta del tag
    setTimeout(adjustTextareaHeight, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Feedback" showBackButton={true} />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Feedback" showBackButton={true} />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Errore!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const currentSkill = skills.find((s) => s.type === selectedSkill);
  const currentFeedback = currentFeedbacks[currentFeedbackIndex];

  // --- Button Logic Calculations ---
  const isValidationFailed = rating > 0 && !comment?.trim();

  const currentSkillIndex = skills.findIndex(s => s.type === selectedSkill);
  const previousSkillExists = skills
      .slice(0, currentSkillIndex)
      .some(s => allFeedbacksForPerson.some(f => f.question?.type.toLowerCase() === s.type.toLowerCase()));
  const nextSkillExists = skills
      .slice(currentSkillIndex + 1)
      .some(s => allFeedbacksForPerson.some(f => f.question?.type.toLowerCase() === s.type.toLowerCase()));

  const isLastOfCurrentType = currentFeedbackIndex === (currentFeedbacks?.length ?? 0) - 1;
  const isFirstOfCurrentType = currentFeedbackIndex === 0;

  const showGoToSession = isLastOfCurrentType && !nextSkillExists && currentFeedback != null;
  const showNext = !isLastOfCurrentType || nextSkillExists;
  const showPrevious = (isFirstOfCurrentType ? previousSkillExists : currentFeedbacks?.length > 0) && currentFeedback != null;

  const disableNextOrSession = hasCommentChanged || isValidationFailed || (currentFeedback?.value === null && rating === 0);
  // --- End Button Logic Calculations ---

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Feedback"
        showBackButton={true}
        backUrl={`/session/${sessionId}`}
      />

      <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32">
        {/* Person Selection */}
        <div className="bg-white rounded-[20px] p-3 sm:p-4 mb-3 sm:mb-4 relative">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={handlePersonMenuClick}
          >
            <span className="text-lg font-medium">
              {currentPerson?.name || "Seleziona persona"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-sm">
                {currentPerson?.remainingAnswers} rimanenti
              </span>
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
        <div className="bg-white rounded-[20px] p-3 sm:p-4 mb-3 sm:mb-4 relative">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={handleSkillMenuClick}
          >
            <span className="text-lg font-medium">{selectedSkill}</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  currentSkill?.remainingFeedback === 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {currentSkill?.remainingFeedback} rimanenti
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
                .sort((a, b) => b.remainingFeedback - a.remainingFeedback)
                .map((skill) => (
                  <div
                    key={skill.type}
                    className="p-4 hover:bg-gray-50 cursor-pointer first:rounded-t-[20px] last:rounded-b-[20px]"
                    onClick={() => handleSkillSelect(skill.type)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">{skill.type}</span>
                      <span
                        className={`text-sm ${
                          skill.remainingFeedback === 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
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
              <h2 className="text-lg text-gray-800 mb-4">
                {currentFeedback.question?.description}
              </h2>

              {/* Rating Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Star Rating - Mostra solo se value è null o tra 1-5 */}
                  {(currentFeedback.value === null ||
                    currentFeedback.value > 0) && (
                    <div className="flex justify-center w-full sm:w-auto gap-3 sm:gap-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingChange(star as Rating)}
                          className={`text-2xl sm:text-4xl transition-transform hover:scale-110`}
                        >
                          <svg
                            className={`w-10 h-10 sm:w-14 sm:h-14 ${
                              rating >= star
                                ? "text-[#F4B400]"
                                : "text-gray-300"
                            } transition-colors`}
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
                  {(currentFeedback.value === null ||
                    currentFeedback.value === 0) && (
                    <button
                      onClick={handleNoFeedback}
                      disabled={currentFeedback.value === 0}
                      className={`bg-[#F4B400] text-white py-2 px-3 sm:px-4 rounded-full transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                        currentFeedback.value === 0
                          ? "bg-[#E5A800] shadow-inner opacity-70 cursor-not-allowed"
                          : "hover:bg-[#E5A800]"
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
                    className="w-full sm:w-auto py-2 px-3 sm:px-4 rounded-full transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 border border-red-500 bg-white text-red-500 hover:bg-red-50"
                  >
                    ANNULLA VALUTAZIONE
                  </button>
                )}
              </div>

              {/* Comment Box */}
              {currentFeedback && rating > 0 && (
                <>
                  {/* Tags Display - Add before Comment Box */}
                  <QuestionTagsDisplay
                    tags={currentTags}
                    selectedRating={rating}
                    onTagClick={handleTagClick}
                    isLoading={isLoadingTags}
                    error={tagsError}
                  />

                  <div className="bg-white rounded-[20px] p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Aggiungi un commento qui.."
                        className={`w-full min-h-[80px] resize-none focus:outline-none text-gray-700 p-2 pb-12 bg-white overflow-hidden ${
                          commentError ? "border-red-500" : "border-gray-200"
                        }`}
                        rows={1}
                      />
                      {commentError && (
                        <p className="text-sm text-red-500">{commentError}</p>
                      )}
                      <div className="absolute bottom-3 right-2">
                        {hasCommentChanged && (
                          <button
                            onClick={handleSaveComment}
                            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-base shadow-sm"
                          >
                            Salva
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Question Counter */}
              <div className="text-left text-gray-600 mb-4">
                Domanda {currentFeedbackIndex + 1} di {currentFeedbacks.length}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                 {/* INDIETRO Button */}
                 {showPrevious ? (
                   <button
                     onClick={handlePrevious}
                     className="flex-1 py-3 rounded-full text-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                   >
                     INDIETRO
                   </button>
                 ) : (
                    // Optional: Show a disabled or different button if it's the absolute first feedback
                    <button
                        onClick={() => router.push(`/session/${sessionId}`)} // Or disable if preferred
                        className="flex-1 py-3 rounded-full text-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        INDIETRO
                    </button>
                 )}


                {/* AVANTI Button */}
                {showNext && !showGoToSession && (
                  <button
                    onClick={handleNext}
                    disabled={disableNextOrSession}
                    className={`flex-1 py-3 rounded-full text-lg font-medium transition-colors ${
                      disableNextOrSession
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#4285F4] text-white hover:bg-[#3367D6]"
                    }`}
                  >
                    AVANTI
                  </button>
                )}

                {/* VAI ALLA SESSIONE Button */}
                {showGoToSession && (
                  <button
                    onClick={() => {
                      if (!disableNextOrSession) {
                          saveCurrentFeedback().then(() => router.push(`/session/${sessionId}`));
                      }
                    }}
                    disabled={disableNextOrSession}
                    className={`flex-1 py-3 rounded-full text-lg font-medium transition-colors ${
                      disableNextOrSession
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    VAI ALLA SESSIONE
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma modifica valutazione</DialogTitle>
            <DialogDescription>
              Modificando la valutazione, il commento associato verrà eliminato
              e dovrai inserirne uno nuovo. Sei sicuro di voler procedere?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <button
              onClick={() => setIsConfirmDialogOpen(false)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirmRatingChange}
              className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              Conferma
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EvaluatePage() {
  return <EvaluateContent />;
}
