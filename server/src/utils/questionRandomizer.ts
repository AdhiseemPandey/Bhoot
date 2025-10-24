export class QuestionRandomizer {
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static selectRandomQuestions(questions: any[], count: number): any[] {
    if (questions.length <= count) {
      return this.shuffleArray(questions);
    }
    
    const shuffled = this.shuffleArray(questions);
    return shuffled.slice(0, count);
  }

  static shuffleOptions(questions: any[]): any[] {
    return questions.map(question => {
      const optionsWithIndex = question.options.map((option: string, index: number) => ({
        option,
        originalIndex: index
      }));
      
      const shuffledOptions = this.shuffleArray(optionsWithIndex);
      const correctAnswerIndex = shuffledOptions.findIndex(
        opt => opt.originalIndex === question.correctAnswer
      );

      return {
        ...question,
        options: shuffledOptions.map(opt => opt.option),
        correctAnswer: correctAnswerIndex
      };
    });
  }
}