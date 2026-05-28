import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Database (In-Memory for Preview) ---
  const employees = [
    { uid: '1', name: 'Dr. Sarah Connor', email: 'sarah@college.edu', role: 'HOD', department: 'Computer Science', dateOfJoining: '2020-01-15' },
    { uid: '2', name: 'James Doe', email: 'james@college.edu', role: 'STAFF', department: 'Computer Science', dateOfJoining: '2022-03-20' }
  ];

  let attendance = [
    { id: '1', empId: '1', date: '2024-05-17', checkIn: '2024-05-17T09:00:00Z', checkOut: '2024-05-17T17:00:00Z', status: 'PRESENT' }
  ];

  let leaveRequests = [
    { id: '1', empId: '2', empName: 'James Doe', type: 'CASUAL', startDate: '2024-06-01', endDate: '2024-06-03', reason: 'Family event', status: 'PENDING', department: 'Computer Science', createdAt: new Date().toISOString() }
  ];

  let leaveBalances = {
    '1': { empId: '1', casual: 10, sick: 12, duty: 5 },
    '2': { empId: '2', casual: 12, sick: 10, duty: 5 }
  };

  // --- API Routes ---

  // Auth Mock
  app.get('/api/auth/profile', (req, res) => {
    // For preview, we'll default to HOD for demonstration
    res.json(employees[0]);
  });

  // Attendance
  app.get('/api/attendance', (req, res) => {
    const { empId, date } = req.query;
    let filtered = attendance;
    if (empId) filtered = filtered.filter(a => a.empId === empId);
    if (date) filtered = filtered.filter(a => a.date === date);
    res.json(filtered.sort((a, b) => b.date.localeCompare(a.date)));
  });

  app.post('/api/attendance/check-in', (req, res) => {
    const record = { id: Date.now().toString(), ...req.body };
    attendance.push(record);
    res.json(record);
  });

  app.patch('/api/attendance/:id', (req, res) => {
    const { id } = req.params;
    const index = attendance.findIndex(a => a.id === id);
    if (index !== -1) {
      attendance[index] = { ...attendance[index], ...req.body };
      res.json(attendance[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // Leaves
  app.get('/api/leaves', (req, res) => {
    const { empId, status, department } = req.query;
    let filtered = leaveRequests;
    if (empId) filtered = filtered.filter(l => l.empId === empId);
    if (status) filtered = filtered.filter(l => l.status === status);
    if (department) filtered = filtered.filter(l => l.department === department);
    res.json(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });

  app.post('/api/leaves', (req, res) => {
    const request = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
    leaveRequests.push(request);
    res.json(request);
  });

  app.patch('/api/leaves/:id', (req, res) => {
    const { id } = req.params;
    const index = leaveRequests.findIndex(l => l.id === id);
    if (index !== -1) {
      leaveRequests[index] = { ...leaveRequests[index], ...req.body };
      res.json(leaveRequests[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.get('/api/leaves/balance/:empId', (req, res) => {
    const { empId } = req.params;
    res.json(leaveBalances[empId as keyof typeof leaveBalances] || { empId, casual: 12, sick: 10, duty: 5 });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
