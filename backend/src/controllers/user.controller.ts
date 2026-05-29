import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

// Create a new user (for OWNER only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (restricted to OWNER usually via middleware)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user's role/name
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'OWNER' && role && role !== 'OWNER') {
      return res.status(403).json({ error: 'Cannot change the role of an OWNER account' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
      },
    });

    res.json({
      success: true,
      user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'OWNER') {
      return res.status(403).json({ error: 'Cannot delete an OWNER account' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
