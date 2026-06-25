export type WordCategory = {
  id: string
  title: string
  words: string[]
}

export const categories: WordCategory[] = [
  {
    id: "places",
    title: "Places",
    words: ["jama3 l'a3dam", "ramdan (fastfood)", "Epau" ],
  },
  {
    id: "food",
    title: "Food",
    words: ["spagetti", "frite", "kessra mehchiya", "zlabiya", "milfeuille", "salade" , "bourak" , "9arantita" ],
  },
  {
    id: "objects",
    title: "Objects",
    words: ["manette", "glasses", "power bank", "bottle", "helmet" , "credit card" , "knife" , "phone case" , "rasberrypie"],
  }
];
