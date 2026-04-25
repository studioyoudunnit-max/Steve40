export const TEAMS = [
  { id: 'red',    name: 'Red',    color: '#ff3b61', icon: 'ti-crown'    },
  { id: 'blue',   name: 'Blue',   color: '#3d8eff', icon: 'ti-diamond'  },
  { id: 'green',  name: 'Green',  color: '#00e676', icon: 'ti-flame'    },
  { id: 'yellow', name: 'Yellow', color: '#ffd600', icon: 'ti-bolt'     },
  { id: 'purple', name: 'Purple', color: '#c84bff', icon: 'ti-moon'     },
  { id: 'orange', name: 'Orange', color: '#ff7c00', icon: 'ti-cocktail' },
  { id: 'pink',   name: 'Pink',   color: '#ff3cac', icon: 'ti-lips'     },
  { id: 'teal',   name: 'Teal',   color: '#00e5ff', icon: 'ti-sparkle'  },
];

export const DEMO_PLAYERS = [
  { id: 'p1',  name: 'Raj',    team: 'red',    flair: 'Quiz captain' },
  { id: 'p2',  name: 'Mira',   team: 'red',    flair: 'Trivia sniper' },
  { id: 'p3',  name: 'Jordan', team: 'red',    flair: 'Buzzer happy' },
  { id: 'p4',  name: 'Sam',    team: 'blue',   flair: 'Lore keeper' },
  { id: 'p5',  name: 'Reese',  team: 'blue',   flair: 'Karaoke kid' },
  { id: 'p6',  name: 'Finn',   team: 'green',  flair: 'Songpop champ' },
  { id: 'p7',  name: 'Zoe',    team: 'green',  flair: 'Pop culture phd' },
  { id: 'p8',  name: 'Ben',    team: 'yellow', flair: 'Dark horse' },
  { id: 'p9',  name: 'Talia',  team: 'yellow', flair: 'Chaotic good' },
  { id: 'p10', name: 'Alex',   team: 'purple', flair: 'Gossip encyclopedia' },
  { id: 'p11', name: 'Noor',   team: 'purple', flair: 'Stats nerd' },
  { id: 'p12', name: 'Kai',    team: 'orange', flair: 'Dark horse' },
  { id: 'p13', name: 'Lou',    team: 'orange', flair: 'Late joiner' },
  { id: 'p14', name: 'Indy',   team: 'pink',   flair: 'Rumor machine' },
  { id: 'p15', name: 'River',  team: 'pink',   flair: 'Streaker' },
  { id: 'p16', name: 'Maya',   team: 'teal',   flair: 'The vibes' },
  { id: 'p17', name: 'Elliot', team: 'teal',   flair: 'Late bloomer' },
];

export const DEMO_TEAM_SCORES = {
  red: 10100, blue: 7400, green: 9700, yellow: 4900,
  purple: 8200, orange: 3600, pink: 7000, teal: 5000,
};

export const TRIVIA_QS = [
  {
    category: 'Steve · Origins', worth: 1000,
    text: "What was Steve's very first concert?",
    answers: ["Spice Girls (age 8)", "Nickelback (age 13)", "Green Day (age 15)", "Shania Twain (age 11)"],
    correct: 3,
    fact: "Held it together until the encore, then cried through 'You're Still the One'.",
  },
  {
    category: 'Steve · Era', worth: 1000,
    text: "Which year was Steve born?",
    answers: ["1982", "1984", "1985", "1986"],
    correct: 2,
    fact: "Same year Microsoft Windows 1.0 shipped. Coincidence? Probably.",
  },
  {
    category: 'Steve · Karaoke', worth: 1500,
    text: "Steve's go-to karaoke closer is…",
    answers: ["Bohemian Rhapsody", "Man! I Feel Like a Woman", "Don't Stop Believin'", "Total Eclipse of the Heart"],
    correct: 1,
    fact: "Bonus points for the wig reveal.",
  },
  {
    category: 'Steve · Trivia', worth: 1000,
    text: "Steve's first real job was…",
    answers: ["Movie theatre usher", "Lifeguard", "Record store clerk", "Paperboy"],
    correct: 2,
    fact: "Allegedly hid all the good vinyls under the counter.",
  },
  {
    category: 'Steve · Confession', worth: 2000,
    text: "Which of these has Steve actually done?",
    answers: ["Opened for a drag queen", "Run a half marathon hungover", "Been on local news", "All of the above"],
    correct: 3,
    fact: "And the drag queen signed the finisher's medal.",
  },
];

export const CELEB_ROUNDS = [
  { questionImg: '/twink/Q1.jpg', revealImg: '/twink/R1.jpg', answer: 'twink'   },
  { questionImg: '/twink/Q2.jpg', revealImg: '/twink/R2.jpg', answer: 'twink'   },
  { questionImg: '/twink/Q3.jpg', revealImg: '/twink/R3.jpg', answer: 'twink'   },
];

export const LIPSYNC_SONGS = [
  { title: 'Padam Padam',                artist: 'Kylie Minogue' },
  { title: 'Man! I Feel Like a Woman',   artist: 'Shania Twain' },
  { title: 'Dancing Queen',              artist: 'ABBA' },
  { title: 'I Will Survive',             artist: 'Gloria Gaynor' },
  { title: 'Toxic',                      artist: 'Britney Spears' },
  { title: 'Bad Romance',                artist: 'Lady Gaga' },
  { title: 'Mr. Brightside',             artist: 'The Killers' },
  { title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler' },
];

export const SONGPOP_CATEGORIES = [
  { key: 'country', label: 'Modern Country',  emoji: '🤠' },
  { key: '2010s',   label: 'Essential 2010s', emoji: '✨' },
  { key: 'intros',  label: 'Just the Intros', emoji: '⚡' },
];

export const ROOM_CODE = 'TEA40';
export const JOIN_URL  = 'steave-40.fly.dev';
