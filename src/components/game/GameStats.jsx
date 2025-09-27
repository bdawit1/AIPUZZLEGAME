import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, TrendingUp, Brain, Star } from "lucide-react";

export default function GameStats({ gameSession }) {
  if (!gameSession) return null;

  const achievements = [
    {
      name: "First Steps",
      description: "Solve your first puzzle",
      completed: gameSession.puzzles_solved >= 1,
      icon: Target
    },
    {
      name: "Puzzle Master",
      description: "Solve 10 puzzles",
      completed: gameSession.puzzles_solved >= 10,
      icon: Brain,
      progress: Math.min(100, (gameSession.puzzles_solved / 10) * 100)
    },
    {
      name: "Hot Streak",
      description: "Get a 5-puzzle streak",
      completed: gameSession.best_streak >= 5,
      icon: Flame,
      progress: Math.min(100, (gameSession.best_streak / 5) * 100)
    },
    {
      name: "Point Collector",
      description: "Earn 100 points",
      completed: gameSession.total_score >= 100,
      icon: Star,
      progress: Math.min(100, (gameSession.total_score / 100) * 100)
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {gameSession.total_score.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {gameSession.puzzles_solved}
              </div>
              <div className="text-sm text-slate-400">Puzzles Solved</div>
            </div>
          </div>
          
          <div className="border-t border-slate-600 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Current Streak</span>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-bold">
                  {gameSession.current_streak}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Best Streak</span>
              <span className="text-white font-bold">
                {gameSession.best_streak}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  achievement.completed
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-slate-700/30 border-slate-600/30"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    className={`w-5 h-5 ${
                      achievement.completed ? "text-green-400" : "text-slate-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        achievement.completed ? "text-green-400" : "text-slate-300"
                      }`}
                    >
                      {achievement.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {achievement.description}
                    </div>
                  </div>
                  {achievement.completed && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {!achievement.completed && achievement.progress !== undefined && (
                  <Progress
                    value={achievement.progress}
                    className="h-2 bg-slate-700"
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}