import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaGlobe, FaUser, FaShieldAlt, FaLightbulb, FaRocket, FaHands } from 'react-icons/fa';
import './styles.css';
import Scenario from './components/Scenario';
import EmotionalIndex from './components/EmotionalIndex';
import CommunityInsights from './components/CommunityInsights';
import CollaborativeChallenge from './components/CollaborativeChallenge';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import GameSummary from './components/GameSummary';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAq11_yF5-ZM-oVjNSHdwQ0IMqZvMlVej0",
  authDomain: "globalheartsel.firebaseapp.com",
  projectId: "globalheartsel",
  storageBucket: "globalheartsel.firebasestorage.app",
  messagingSenderId: "530977291493",
  appId: "1:530977291493:web:3d13ce35062a80d527e80c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ADD NEW SCENARIO POOL (Place these declarations above your App component)
const scenarioPool = {
  'Climate Anxiety': [
    {
      title: "Climate Anxiety (Mia)",
      situation: "You're talking to your friend Mia, who says: 'I'm so worried about climate change—it feels overwhelming, and I don't know what to do.'",
      options: [
        { text: "\"That's tough. Want to start a school project to reduce waste?\"", points: { compassion: 5, resilience: 5 }, path: "help", feedback: "Great! You showed care and inspired action." },
        { text: "\"Don't worry, scientists will fix it—focus on other stuff.\"", points: { resilience: -2 }, path: "ignore", feedback: "Hmm, dismissing her feelings might not help her cope. Why might this backfire?" },
        { text: "\"I feel the same way—let's learn more about solutions together.\"", points: { empathy: 5, selfAwareness: 3 }, path: "learn", feedback: "Nice! You connected and encouraged learning." }
      ],
      reflection: "How do you feel about climate change? What small actions can you take to feel less overwhelmed?",
      insight: "Kids worldwide are joining climate strikes—your ideas can make a difference!",
      paths: {
        help: { next: 1, feedback: "Mia feels motivated and starts a recycling club with you!" },
        ignore: { next: 2, feedback: "Mia feels ignored and withdraws. How could you rebuild trust and support her?" },
        learn: { next: 3, feedback: "You and Mia researched solutions, inspiring a community initiative!" }
      }
    },
    {
      title: "Climate Anxiety (Alex)",
      situation: "Your friend Alex says: 'I'm scared about rising sea levels affecting my coastal town—what can we do?'",
      options: [
        { text: "\"Let's organize a beach cleanup to raise awareness.\"", points: { compassion: 5, resilience: 5 }, path: "cleanup", feedback: "Great! You took action and inspired Alex." },
        { text: "\"It's not our problem—focus on something else.\"", points: { resilience: -2 }, path: "ignore", feedback: "Dismissal might hurt Alex. Why might this backfire?" },
        { text: "\"I'm worried too—let's research solutions together.\"", points: { empathy: 5, selfAwareness: 3 }, path: "learn", feedback: "Nice! You connected and encouraged learning." }
      ],
      reflection: "How do rising sea levels affect your community? What can you do to help?",
      insight: "Youth around the world are advocating for ocean conservation—join in!",
      paths: {
        cleanup: { next: 1, feedback: "Alex feels inspired and joins your cleanup effort!" },
        ignore: { next: 2, feedback: "Alex feels unsupported. How could you rebuild trust?" },
        learn: { next: 3, feedback: "You and Alex researched, starting a school ocean project!" }
      }
    },
    {
      title: "Climate Anxiety (Lila)",
      situation: "Your cousin Lila texts: 'I'm freaking out about wildfires—I can't sleep thinking about them. What should I do?'",
      options: [
        { text: "\"Let's volunteer for a fire prevention workshop together.\"", points: { compassion: 5, resilience: 5 }, path: "volunteer", feedback: "Awesome! You supported Lila and took action." },
        { text: "\"It's just nature—don't stress, it'll be fine.\"", points: { resilience: -2 }, path: "ignore", feedback: "That might minimize Lila's fears. How could you be more supportive?" },
        { text: "\"I'm worried too—let's find ways to help online.\"", points: { empathy: 5, selfAwareness: 3 }, path: "research", feedback: "Great! You connected and found solutions together." }
      ],
      reflection: "How do wildfires impact you or your area? What can you do to feel safer?",
      insight: "Global youth are planting trees to fight wildfires—your efforts count!",
      paths: {
        volunteer: { next: 1, feedback: "Lila feels calmer and joins your workshop!" },
        ignore: { next: 2, feedback: "Lila feels dismissed. How can you rebuild trust and reassure her?" },
        research: { next: 3, feedback: "You and Lila found resources, starting a school tree-planting project!" }
      }
    }
  ],
  'Peer Pressure': [
    {
      title: "Peer Pressure (Jay)",
      situation: "Your classmate Jay pressures you: 'Skip the history project meeting—it's boring, and we can hang out instead.'",
      options: [
        { text: "\"I'll stay for the meeting, but let's hang out after—it's important to me.\"", points: { selfAwareness: 5, conflictResolution: 5 }, path: "standFirm", feedback: "Great! You balanced your values and friendship." },
        { text: "\"Okay, I'll skip it—I don't want you to be mad at me.\"", points: { resilience: 2 }, path: "cave", feedback: "You gave in to pressure. How could you assert yourself next time?" },
        { text: "\"No way, the project's more fun—leave me alone!\"", points: { empathy: -3 }, path: "snap", feedback: "That might hurt Jay. How could you be kinder but still stand your ground?" }
      ],
      reflection: "Have you ever felt pressured to do something you didn't want? How did you handle it?",
      insight: "Many teens face peer pressure—standing up for yourself builds confidence!",
      paths: {
        standFirm: { next: 3, feedback: "Jay respects your choice, and you both finish the project together!" },
        cave: { next: 4, feedback: "You missed the meeting and felt guilty. How can you rebuild trust with the group?" },
        snap: { next: 5, feedback: "Jay feels hurt. How can you repair your friendship and explain your choice?" }
      }
    },
    {
      title: "Peer Pressure (Zoe)",
      situation: "Your friend Zoe pressures you: 'Don't join the debate club—it's nerdy, and we'll have more fun skipping it.'",
      options: [
        { text: "\"I want to join—I'll see you after, but this matters to me.\"", points: { selfAwareness: 5, conflictResolution: 5 }, path: "standFirm", feedback: "Excellent! You stood your ground respectfully." },
        { text: "\"Fine, I'll skip it—I don't want to seem uncool.\"", points: { resilience: 2 }, path: "cave", feedback: "You gave in to pressure. How could you be confident next time?" },
        { text: "\"No, debate's awesome—stop pressuring me!\"", points: { empathy: -3 }, path: "snap", feedback: "That might hurt Zoe. How could you be firm but kind?" }
      ],
      reflection: "When have you felt peer pressure about hobbies or clubs? How did you respond?",
      insight: "Teens globally join clubs to grow—standing up for your interests builds strength!",
      paths: {
        standFirm: { next: 3, feedback: "Zoe respects your choice, and you excel in debate club!" },
        cave: { next: 4, feedback: "You missed the club and felt regret. How can you rejoin confidently?" },
        snap: { next: 5, feedback: "Zoe feels insulted. How can you repair your friendship and explain?" }
      }
    },
    {
      title: "Peer Pressure (Liam)",
      situation: "Your teammate Liam pressures you: 'Cheat on the science test—everyone does it, and you'll fail otherwise.'",
      options: [
        { text: "\"I'll study harder—no cheating, but I'll ask for help if I need it.\"", points: { selfAwareness: 5, conflictResolution: 5 }, path: "refuse", feedback: "Great! You stayed honest and sought support." },
        { text: "\"Okay, I'll cheat—I don't want to fail or get left out.\"", points: { resilience: 2 }, path: "cave", feedback: "You gave in to pressure. How could you handle this ethically next time?" },
        { text: "\"No way, cheating's wrong—leave me alone!\"", points: { empathy: -3 }, path: "snap", feedback: "That might alienate Liam. How could you refuse kindly but firmly?" }
      ],
      reflection: "Have you faced pressure to cheat or break rules? How did you decide what to do?",
      insight: "Students worldwide value honesty—standing firm builds integrity!",
      paths: {
        refuse: { next: 3, feedback: "Liam respects your choice, and you pass with honest effort!" },
        cave: { next: 4, feedback: "You cheated and felt guilty. How can you make amends and study better?" },
        snap: { next: 5, feedback: "Liam feels hurt. How can you rebuild trust and explain your values?" }
      }
    }
  ],
  'Refugee Friendship': [
    {
      title: "Refugee Friendship (Leila)",
      situation: "Your new friend Leila, who recently moved from a war-torn country, says: 'I'm nervous about making friends here—I miss my old home.'",
      options: [
        { text: "\"I'll introduce you to my friends—let's make new memories together!\"", points: { compassion: 5, empathy: 5 }, path: "welcome", feedback: "Awesome! You made Leila feel included and supported." },
        { text: "\"You'll get used to it, don't worry.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might minimize her feelings. How could you show more understanding?" },
        { text: "\"Why are you so nervous? It's just school.\"", points: { selfAwareness: -3 }, path: "judge", feedback: "Ouch, that could hurt Leila. How can you listen better and empathize?" }
      ],
      reflection: "How would you feel moving to a new place? What could help you feel less nervous?",
      insight: "Refugee kids worldwide build new communities—your kindness can make a big difference!",
      paths: {
        welcome: { next: 6, feedback: "Leila feels grateful and invites you to her cultural event!" },
        dismiss: { next: 7, feedback: "Leila feels unheard. How can you rebuild trust and support her?" },
        judge: { next: 8, feedback: "Leila feels judged. How can you apologize and show compassion?" }
      }
    },
    {
      title: "Refugee Friendship (Hassan)",
      situation: "Your classmate Hassan, who fled a conflict zone, says: 'I'm scared people here won't like me because I'm different.'",
      options: [
        { text: "\"I like you—let's show others your culture through a presentation!\"", points: { compassion: 5, empathy: 5 }, path: "support", feedback: "Great! You boosted Hassan's confidence and included others." },
        { text: "\"You'll be fine—just act normal, and they'll accept you.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might seem dismissive. How could you be more supportive?" },
        { text: "\"Why worry? Everyone's different—it's not a big deal.\"", points: { selfAwareness: -3 }, path: "judge", feedback: "That might hurt Hassan. How can you show empathy and listen?" }
      ],
      reflection: "How would you feel if you were new and different? What could help you feel accepted?",
      insight: "Refugee youth globally share cultures—your friendship opens doors!",
      paths: {
        support: { next: 6, feedback: "Hassan feels included and shares his culture with the class!" },
        dismiss: { next: 7, feedback: "Hassan feels unsupported. How can you rebuild trust and help him?" },
        judge: { next: 8, feedback: "Hassan feels misunderstood. How can you apologize and connect?" }
      }
    },
    {
      title: "Refugee Friendship (Amina)",
      situation: "Your neighbor Amina, who escaped a disaster, says: 'I miss my old friends—I don't know how to connect here.'",
      options: [
        { text: "\"Let's invite people over for a cultural potluck to meet you!\"", points: { compassion: 5, empathy: 5 }, path: "connect", feedback: "Awesome! You helped Amina build connections and feel welcome." },
        { text: "\"You'll make friends soon—don't stress about it.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might minimize her feelings. How could you be more supportive?" },
        { text: "\"Why can't you just talk to people? It's easy.\"", points: { selfAwareness: -3 }, path: "judge", feedback: "That might hurt Amina. How can you listen and empathize better?" }
      ],
      reflection: "What would help you make friends in a new place? How can you support others doing the same?",
      insight: "Refugee kids worldwide find community through shared activities—your help matters!",
      paths: {
        connect: { next: 6, feedback: "Amina feels supported and makes new friends at the potluck!" },
        dismiss: { next: 7, feedback: "Amina feels ignored. How can you rebuild trust and assist her?" },
        judge: { next: 8, feedback: "Amina feels judged. How can you apologize and offer support?" }
      }
    }
  ],
  'Academic Pressure': [
    {
      title: "Academic Pressure (Sam)",
      situation: "Your friend Sam, who's stressed about exams, says: 'I'm failing math, and my parents are upset—I feel like I'll never catch up.'",
      options: [
        { text: "\"I've struggled too—let's study together and make a plan.\"", points: { empathy: 5, resilience: 5 }, path: "support", feedback: "Perfect! You connected and boosted Sam's confidence." },
        { text: "\"You should've studied harder—maybe you're just not good at it.\"", points: { selfAwareness: -3 }, path: "criticize", feedback: "That might hurt Sam—try understanding first. How could you help better?" },
        { text: "\"Don't worry, failing's no big deal—you'll figure it out.\"", points: { resilience: 4, compassion: 2 }, path: "encourage", feedback: "Good encouragement, but Sam needs a plan. How can you help deeper?" }
      ],
      reflection: "Think of a time you felt academic pressure. How did you cope, and what helped you succeed?",
      insight: "Students globally use study groups and mindfulness to manage stress—your support can help too!",
      paths: {
        support: { next: 9, feedback: "Sam feels motivated and improves with your help!" },
        criticize: { next: 10, feedback: "Sam feels discouraged. How can you rebuild their confidence?" },
        encourage: { next: 11, feedback: "Sam feels supported but needs a strategy. How can you guide them?" }
      }
    },
    {
      title: "Academic Pressure (Nia)",
      situation: "Your teammate Nia says: 'I'm overwhelmed with homework—I'll never finish, and my grades are dropping.'",
      options: [
        { text: "\"Let's break it down together—I'll help you prioritize tasks.\"", points: { empathy: 5, resilience: 5 }, path: "prioritize", feedback: "Great! You supported Nia and helped her manage stress." },
        { text: "\"You're overreacting—just work harder, and you'll be fine.\"", points: { selfAwareness: -3 }, path: "criticize", feedback: "That might hurt Nia—try understanding first. How could you assist better?" },
        { text: "\"Don't stress, grades aren't everything—you'll catch up.\"", points: { resilience: 4, compassion: 2 }, path: "comfort", feedback: "Good reassurance, but Nia needs a plan. How can you help more deeply?" }
      ],
      reflection: "When have you felt overwhelmed by schoolwork? What strategies helped you succeed?",
      insight: "Teens worldwide use time management and support systems—your help can ease Nia's stress!",
      paths: {
        prioritize: { next: 9, feedback: "Nia feels relieved and improves with your guidance!" },
        criticize: { next: 10, feedback: "Nia feels judged. How can you rebuild trust and support her?" },
        comfort: { next: 11, feedback: "Nia feels better but needs structure. How can you assist further?" }
      }
    },
    {
      title: "Academic Pressure (Taro)",
      situation: "Your friend Taro says: 'I'm failing history, and I'm scared my teacher will call my parents again.'",
      options: [
        { text: "\"I'll tutor you after school—let's create a study schedule.\"", points: { compassion: 5, resilience: 5 }, path: "tutor", feedback: "Excellent! You supported Taro and built his confidence." },
        { text: "\"You need to try harder—maybe you're not cut out for history.\"", points: { selfAwareness: -3 }, path: "criticize", feedback: "That might discourage Taro—try empathy first. How could you help better?" },
        { text: "\"Don't worry, it'll work out—focus on other subjects.\"", points: { resilience: 4, compassion: 2 }, path: "reassure", feedback: "Good comfort, but Taro needs a plan. How can you guide him more?" }
      ],
      reflection: "Have you ever feared disappointing someone about grades? How did you handle it?",
      insight: "Students globally seek help from peers—your support can boost Taro's success!",
      paths: {
        tutor: { next: 9, feedback: "Taro feels supported and improves with your tutoring!" },
        criticize: { next: 10, feedback: "Taro feels hurt. How can you rebuild trust and assist him?" },
        reassure: { next: 11, feedback: "Taro feels better but needs help. How can you offer more support?" }
      }
    }
  ],
  'Cultural Misunderstandings': [
    {
      title: "Cultural Misunderstandings (Aisha)",
      situation: "Your classmate Aisha, from a different culture, says: 'You laughed at my traditional dance—I think you don't respect it.'",
      options: [
        { text: "\"I'm sorry—I thought it was beautiful, but I didn't understand. Can you teach me more?\"", points: { empathy: 5, conflictResolution: 5 }, path: "apologize", feedback: "Great! You showed respect and resolved the misunderstanding." },
        { text: "\"It was just a joke—don't take it personally.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might hurt Aisha more. How could you show respect instead?" },
        { text: "\"Why are you upset? I didn't mean to offend you.\"", points: { selfAwareness: -2 }, path: "defend", feedback: "That might seem dismissive. How can you listen and learn?" }
      ],
      reflection: "Have you ever misunderstood someone's culture? How did you learn from it?",
      insight: "Cultural differences enrich our world—listening builds bridges everywhere!",
      paths: {
        apologize: { next: 12, feedback: "Aisha appreciates your apology and teaches you her dance!" },
        dismiss: { next: 13, feedback: "Aisha feels hurt. How can you rebuild trust and learn about her culture?" },
        defend: { next: 14, feedback: "Aisha feels misunderstood. How can you show empathy and apologize?" }
      }
    },
    {
      title: "Cultural Misunderstandings (Ravi)",
      situation: "Your friend Ravi, from another country, says: 'You ignored my holiday greeting—I think you don't care about my traditions.'",
      options: [
        { text: "\"I'm sorry—I didn't understand. Can you explain your holiday, and I'll celebrate with you?\"", points: { empathy: 5, conflictResolution: 5 }, path: "apologize", feedback: "Great! You resolved the misunderstanding and respected Ravi." },
        { text: "\"I was busy—it's not a big deal, relax.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might hurt Ravi. How could you show respect instead?" },
        { text: "\"Why are you upset? I didn't mean to ignore you.\"", points: { selfAwareness: -2 }, path: "defend", feedback: "That might seem dismissive. How can you listen and learn?" }
      ],
      reflection: "Have you ever missed a cultural cue? How did you learn from it?",
      insight: "Global cultures share holidays—your curiosity builds friendships!",
      paths: {
        apologize: { next: 12, feedback: "Ravi feels valued and shares his holiday with you!" },
        dismiss: { next: 13, feedback: "Ravi feels hurt. How can you rebuild trust and learn about his traditions?" },
        defend: { next: 14, feedback: "Ravi feels misunderstood. How can you show empathy and apologize?" }
      }
    },
    {
      title: "Cultural Misunderstandings (Sofia)",
      situation: "Your teammate Sofia, from a different background, says: 'You criticized my food—it felt like you were judging my culture.'",
      options: [
        { text: "\"I'm sorry—I didn't mean to offend. Can you tell me more about your food?\"", points: { empathy: 5, conflictResolution: 5 }, path: "apologize", feedback: "Great! You clarified and respected Sofia's culture." },
        { text: "\"It was just my opinion—don't take it personally.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might hurt Sofia. How could you show respect instead?" },
        { text: "\"Why are you upset? I didn't know it was cultural.\"", points: { selfAwareness: -2 }, path: "defend", feedback: "That might seem dismissive. How can you listen and learn?" }
      ],
      reflection: "Have you ever judged something cultural without understanding? How did you learn?",
      insight: "Diverse foods connect us globally—your openness builds understanding!",
      paths: {
        apologize: { next: 12, feedback: "Sofia feels respected and shares her food with you!" },
        dismiss: { next: 13, feedback: "Sofia feels hurt. How can you rebuild trust and learn about her culture?" },
        defend: { next: 14, feedback: "Sofia feels misunderstood. How can you show empathy and apologize?" }
      }
    }
  ],
  'Digital Responsibility': [
    {
      title: "Digital Responsibility (Emma)",
      situation: "Your friend Emma admits: 'I posted a mean comment online about someone—I feel bad, but I was angry.'",
      options: [
        { text: "\"Let's apologize together—I'll help you explain why you were upset.\"", points: { compassion: 5, conflictResolution: 5 }, path: "apologize", feedback: "Great! You supported Emma and resolved the conflict." },
        { text: "\"It's just online—don't worry, they'll get over it.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might minimize Emma's guilt. How could you help her take responsibility?" },
        { text: "\"You shouldn't have done that—why would you post something mean?\"", points: { selfAwareness: -3 }, path: "judge", feedback: "That might hurt Emma. How can you be supportive and guide her?" }
      ],
      reflection: "Have you ever regretted something you posted online? How did you handle it?",
      insight: "Teens globally learn digital citizenship—kindness online builds trust!",
      paths: {
        apologize: { next: 15, feedback: "Emma feels better and removes the comment, thanking you!" },
        dismiss: { next: 16, feedback: "Emma feels unsupported. How can you help her take action?" },
        judge: { next: 17, feedback: "Emma feels judged. How can you apologize and guide her better?" }
      }
    },
    {
      title: "Digital Responsibility (Noah)",
      situation: "Your cousin Noah says: 'I spend hours gaming and skip homework—I can't stop, but I feel guilty.'",
      options: [
        { text: "\"Let's set a schedule together—I'll help you balance gaming and school.\"", points: { compassion: 5, resilience: 5 }, path: "balance", feedback: "Great! You supported Noah and helped him manage time." },
        { text: "\"Just stop gaming—it's ruining your grades, stop being lazy.\"", points: { selfAwareness: -3 }, path: "criticize", feedback: "That might hurt Noah. How could you be more supportive instead?" },
        { text: "\"Don't worry, it's fine—everyone games too much sometimes.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might dismiss Noah's guilt. How can you help him improve?" }
      ],
      reflection: "How do you manage screen time? What helps you balance fun and responsibilities?",
      insight: "Youth worldwide set screen limits—your support can help Noah thrive!",
      paths: {
        balance: { next: 15, feedback: "Noah feels motivated and sticks to your schedule!" },
        criticize: { next: 16, feedback: "Noah feels judged. How can you rebuild trust and assist him?" },
        dismiss: { next: 17, feedback: "Noah feels unsupported. How can you guide him to balance better?" }
      }
    },
    {
      title: "Digital Responsibility (Sophie)",
      situation: "Your friend Sophie says: 'I got a mean message online—I'm scared to respond, but I want to stand up for myself.'",
      options: [
        { text: "\"Let's report it together and craft a kind response—I'll support you.\"", points: { compassion: 5, conflictResolution: 5 }, path: "support", feedback: "Great! You helped Sophie feel safe and resolve the issue." },
        { text: "\"Ignore it—it's just trolls, don't let it bother you.\"", points: { resilience: 2 }, path: "dismiss", feedback: "That might minimize Sophie's fear. How could you be more supportive?" },
        { text: "\"Why are you scared? Just block them—it's not a big deal.\"", points: { selfAwareness: -3 }, path: "judge", feedback: "That might hurt Sophie. How can you empathize and help her?" }
      ],
      reflection: "Have you faced online negativity? How did you handle it, and what did you learn?",
      insight: "Teens globally use digital tools to stay safe—your support strengthens Sophie!",
      paths: {
        support: { next: 15, feedback: "Sophie feels empowered and resolves the issue with you!" },
        dismiss: { next: 16, feedback: "Sophie feels unsupported. How can you help her feel safe?" },
        judge: { next: 17, feedback: "Sophie feels judged. How can you apologize and assist her?" }
      }
    }
  ]
};

function App() {
  const [emotionalIndex, setEmotionalIndex] = useState({
    empathy: 0,
    compassion: 0,
    conflictResolution: 0,
    resilience: 0,
    selfAwareness: 0,
    growth: 0
  });
  const [currentScenario, setCurrentScenario] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showInsight, setShowInsight] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [scenarioHistory, setScenarioHistory] = useState([]);
  const [playerChoices, setPlayerChoices] = useState([]); // Store player's scenario choices
  const [selectedPlayer, setSelectedPlayer] = useState(null); // For Social Feedback Hub navigation
  const [allPlayerData, setAllPlayerData] = useState([]); // Store all players' data
  const [selectedTeammate, setSelectedTeammate] = useState(null); // For Breakaway Room
  const [breakawayChallenge, setBreakawayChallenge] = useState(null); // New challenge for Breakaway Room

  // Add a state to track which themes have been completed
  const [completedThemes, setCompletedThemes] = useState({
    'Climate Anxiety': 0,
    'Peer Pressure': 0,
    'Refugee Friendship': 0,
    'Academic Pressure': 0,
    'Cultural Misunderstandings': 0,
    'Digital Responsibility': 0
  });

  // Add back the currentScenarios state that was accidentally removed
  const [currentScenarios, setCurrentScenarios] = useState([]);

  // Add new state for tracking if user is making a choice
  const [isChoosing, setIsChoosing] = useState(false);

  // Add new state for session
  const [sessionId, setSessionId] = useState(null);

  // Initialize scenarios on component mount
  useEffect(() => {
    const initialScenarios = [];
    Object.keys(scenarioPool).forEach(theme => {
      // Get all three scenarios from each theme
      scenarioPool[theme].forEach(scenario => {
        initialScenarios.push(scenario);
      });
    });
    // Shuffle the array to randomize the order
    const shuffledScenarios = initialScenarios
      .sort(() => Math.random() - 0.5);
    setCurrentScenarios(shuffledScenarios);
  }, []); // Empty dependency array means this runs once on mount

  // Load leaderboard from Firestore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('growth', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const leaderboardData = querySnapshot.docs.map(doc => doc.data());
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Set default leaderboard data for local testing
        setLeaderboard([
          { name: 'Test Player 1', role: 'Empathy Explorer', growth: 100 },
          { name: 'Test Player 2', role: 'Resilience Ranger', growth: 85 },
          { name: 'Test Player 3', role: 'Compassion Captain', growth: 70 }
        ]);
      }
    };
    fetchLeaderboard();
  }, []);

  // Add real-time leaderboard listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'leaderboard'), orderBy('growth', 'desc'), limit(5)),
      (snapshot) => {
        const leaderboardData = snapshot.docs.map(doc => doc.data());
        setLeaderboard(leaderboardData);
      },
      (error) => {
        console.error('Error listening to leaderboard:', error);
      }
    );
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // First, add this helper function near the top of the App component
  const getFeedbackStyle = (option) => {
    // Check if any points are negative (incorrect)
    if (Object.values(option.points).some(point => point < 0)) {
      return {
        backgroundColor: 'rgba(220, 53, 69, 0.1)', // Light red background
        color: '#dc3545', // Red text
        borderLeft: '4px solid #dc3545'
      };
    }
    // Check if points are low/neutral (0-2)
    else if (Object.values(option.points).every(point => point >= 0 && point <= 2)) {
      return {
        backgroundColor: 'rgba(255, 193, 7, 0.1)', // Light orange background
        color: '#ffc107', // Orange text
        borderLeft: '4px solid #ffc107'
      };
    }
    // Otherwise it's correct (positive points > 2)
    return {
      backgroundColor: 'rgba(40, 167, 69, 0.1)', // Light green background
      color: '#28a745', // Green text
      borderLeft: '4px solid #28a745'
    };
  };

  // Move this useEffect before any conditional returns
  useEffect(() => {
    const checkSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session');
      const playerName = params.get('player');

      if (sessionId && playerName) {
        try {
          const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
          if (sessionDoc.exists()) {
            const sessionData = sessionDoc.data();
            const player = sessionData.players.find(p => p.name === playerName);
            
            if (player) {
              setSessionId(sessionId);
              setPlayerName(player.name);
              setPlayerRole(player.role);
              // Set other necessary state based on session data
            }
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }
    };

    checkSession();
  }, []);

  // Step 1: Enter Name (changed condition to check for empty string)
  if (!playerName) {
    return (
      <div className="game-container">
        <h1>Global Hearts: Emotional Odyssey <FaGlobe /></h1>
        <p>Enter your name for the leaderboard:</p>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Your name"
          maxLength={20}
          style={{ width: '60%', padding: '10px', margin: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button
          onClick={() => setPlayerName(nameInput.trim() || 'Player')}
          disabled={!nameInput.trim()}
          style={{ marginTop: '10px' }}
        >
          Start <FaUser />
        </button>
      </div>
    );
  }

  // Step 2: Select Ambassador (Role)
  if (!playerRole) {
    const roles = [
      {
        id: 'Empathy Explorer',
        icon: <FaHeart style={{ color: '#e74c3c', fontSize: '2.5em' }} />,
        name: 'Empathy Explorer',
        description: 'Feel deeply, connect genuinely, and nurture growth.'
      },
      {
        id: 'Resilience Ranger',
        icon: <FaShieldAlt style={{ color: '#3498db', fontSize: '2.5em' }} />,
        name: 'Resilience Ranger',
        description: 'Stand strong amidst adversity and inspire strength.'
      },
      {
        id: 'Compassion Captain',
        icon: <FaUser style={{ color: '#9b59b6', fontSize: '2.5em' }} />,
        name: 'Compassion Captain',
        description: 'Lead with kindness and foster understanding.'
      },
      {
        id: 'Peacekeeper',
        icon: <FaGlobe style={{ color: '#27ae60', fontSize: '2.5em' }} />,
        name: 'Peacekeeper',
        description: 'Bring harmony to conflicts and promote unity.'
      },
      {
        id: 'Innovation Instigator',
        icon: <FaLightbulb style={{ color: '#f39c12', fontSize: '2.5em' }} />,
        name: 'Innovation Instigator',
        description: 'Spark creativity and drive change.'
      },
      {
        id: 'Visionary Voyager',
        icon: <FaRocket style={{ color: '#e67e22', fontSize: '2.5em' }} />,
        name: 'Visionary Voyager',
        description: 'Explore new horizons with bold vision and daring dreams.'
      },
      {
        id: 'Harmony Herald',
        icon: <FaHands style={{ color: '#2980b9', fontSize: '2.5em' }} />,
        name: 'Harmony Herald',
        description: 'Celebrate diversity and foster peaceful collaboration.'
      }
    ];
    return (
      <div className="game-container">
        <h1>Global Hearts: Emotional Odyssey <FaGlobe /></h1>
        <p>Welcome, {playerName}! Choose your role as a Global Ambassador:</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          justifyItems: 'center',
          marginTop: '20px'
        }}>
          {roles.map(roleOption => (
            <motion.div
              key={roleOption.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '250px',
                height: '250px',
                border: '2px solid #007bff',
                borderRadius: '15px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                cursor: 'pointer'
              }}
              onClick={() => setPlayerRole(roleOption.id)}
              aria-label={`Select ${roleOption.name} role`}
              onTouchEnd={(e) => { e.preventDefault(); setPlayerRole(roleOption.id); }}
            >
              {roleOption.icon}
              <h2 style={{ margin: '10px 0', textAlign: 'center' }}>{roleOption.name}</h2>
              <p style={{ textAlign: 'center', fontSize: '0.9em' }}>{roleOption.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Start Game with Scenarios
  const calculateGrowthPoints = (option) => {
    // Base points for taking action
    let growthPoints = 1;
    
    // Additional point for positive choices (no negative points)
    if (!Object.values(option.points).some(point => point < 0)) {
      growthPoints += 1;
    }
    
    // Bonus point for highly empathetic/compassionate choices
    if (Object.values(option.points).some(point => point > 3)) {
      growthPoints += 1;
    }
    
    return growthPoints;
  };

  const handleChoice = async (option) => {
    // Prevent multiple choices
    if (isChoosing) return;
    setIsChoosing(true);

    const newIndex = { ...emotionalIndex };
    for (let key in option.points) {
      newIndex[key] += option.points[key];
    }
    
    const growthPoints = calculateGrowthPoints(option);
    newIndex.growth += growthPoints;
    setEmotionalIndex(newIndex);

    // Show feedback immediately
    setFeedback({ text: option.feedback, option });
    
    try {
      await saveChoice({
        playerName,
        playerRole,
        scenarioTitle: currentScenarios[currentScenario].title,
        choice: option.text,
        points: option.points,
        timestamp: new Date().toISOString()
      });

      await addDoc(collection(db, 'leaderboard'), {
        name: playerName,
        role: playerRole,
        growth: newIndex.growth,
        timestamp: new Date().toISOString()
      });

      const q = query(collection(db, 'leaderboard'), orderBy('growth', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      setLeaderboard(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) {
      console.error('Error updating after choice:', error);
    }

    setScenarioHistory([...scenarioHistory, currentScenarios[currentScenario].title]);

    // Clear feedback after 5 seconds
    setTimeout(() => {
      setFeedback(null);
      // Move to next scenario
      if (currentScenario < currentScenarios.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setIsChoosing(false); // Reset choosing state
      } else {
        setGameOver(true);
        saveScore();
      }
    }, 5000);
  };

  const resetUI = () => {
    setFeedback(null);
  };

  const saveScore = async () => {
    try {
      await addDoc(collection(db, 'leaderboard'), {
        name: playerName,
        role: playerRole,
        growth: emotionalIndex.growth,
        timestamp: new Date().toISOString()
      });
      const q = query(collection(db, 'leaderboard'), orderBy('growth', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      setLeaderboard(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const saveChoice = async (choiceData) => {
    try {
      await addDoc(collection(db, 'choices'), choiceData);
    } catch (error) {
      console.error('Error saving choice:', error);
    }
  };

  const strongestSkill = Object.keys(emotionalIndex).reduce((a, b) => emotionalIndex[a] > emotionalIndex[b] ? a : b);

  const handleInteraction = (eventHandler) => {
    if ('ontouchend' in window) {
      return (e) => {
        e.preventDefault();
        eventHandler(e);
      };
    }
    return eventHandler;
  };

  // Function to generate a session link
  const generateTeamSession = async (teammate) => {
    try {
      // Generate a unique session ID
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Save session data to Firebase
      await setDoc(doc(db, 'sessions', sessionId), {
        players: [
          {
            name: playerName,
            role: playerRole,
            scores: emotionalIndex,
            isHost: true
          },
          {
            name: teammate.name,
            role: teammate.role,
            scores: teammate.scores,
            isHost: false
          }
        ],
        status: 'pending',
        created: new Date().toISOString(),
        challenge: null // Will be set when both players join
      });

      // Generate the invitation link
      const inviteLink = `${window.location.origin}?session=${sessionId}&player=${teammate.name}`;
      
      // Show the link to the host
      alert(`Share this link with ${teammate.name}:\n${inviteLink}`);
      
      setSessionId(sessionId);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create team session. Please try again.');
    }
  };

  // Modify the teammate selection handler
  const handleTeammateSelect = (teammate) => {
    generateTeamSession(teammate);
  };

  return (
    <div className="game-container">
      <motion.h1 variants={containerVariants} initial="hidden" animate="visible">
        Global Hearts: Emotional Odyssey <FaGlobe />
      </motion.h1>
      <p>Role: {playerRole}</p>
      <EmotionalIndex index={emotionalIndex} />
      {gameOver ? (
        <GameSummary 
          playerName={playerName}
          playerRole={playerRole}
          emotionalIndex={emotionalIndex}
          allPlayerData={allPlayerData}
          onTeammateSelect={handleTeammateSelect}
        />
      ) : (
        <>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Scenario 
              scenario={currentScenarios[currentScenario]} 
              onChoice={handleChoice} 
              role={playerRole}
              isChoosing={isChoosing}
            />
          </motion.div>
          {feedback && (
            <motion.div 
              className="feedback" 
              variants={feedbackVariants} 
              initial="hidden" 
              animate="visible"
              exit="exit"
              style={{
                ...getFeedbackStyle(feedback.option),
                padding: '15px',
                borderRadius: '8px',
                marginTop: '15px',
                marginBottom: '15px',
                fontSize: '1.1em',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '90%',
                width: 'auto',
                margin: '15px auto'
              }}
            >
              {feedback.text} 
              <FaHeart style={{ 
                color: getFeedbackStyle(feedback.option).color,
                marginLeft: '8px' 
              }} />
            </motion.div>
          )}
        </>
      )}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="leaderboard">
        <h3>Global Hearts Leaderboard <FaUser /></h3>
        <ul>
          {leaderboard.map((player, index) => (
            <li key={index}>{player.name} ({player.role}): {player.growth} Growth <FaHeart style={{ color: '#f1c40f' }} /></li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const feedbackVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 200
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.5
    }
  }
};

export default App;