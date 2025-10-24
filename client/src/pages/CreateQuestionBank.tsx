import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { questionBankAPI } from '../services/api';
import QuestionEditor from '../components/QuestionEditor';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

const CreateQuestionBank: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 20,
      points: 1000
    }
  ]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bankId, setBankId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setEditMode(true);
      setBankId(editId);
      fetchQuestionBank(editId);
    }
  }, [searchParams]);

  const fetchQuestionBank = async (id: string) => {
    try {
      const bank = await questionBankAPI.getById(id);
      setTitle(bank.title);
      setDescription(bank.description);
      setQuestions(bank.questions);
      setIsPublic(bank.isPublic);
    } catch (error) {
      console.error('Failed to fetch question bank:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 20,
      points: 1000
    }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    
    if (field.startsWith('options.')) {
      const optIndex = parseInt(field.split('.')[1]);
      updatedQuestions[index].options[optIndex] = value;
    } else if (field === 'options') {
      updatedQuestions[index].options = value;
    } else {
      (updatedQuestions[index] as any)[field] = value;
    }
    
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = { ...questions[index] };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, { ...questionToDuplicate });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && bankId) {
        await questionBankAPI.update(bankId, {
          title,
          description,
          questions,
          isPublic,
          tags: []
        });
      } else {
        await questionBankAPI.create({
          title,
          description,
          questions,
          isPublic,
          tags: []
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save question bank:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">
            {editMode ? 'Edit Question Bank' : 'Create Question Bank'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Make this question bank public</label>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Questions</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={index}
                    question={question}
                    index={index}
                    onChange={updateQuestion}
                    onRemove={removeQuestion}
                    onDuplicate={duplicateQuestion}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || questions.length === 0}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 text-lg font-semibold"
            >
              {loading ? 'Saving...' : (editMode ? 'Update Question Bank' : 'Create Question Bank')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionBank;