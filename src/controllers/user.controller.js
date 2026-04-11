import prisma from '../config/prisma.js';
<<<<<<< HEAD
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (password === user.password) {
        // Migration logic: User still has plain text password
        console.log('[LOGIN]: Migrating plain text password to hashed...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, data: safeUser });
  } catch (error) {
    console.error('[LOGIN_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { password: _, ...safeUser } = user;
=======

export const getProfile = async (req, res) => {
  try {
    // Currently we identify the user by a simple "Admin" find or email from body
    // In a real app we'd use req.user from auth middleware
    const user = await prisma.user.findFirst(); 
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { password, ...safeUser } = user;
>>>>>>> b48dc082e40dd9b1b7d7ec9df2470b0d2555a3eb
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('[GET_PROFILE_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
<<<<<<< HEAD
    console.log('[UPDATE_PROFILE]: Received name:', name, 'email:', email, 'avatar exists:', !!avatar);
    
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, avatar }
    });

    const { password: _, ...safeUser } = updated;
=======
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, email, avatar }
    });

    const { password, ...safeUser } = updated;
>>>>>>> b48dc082e40dd9b1b7d7ec9df2470b0d2555a3eb
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
<<<<<<< HEAD
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch && oldPassword !== user.password) {
      return res.status(400).json({ success: false, error: 'Invalid old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
=======
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Direct comparison for now as per current simple state, 
    // but we can add hashing later if requested.
    if (user.password !== oldPassword) {
      return res.status(400).json({ success: false, error: 'Invalid old password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword }
>>>>>>> b48dc082e40dd9b1b7d7ec9df2470b0d2555a3eb
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('[UPDATE_PASSWORD_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
