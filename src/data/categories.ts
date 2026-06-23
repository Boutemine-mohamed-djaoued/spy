export type WordCategory = {
  id: string
  title: string
  words: string[]
}

export const categories: WordCategory[] = [
  {
    id: "places",
    title: "Places",
    words: ["staifi", "esi", "bouraoui", "ma9am chahid" , "jardin d'essaie" ],
  },
  {
    id: "food",
    title: "Food",
    words: ["chekchouka", "couscous", "kasra & lbn", "mhajeb", "marini", "bouzalouf" , "bourak" , "9arantita" , "pizza caree"],
  },
  {
    id: "objects",
    title: "Objects",
    words: ["9aro", "farchita", "access point", "laptop", "sniper" , "keys" , "trophy" , "headset" , "ring"],
  },
  {
    id: "people",
    title: "people",
    words: ["taki", "yacine", "uchiha", "bnd", "coatch", "sleepwell", "yanis", "abdo" ],
  },
  {
    id: "wilayas",
    title: "wilayas",
    words: ["barika", "setif", "jijel", "constantine", "tebessa", "sidi bel abbes", "alger", "oran" , "biskra"],
  },
];
