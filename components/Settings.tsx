import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, User, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Settings: React.FC = () => {
  const { logout, resetToDemoData, properties, units, tenants, payments, expenses, maintenanceTickets } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
       setStatus('error');
       setMessage('Password must be at least 4 characters long.');
       return;
    }

    try {
      const token = localStorage.getItem('propMinds_token');
      const res = await fetch('http://localhost:3001/api/auth/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newUsername, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to update credentials.');
        return;
      }

      setStatus('success');
      setMessage('Credentials updated successfully! You will need to use these on your next login.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setMessage('Network error while updating credentials.');
    }
  };

  return (
