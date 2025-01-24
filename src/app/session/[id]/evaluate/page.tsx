"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, Suspense } from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";

interface PageParams {
  id: string;
  [key: string]: string | string[];
}

interface Person {
  name: string;
  remainingAnswers: number;
}

interface Skill {
  name: string;
  remainingFeedback: number;
}

const people: Person[] = [
  {
    name: "Mario Rossi",
    remainingAnswers: 70,
  },
  {
    name: "Alice Nastri",
    remainingAnswers: 32,
  },
  {
    name: "Elena Ski",
    remainingAnswers: 40,
  },
];

const skills: Skill[] = [
  { name: "Execution", remainingFeedback: 15 },
  { name: "Soft", remainingFeedback: 8 },
  { name: "Strategy", remainingFeedback: 12 },
];

type Rating = 0 | 1 | 2 | 3 | 4 | 5;

function EvaluateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<PageParams>();
  const sessionId = params.id;
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState<boolean>(false);
  const personName = searchParams.get("person") || "Mario Rossi";
  const [selectedSkill, setSelectedSkill] =
    useState<Skill["name"]>("Execution");
  const [rating, setRating] = useState<Rating>(0);
  const [comment, setComment] = useState<string>("");
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState<boolean>(false);

  const handlePersonSelect = (person: Person) => {
    router.push(
      `/session/${sessionId}/evaluate?person=${encodeURIComponent(person.name)}`
    );
    setIsPersonMenuOpen(false);
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill.name);
    setIsSkillMenuOpen(false);
  };

  const handleRatingChange = (newRating: Rating) => {
    setRating(newRating);
  };

  const currentPerson = people.find((p) => p.name === personName);
  const currentSkill = skills.find((s) => s.name === selectedSkill);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Feedback" showBackButton={true} />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Person Selection */}
        <div className="bg-white rounded-[20px] p-4 mb-4 relative">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsPersonMenuOpen(!isPersonMenuOpen)}
          >
            <span className="text-lg font-medium">{personName}</span>
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
                    key={person.name}
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
        <div className="bg-white rounded-[20px] p-4 mb-4 relative">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsSkillMenuOpen(!isSkillMenuOpen)}
          >
            <span className="text-lg font-medium">{selectedSkill}</span>
            <div className="flex items-center gap-2">
              <span className="text-[#F4B400] text-sm">
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
                    key={skill.name}
                    className="p-4 hover:bg-gray-50 cursor-pointer first:rounded-t-[20px] last:rounded-b-[20px]"
                    onClick={() => handleSkillSelect(skill)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">{skill.name}</span>
                      <span className="text-[#F4B400] text-sm">
                        {skill.remainingFeedback} rimanenti
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-lg text-gray-800 mb-4">
            Come valuti la sua esecuzione nel processo xyz?
          </h2>

          {/* Rating Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Star Rating */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(star as Rating)}
                  className="text-2xl"
                >
                  <svg
                    className={`w-8 h-8 ${
                      rating >= star ? "text-[#F4B400]" : "text-gray-300"
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

            {/* No Feedback Button */}
            <button className="bg-[#F4B400] text-white py-2 px-4 rounded-full hover:bg-[#E5A800] transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0">
              NON HO ELEMENTI PER UN FEEDBACK UTILE
            </button>
          </div>

          {/* Comment Box */}
          <div className="bg-white rounded-[20px] p-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Aggiungi un commento qui.."
              className="w-full h-32 resize-none border-none focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* Next Button */}
        <button className="w-full bg-[#4285F4] text-white py-3 rounded-full text-lg font-medium">
          AVANTI
        </button>
      </main>

      <BottomNav />
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <EvaluateContent />
    </Suspense>
  );
}
