
import React, { useState, useEffect, useCallback } from "react";
import { Puzzle, GameSession, User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Lightbulb, 
  Trophy, 
  Zap, 
  Target, 
  SkipForward,
  CheckCircle,
  XCircle,
  Sparkles,
  Timer,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import PuzzleDisplay from "../components/game/PuzzleDisplay";
import CategorySelector from "../components/game/CategorySelector";
import ScoreDisplay from "../components/game/ScoreDisplay";
import GameStats from "../components/game/GameStats";

export default function Game() {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameSession, setGameSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("mixed");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [showResult, setShowResult] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [user, setUser] = useState(null);

  const handleTimeUp = useCallback(() => {
    setIsActive(false);
    setShowResult({ 
      type: "timeout", 
      message: "Time's up! Don't worry, try another puzzle!", 
      answer: currentPuzzle?.answer 
    });
    
    // Reset streak on timeout
    if (gameSession && gameSession.current_streak > 0) {
      GameSession.update(gameSession.id, { current_streak: 0 });
      setGameSession(prev => ({ ...prev, current_streak: 0 }));
    }
  }, [currentPuzzle, gameSession]); // currentPuzzle and gameSession are dependencies here

  const loadGameSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const sessions = await GameSession.filter({ user_email: user.email });
      if (sessions.length > 0) {
        setGameSession(sessions[0]);
      } else {
        const newSession = await GameSession.create({ 
          user_email: user.email,
          category_preferences: {}
        });
        setGameSession(newSession);
      }
    } catch (error) {
      console.error("Error loading game session:", error);
    }
  }, [user]); // user is the dependency here

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error("User not logged in");
      }
    };
    loadUser();
  }, []); // Runs once on mount

  useEffect(() => {
    if (user) {
      loadGameSession();
    }
  }, [user, loadGameSession]); // Reruns when user changes or loadGameSession callback changes (which it won't unless its deps change)

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleTimeUp]); // handleTimeUp is a dependency

  const generateNewPuzzle = async () => {
    setIsGenerating(true);
    setCurrentPuzzle(null);
    setUserAnswer("");
    setShowResult(null);
    setHintsUsed(0);
    setCurrentHint("");
    setTimeLeft(120);
    setIsActive(false);

    try {
      const categories = selectedCategory === "mixed" 
        ? ["riddle", "math", "word", "logic", "pattern"]
        : [selectedCategory];
      
      const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const prompt = `Generate a creative ${chosenCategory} puzzle with ${selectedDifficulty} difficulty.

Requirements:
- Make it engaging and unique
- ${chosenCategory === 'riddle' ? 'Create a clever riddle with wordplay or lateral thinking' : ''}
- ${chosenCategory === 'math' ? 'Create an interesting math problem (not just basic arithmetic)' : ''}
- ${chosenCategory === 'word' ? 'Create a word puzzle, anagram, or vocabulary challenge' : ''}
- ${chosenCategory === 'logic' ? 'Create a logic puzzle requiring deductive reasoning' : ''}
- ${chosenCategory === 'pattern' ? 'Create a pattern recognition or sequence puzzle' : ''}
- Difficulty: ${selectedDifficulty === 'easy' ? 'Simple but interesting' : selectedDifficulty === 'medium' ? 'Moderately challenging' : 'Complex and thought-provoking'}
- Include 3 progressive hints
- Provide clear explanation of the solution

Make it creative and fun!`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
            hints: {
              type: "array",
              items: { type: "string" },
              maxItems: 3
            },
            explanation: { type: "string" },
            points: { type: "number" }
          }
        }
      });

      const puzzle = await Puzzle.create({
        category: chosenCategory,
        difficulty: selectedDifficulty,
        question: result.question,
        answer: result.answer,
        hints: result.hints || [],
        explanation: result.explanation,
        points: result.points || (selectedDifficulty === 'easy' ? 10 : selectedDifficulty === 'medium' ? 20 : 30)
      });

      setCurrentPuzzle(puzzle);
      setIsActive(true);
    } catch (error) {
      console.error("Error generating puzzle:", error);
    }
    
    setIsGenerating(false);
  };

  const checkAnswer = async () => {
    if (!userAnswer.trim() || !currentPuzzle) return;
    
    setIsCheckingAnswer(true);
    
    try {
      const prompt = `Compare the user's answer with the correct answer for this puzzle:
      
Question: ${currentPuzzle.question}
Correct Answer: ${currentPuzzle.answer}
User's Answer: ${userAnswer}

Is the user's answer correct? Consider:
- Exact matches
- Equivalent answers (like "5" vs "five")
- Close enough answers that show understanding
- Case insensitive matching

Return true if correct, false if incorrect.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            is_correct: { type: "boolean" },
            feedback: { type: "string" }
          }
        }
      });

      const isCorrect = result.is_correct;
      const pointsEarned = isCorrect ? Math.max(5, currentPuzzle.points - (hintsUsed * 5)) : 0;

      if (isCorrect) {
        setShowResult({ 
          type: "success", 
          message: "Brilliant! You solved it!", 
          points: pointsEarned,
          feedback: result.feedback 
        });
        
        // Update game session
        if (gameSession) {
          const newStreak = gameSession.current_streak + 1;
          await GameSession.update(gameSession.id, {
            total_score: gameSession.total_score + pointsEarned,
            current_streak: newStreak,
            best_streak: Math.max(gameSession.best_streak, newStreak),
            puzzles_solved: gameSession.puzzles_solved + 1
          });
          
          setGameSession(prevGameSession => ({
            ...prevGameSession,
            total_score: (prevGameSession?.total_score || 0) + pointsEarned,
            current_streak: newStreak,
            best_streak: Math.max((prevGameSession?.best_streak || 0), newStreak),
            puzzles_solved: (prevGameSession?.puzzles_solved || 0) + 1
          }));
        }
      } else {
        setShowResult({ 
          type: "error", 
          message: "Not quite right. Try again or use a hint!", 
          feedback: result.feedback 
        });
        
        // Reset streak on wrong answer
        if (gameSession && gameSession.current_streak > 0) {
          await GameSession.update(gameSession.id, {
            current_streak: 0
          });
          setGameSession(prevGameSession => ({
            ...prevGameSession,
            current_streak: 0
          }));
        }
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setShowResult({ type: "error", message: "Error checking answer. Please try again." });
    }
    
    setIsCheckingAnswer(false);
    setIsActive(false);
  };

  const useHint = () => {
    if (!currentPuzzle || hintsUsed >= currentPuzzle.hints.length) return;
    
    setCurrentHint(currentPuzzle.hints[hintsUsed]);
    setHintsUsed(hintsUsed + 1);
  };

  const skipPuzzle = () => {
    setShowResult({ 
      type: "skipped", 
      message: "Puzzle skipped. Here's the answer:", 
      answer: currentPuzzle?.answer,
      explanation: currentPuzzle?.explanation 
    });
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-800/90 backdrop-blur border-slate-700">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to PuzzleMind</h2>
            <p className="text-slate-300 mb-6">Please log in to start playing and track your progress!</p>
            <Button 
              onClick={() => User.login()} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Login to Play
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">PuzzleMind</h1>
              <p className="text-slate-300">AI-Generated Brain Challenges</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ScoreDisplay gameSession={gameSession} />
            {currentPuzzle && isActive && (
              <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur rounded-lg px-3 py-2">
                <Timer className="w-4 h-4 text-blue-400" />
                <span className={`font-mono font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Game Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategorySelector
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                />
                
                <Button
                  onClick={generateNewPuzzle}
                  disabled={isGenerating}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Generating Puzzle...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate New Puzzle
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Puzzle Display */}
            {currentPuzzle && (
              <PuzzleDisplay
                puzzle={currentPuzzle}
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                onSubmit={checkAnswer}
                isChecking={isCheckingAnswer}
                showResult={showResult}
                onNewPuzzle={generateNewPuzzle}
                onUseHint={useHint}
                onSkip={skipPuzzle}
                hintsUsed={hintsUsed}
                currentHint={currentHint}
                timeLeft={timeLeft}
                isActive={isActive}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GameStats gameSession={gameSession} />
          </div>
        </div>
      </div>
    </div>
  );
}
