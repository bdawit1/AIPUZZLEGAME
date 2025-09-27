import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  SkipForward, 
  Timer, 
  Sparkles,
  Clock,
  AlertTriangle
} from "lucide-react";

const categoryIcons = {
  riddle: "🤔",
  math: "🔢",
  word: "📝",
  logic: "🧩",
  pattern: "🎯"
};

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function PuzzleDisplay({
  puzzle,
  userAnswer,
  setUserAnswer,
  onSubmit,
  isChecking,
  showResult,
  onNewPuzzle,
  onUseHint,
  onSkip,
  hintsUsed,
  currentHint,
  timeLeft,
  isActive
}) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isChecking) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">{categoryIcons[puzzle.category]}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="capitalize">{puzzle.category} Puzzle</span>
                <Badge className={`${difficultyColors[puzzle.difficulty]} border`}>
                  {puzzle.difficulty}
                </Badge>
              </div>
              <div className="text-sm text-slate-400">
                Worth {puzzle.points} points
              </div>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {isActive && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                timeLeft <= 30 ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'
              } border`}>
                <Timer className={`w-4 h-4 ${timeLeft <= 30 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className={`font-mono font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-blue-400'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
          <h3 className="text-lg font-semibold text-white mb-3">Challenge:</h3>
          <p className="text-slate-100 text-lg leading-relaxed whitespace-pre-wrap">
            {puzzle.question}
          </p>
        </div>

        {/* Hint Display */}
        <AnimatePresence>
          {currentHint && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Hint {hintsUsed}:</span>
              </div>
              <p className="text-yellow-100">{currentHint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Input */}
        {!showResult && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Answer:
              </label>
              {puzzle.category === "riddle" || puzzle.category === "logic" ? (
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
                  disabled={isChecking || !isActive}
                />
              ) : (
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  disabled={isChecking || !isActive}
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onSubmit}
                disabled={!userAnswer.trim() || isChecking || !isActive}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>

              <Button
                onClick={onUseHint}
                disabled={hintsUsed >= puzzle.hints.length || !isActive}
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint ({hintsUsed}/{puzzle.hints.length})
              </Button>

              <Button
                onClick={onSkip}
                disabled={!isActive}
                variant="outline"
                className="border-slate-500 text-slate-400 hover:bg-slate-700/50"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
            </div>
          </div>
        )}

        {/* Result Display */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className={`rounded-lg p-6 border ${
                showResult.type === "success" 
                  ? "bg-green-500/10 border-green-500/30" 
                  : showResult.type === "timeout"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {showResult.type === "success" ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : showResult.type === "timeout" ? (
                    <Clock className="w-6 h-6 text-orange-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <h3 className={`font-bold text-lg ${
                    showResult.type === "success" 
                      ? "text-green-400" 
                      : showResult.type === "timeout"
                      ? "text-orange-400"
                      : "text-red-400"
                  }`}>
                    {showResult.message}
                  </h3>
                </div>

                {showResult.points && (
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      +{showResult.points} points earned!
                    </span>
                  </div>
                )}

                {showResult.feedback && (
                  <p className="text-slate-300 mb-3">{showResult.feedback}</p>
                )}

                {showResult.answer && (
                  <div className="bg-slate-700/50 rounded p-4 mb-3">
                    <p className="text-sm text-slate-400 mb-1">Correct Answer:</p>
                    <p className="text-white font-medium">{showResult.answer}</p>
                  </div>
                )}

                {showResult.explanation && (
                  <div className="bg-slate-700/50 rounded p-4">
                    <p className="text-sm text-slate-400 mb-1">Explanation:</p>
                    <p className="text-slate-200">{showResult.explanation}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={onNewPuzzle}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Puzzle
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}