import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categoryOptions = [
  { value: "mixed", label: "🎲 Mixed (Random)", description: "Get any type of puzzle" },
  { value: "riddle", label: "🤔 Riddles", description: "Brain teasers and wordplay" },
  { value: "math", label: "🔢 Math", description: "Number puzzles and calculations" },
  { value: "word", label: "📝 Word", description: "Language and vocabulary" },
  { value: "logic", label: "🧩 Logic", description: "Deductive reasoning" },
  { value: "pattern", label: "🎯 Pattern", description: "Sequence recognition" }
];

const difficultyOptions = [
  { value: "easy", label: "Easy", color: "bg-green-500/20 text-green-400" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "hard", label: "Hard", color: "bg-red-500/20 text-red-400" }
];

export default function CategorySelector({
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Category
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-600">
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Difficulty
        </label>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {difficultyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-600">
                <Badge className={`${option.color} border-0`}>
                  {option.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}