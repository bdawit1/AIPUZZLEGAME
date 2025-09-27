import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target, Flame } from "lucide-react";

export default function ScoreDisplay({ gameSession }) {
  if (!gameSession) return null;

  return (
    <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur rounded-lg px-4 py-2 border border-slate-700">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-bold">
          {gameSession.total_score.toLocaleString()}
        </span>
      </div>
      
      {gameSession.current_streak > 0 && (
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 font-bold">
            {gameSession.current_streak}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 font-medium">
          {gameSession.puzzles_solved}
        </span>
      </div>
    </div>
  );
}