import prisma from '../config/prisma.js';

export const getProfile = async (req, res) => {
  try {
    // Currently we identify the user by a simple "Admin" find or email from body
    // In a real app we'd use req.user from auth middleware
    const user = await prisma.user.findFirst(); 
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('[GET_PROFILE_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, email, avatar }
    });

    const { password, ...safeUser } = updated;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
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
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('[UPDATE_PASSWORD_ERROR]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
