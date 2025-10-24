import { IGameSession } from '../models/GameSession';
import { IQuestionBank } from '../models/QuestionBank';

export class ExportUtils {
  static exportGameToCSV(gameSession: IGameSession): string {
    const headers = ['Player', 'Score', 'Correct Answers', 'Total Questions', 'Accuracy'];
    const rows = gameSession.players
      .sort((a, b) => b.score - a.score)
      .map(player => {
        const correctAnswers = Array.from(player.answers.values()).filter(a => a.isCorrect).length;
        const totalQuestions = gameSession.questionBank.questions.length;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : '0';
        
        return [
          player.username,
          player.score.toString(),
          correctAnswers.toString(),
          totalQuestions.toString(),
          accuracy
        ];
      });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static exportQuestionBankToJSON(questionBank: IQuestionBank): string {
    const exportData = {
      title: questionBank.title,
      description: questionBank.description,
      questions: questionBank.questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        timeLimit: q.timeLimit,
        points: q.points
      })),
      exportDate: new Date().toISOString(),
      totalQuestions: questionBank.questions.length
    };

    return JSON.stringify(exportData, null, 2);
  }

  static importQuestionsFromJSON(jsonData: string): any[] {
    try {
      const data = JSON.parse(jsonData);
      return data.questions || [];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }
}