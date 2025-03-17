export type Person = {
  id: number;
  name: string;
  lastOverall: number;
  standard: number;
  lastGap: number;
  action: 'vedi-sessioni' | 'inizia-1to1';
};

export const mockPeople: Person[][] = [
  // Pagina 1
  [
    {
      id: 1,
      name: "Mario Rossi",
      lastOverall: 4.5,
      standard: 4.0,
      lastGap: 15,
      action: 'vedi-sessioni'
    },
    {
      id: 2,
      name: "Luca Bianchi",
      lastOverall: 4.4,
      standard: 4.0,
      lastGap: 11,
      action: 'inizia-1to1'
    },
    {
      id: 3,
      name: "Marco Neri",
      lastOverall: 4.2,
      standard: 4.0,
      lastGap: 5,
      action: 'vedi-sessioni'
    },
    {
      id: 4,
      name: "Giuseppe Gialli",
      lastOverall: 4.1,
      standard: 4.0,
      lastGap: 2,
      action: 'inizia-1to1'
    }
  ],
  // Pagina 2
  [
    {
      id: 5,
      name: "Laura Verdi",
      lastOverall: 4.3,
      standard: 4.0,
      lastGap: -8,
      action: 'inizia-1to1'
    },
    {
      id: 6,
      name: "Anna Blu",
      lastOverall: 3.8,
      standard: 4.0,
      lastGap: -15,
      action: 'inizia-1to1'
    },
    {
      id: 7,
      name: "Sofia Rosa",
      lastOverall: 3.5,
      standard: 4.0,
      lastGap: -25,
      action: 'vedi-sessioni'
    },
    {
      id: 8,
      name: "Laura Verdi",
      lastOverall: 2.0,
      standard: 4.0,
      lastGap: -50,
      action: 'inizia-1to1'
    }
  ]
]; 