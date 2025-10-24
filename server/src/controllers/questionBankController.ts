import { Request, Response } from 'express';
import QuestionBank from '../models/QuestionBank';

export const createQuestionBank = async (req: Request, res: Response) => {
  try {
    const { title, description, questions, isPublic, tags } = req.body;
    const ownerId = (req as any).user.id;

    const questionBank = new QuestionBank({
      title,
      description,
      owner: ownerId,
      questions,
      isPublic,
      tags
    });

    await questionBank.save();
    res.status(201).json(questionBank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question bank' });
  }
};

export const getUserQuestionBanks = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user.id;
    const questionBanks = await QuestionBank.find({ owner: ownerId });
    res.json(questionBanks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question banks' });
  }
};

export const getQuestionBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionBank = await QuestionBank.findById(id);
    
    if (!questionBank) {
      return res.status(404).json({ error: 'Question bank not found' });
    }

    res.json(questionBank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question bank' });
  }
};

export const updateQuestionBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const questionBank = await QuestionBank.findOneAndUpdate(
      { _id: id, owner: (req as any).user.id },
      updateData,
      { new: true }
    );

    if (!questionBank) {
      return res.status(404).json({ error: 'Question bank not found' });
    }

    res.json(questionBank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question bank' });
  }
};

export const deleteQuestionBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const questionBank = await QuestionBank.findOneAndDelete({
      _id: id,
      owner: (req as any).user.id
    });

    if (!questionBank) {
      return res.status(404).json({ error: 'Question bank not found' });
    }

    res.json({ message: 'Question bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question bank' });
  }
};

export const getPublicQuestionBanks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { 
      isPublic: true,
      ...(search && { 
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    };

    const questionBanks = await QuestionBank.find(query)
      .populate('owner', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await QuestionBank.countDocuments(query);

    res.json({
      questionBanks,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public question banks' });
  }
};

export const duplicateQuestionBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const originalBank = await QuestionBank.findById(id);
    if (!originalBank) {
      return res.status(404).json({ error: 'Question bank not found' });
    }

    const duplicatedBank = new QuestionBank({
      title: `${originalBank.title} (Copy)`,
      description: originalBank.description,
      owner: userId,
      questions: originalBank.questions,
      isPublic: false,
      tags: originalBank.tags
    });

    await duplicatedBank.save();
    res.status(201).json(duplicatedBank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate question bank' });
  }
};