export type UserRole = 'ADMIN' | 'HOD' | 'STAFF';
export type LeaveType = 'CASUAL' | 'SICK' | 'DUTY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export interface Employee {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  dateOfJoining: string;
  avatarUrl?: string;
}

export interface Attendance {
  id?: string;
  empId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO string
  checkOut?: string; // ISO string
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id?: string;
  empId: string;
  empName?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  hodComment?: string;
  department: string;
  createdAt: string;
}

export interface LeaveBalance {
  empId: string;
  casual: number;
  sick: number;
  duty: number;
}
