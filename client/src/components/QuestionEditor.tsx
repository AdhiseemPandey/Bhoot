import React, { useState } from 'react';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onChange,
  onRemove,
  onDuplicate
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleOptionChange = (optionIndex: number, value: string) => {
    onChange(index, `options.${optionIndex}`, value);
  };

  const handleAddOption = () => {
    if (question.options.length < 6) {
      const newOptions = [...question.options, ''];
      onChange(index, 'options', newOptions);
    }
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      onChange(index, 'options', newOptions);
      
      if (question.correctAnswer === optionIndex) {
        onChange(index, 'correctAnswer', 0);
      } else if (question.correctAnswer > optionIndex) {
        onChange(index, 'correctAnswer', question.correctAnswer - 1);
      }
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼' : '►'}
          </button>
          Question {index + 1}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onDuplicate(index)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Duplicate
          </button>
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={question.questionText}
              onChange={(e) => onChange(index, 'questionText', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              rows={3}
              placeholder="Enter your question here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correctAnswer === optionIndex}
                    onChange={() => onChange(index, 'correctAnswer', optionIndex)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optionIndex)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {question.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
              >
                + Add Option
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (seconds) *
              </label>
              <select
                value={question.timeLimit}
                onChange={(e) => onChange(index, 'timeLimit', parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              >
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points *
              </label>
              <select
                value={question.points}
                onChange={(e) => onChange(index, 'points', parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              >
                <option value={100}>100 points</option>
                <option value={500}>500 points</option>
                <option value={1000}>1000 points</option>
                <option value={2000}>2000 points</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer
              </label>
              <div className="p-2 bg-green-50 rounded-md border border-green-200">
                {question.options[question.correctAnswer] || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;