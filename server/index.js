import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safenest';

// Improved MongoDB connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increase timeout
      socketTimeoutMS: 45000, // Increase socket timeout
    });
    
    console.log(' Connected to MongoDB');
    // Initialize default users after successful connection
    initializeDefaultUsers().catch(err => console.error(' Error initializing default users:', err));
  } catch (err) {
    console.error(' MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start connection process
connectWithRetry();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'subadmin', 'mainadmin'], required: true },
  department: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  updatedAt: { type: Date, default: Date.now }
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved', 'rejected'], default: 'pending' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String },
  remarks: { type: String },
  attachments: [{ type: String }],
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['assignment', 'status', 'general'], default: 'general' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'safenest_jwt_secret_key_2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Initialize default admin user
const initializeDefaultUsers = async () => {
  try {
    // Check if main admin exists
    const mainAdmin = await User.findOne({ email: 'admin@safenest.com' });
    if (!mainAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Main Administrator',
        email: 'admin@safenest.com',
        password: hashedPassword,
        role: 'mainadmin',
        isActive: true
      });
      console.log(' Default main admin created');
    }

    // Create default sub-admins for all departments
    const departments = [
      'Information Technology', 'Computer Science', 'Civil Engineering', 'Electronics',
      'Mechanical', 'Chemical', 'Electrical', 'Biotechnology', 'MBA', 'Hostel',
      'Library', 'Canteen', 'Sports', 'Transport', 'Administration', 'Physics',
      'Mathematics', 'Chemistry', 'English', 'Other'
    ];

    for (const dept of departments) {
      // Create proper email format for different departments
      let email;
      if (dept === 'Information Technology') {
        email = 'it-admin@safenest.com';
      } else if (dept === 'Computer Science') {
        email = 'cs-admin@safenest.com';
      } else if (dept === 'Civil Engineering') {
        email = 'civil-admin@safenest.com';
      } else {
        email = `${dept.toLowerCase().replace(/\s+/g, '.')}.admin@safenest.com`;
      }
      
      const existingAdmin = await User.findOne({ email });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
          name: `${dept} Department Admin`,
          email: email,
          password: hashedPassword,
          role: 'subadmin',
          department: dept,
          isActive: true
        });
      }
    }
    console.log(' Default sub-admins initialized');

    // Create sample students
    const sampleStudents = [
      { name: 'John Student', email: 'student@safenest.com' },
      { name: 'Sarah Wilson', email: 'sarah@safenest.com' },
      { name: 'Mike Chen', email: 'mike@safenest.com' }
    ];

    for (const student of sampleStudents) {
      const existingStudent = await User.findOne({ email: student.email });
      if (!existingStudent) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
          name: student.name,
          email: student.email,
          password: hashedPassword,
          role: 'student',
          isActive: true
        });
      }
    }
    console.log(' Sample students created');

  } catch (error) {
    console.error(' Error initializing default users:', error);
  }
};

// Routes

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('User found:', user.email, user.role, user.department);
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.password;
    
    console.log('Login successful for:', user.name, user.role, user.department);
    
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department: role === 'subadmin' ? department : undefined,
      isActive: true
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email, 
        role: newUser.role,
        department: newUser.department 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin
    };

    res.status(201).json({
      message: 'Registration successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Sub Admin Route (Main Admin Only)
app.post('/api/admin/create-subadmin', authenticateToken, async (req, res) => {
  try {
    // Check if user is main admin
    if (req.user.role !== 'mainadmin') {
      return res.status(403).json({ message: 'Access denied. Main admin only.' });
    }

    const { name, email, password, department } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new sub admin
    const newSubAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'subadmin',
      department,
      isActive: true
    });

    await newSubAdmin.save();

    // Return sub admin data (excluding password)
    const subAdminData = {
      _id: newSubAdmin._id,
      name: newSubAdmin.name,
      email: newSubAdmin.email,
      role: newSubAdmin.role,
      department: newSubAdmin.department,
      isActive: newSubAdmin.isActive,
      createdAt: newSubAdmin.createdAt
    };

    res.status(201).json({
      message: 'Sub admin created successfully',
      subAdmin: subAdminData
    });

  } catch (error) {
    console.error('Create sub admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get All Users Route (Admin Only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mainadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Sub Admins Route (Main Admin Only)
app.get('/api/admin/subadmins', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mainadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const subAdmins = await User.find({ role: 'subadmin' }, '-password').sort({ createdAt: -1 });
    res.json(subAdmins);

  } catch (error) {
    console.error('Get sub admins error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit Complaint Route
app.post('/api/complaints', authenticateToken, async (req, res) => {
  try {
    const { title, description, department, category, priority } = req.body;

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new complaint
    const newComplaint = new Complaint({
      title,
      description,
      department,
      category,
      priority,
      studentId: user._id,
      studentName: user.name,
      studentEmail: user.email,
      status: 'pending'
    });

    await newComplaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: newComplaint
    });

  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Complaints Route
app.get('/api/complaints', authenticateToken, async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'student') {
      query.studentId = req.user.userId;
    } else if (req.user.role === 'subadmin') {
      query.department = req.user.department;
    }
    // Main admin can see all complaints (no filter)

    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 });

    res.json(complaints);

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Complaint Status Route
app.put('/api/complaints/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Check if user has permission to update
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Students cannot update complaint status' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Main admin cannot mark complaints as resolved directly - must assign to subadmin first
    if (req.user.role === 'mainadmin' && status === 'resolved') {
      return res.status(403).json({ message: 'Main admin must assign complaint to sub-admin first. Only sub-admins can mark complaints as resolved.' });
    }

    // Sub-admins can only update complaints in their department
    if (req.user.role === 'subadmin' && complaint.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Require remarks when sub-admin updates to in-progress or resolved
    if (req.user.role === 'subadmin' && (status === 'in-progress' || status === 'resolved') && !remarks) {
      return res.status(400).json({ message: 'Please provide remarks when updating complaint status.' });
    }

    // Update complaint
    complaint.status = status;
    complaint.updatedAt = new Date();
    
    if (remarks) {
      complaint.remarks = remarks;
    }
    
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      if (!remarks) {
        complaint.remarks = `Issue resolved by ${req.user.role === 'mainadmin' ? 'Main Admin' : 'Department Admin'}`;
      }
    }

    await complaint.save();

    // Emit notifications
    try {
      // Notify student about status change
      await Notification.create({
        userId: complaint.studentId,
        type: 'status',
        title: `Complaint ${status.replace('-', ' ')}`,
        message: remarks || `Your complaint "${complaint.title}" was marked as ${status}.`,
        complaintId: complaint._id
      });
      // If subadmin updated, you could also notify main admin if needed (optional)
    } catch (e) {
      console.warn('Notification create error (status update):', e.message);
    }

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign Complaint Route (Main Admin Only)
app.put('/api/complaints/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { subAdminId, remarks } = req.body;

    // Only main admin can assign complaints
    if (req.user.role !== 'mainadmin') {
      return res.status(403).json({ message: 'Only main admin can assign complaints' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const subAdmin = await User.findById(subAdminId);
    if (!subAdmin || subAdmin.role !== 'subadmin') {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    // Update complaint assignment
    complaint.assignedTo = subAdminId;
    complaint.assignedToName = subAdmin.name;
    // Keep status as pending until sub-admin explicitly starts progress
    complaint.updatedAt = new Date();
    complaint.remarks = remarks || `Assigned to ${subAdmin.name} (${subAdmin.department})`;

    await complaint.save();

    // Emit notifications
    try {
      // Notify subadmin about assignment
      await Notification.create({
        userId: subAdminId,
        type: 'assignment',
        title: 'New Complaint Assigned',
        message: `You have been assigned complaint "${complaint.title}" from ${complaint.department}. Please start progress when you begin work.`,
        complaintId: complaint._id
      });
      // Notify student that their complaint was assigned
      await Notification.create({
        userId: complaint.studentId,
        type: 'assignment',
        title: 'Complaint Assigned',
        message: `Your complaint "${complaint.title}" was assigned to ${subAdmin.name}.`,
        complaintId: complaint._id
      });
    } catch (e) {
      console.warn('Notification create error (assign):', e.message);
    }

    res.json({
      message: 'Complaint assigned successfully',
      complaint
    });

  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Notifications Routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const onlyUnread = (req.query.onlyUnread ?? 'true') === 'true';
    const filter = { userId: req.user.userId };
    if (onlyUnread) filter.read = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, userId: req.user.userId });
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notif.read = true;
    await notif.save();
    res.json({ message: 'Notification marked as read', notification: notif });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Dashboard Stats Route
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'student') {
      query.studentId = req.user.userId;
    } else if (req.user.role === 'subadmin') {
      query.department = req.user.department;
    }

    const totalComplaints = await Complaint.countDocuments(query);
    const pendingComplaints = await Complaint.countDocuments({ ...query, status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ ...query, status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ ...query, status: 'resolved' });
    const rejectedComplaints = await Complaint.countDocuments({ ...query, status: 'rejected' });

    let additionalStats = {};

    if (req.user.role === 'mainadmin') {
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalSubAdmins = await User.countDocuments({ role: 'subadmin' });

      additionalStats = {
        totalUsers,
        totalStudents,
        totalSubAdmins
      };
    }

    res.json({
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      rejectedComplaints,
      ...additionalStats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SafeNest API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(` SafeNest API Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});

export { app };