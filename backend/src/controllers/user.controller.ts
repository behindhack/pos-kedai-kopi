import { Request, Response } from 'express';
import User from '../models/User';

// Get all users (restricted to OWNER usually via middleware)
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Return all users, exclude the hashed passwords
    const users = await User.find().select('-passwordHash');
    
    // Map _id to id so it matches frontend interface perfectly
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt
    }));

    res.json(formattedUsers);
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

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'OWNER' && role && role !== 'OWNER') {
      return res.status(403).json({ error: 'Cannot change the role of an OWNER account' });
    }

    user.name = name || user.name;
    user.role = role || user.role;

    await user.save();

    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'OWNER') {
      return res.status(403).json({ error: 'Cannot delete an OWNER account' });
    }

    await User.findByIdAndDelete(id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
