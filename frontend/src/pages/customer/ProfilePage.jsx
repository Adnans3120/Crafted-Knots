import { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, Key, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../services/api';
import './CustomerAccount.css';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoadingPass(true);
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoadingPass(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.addAddress(newAddress);
      updateUser(res.data.user);
      toast.success('Address added to your account!');
      setShowAddAddressModal(false);
      setNewAddress({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await authAPI.deleteAddress(addressId);
      updateUser(res.data.user);
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="account-page container">
      <div className="profile-header-row">
        <div>
          <h1 className="page-title">My Account</h1>
          <p className="user-email-text">{user?.email}</p>
        </div>
        <button className="btn btn-outline btn-sm danger-btn" onClick={logout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="profile-grid">
        {/* Profile Info Form */}
        <div className="profile-card">
          <h3><User size={18} /> Personal Details</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loadingProfile} className="btn btn-primary btn-sm">
              {loadingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="profile-card">
          <h3><Key size={18} /> Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loadingPass} className="btn btn-secondary btn-sm">
              {loadingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Address Book Section */}
      <div className="address-book-section">
        <div className="section-header">
          <h3><MapPin size={20} /> Saved Delivery Addresses</h3>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddAddressModal(true)}>
            <Plus size={16} /> Add New Address
          </button>
        </div>

        {user?.addresses && user.addresses.length > 0 ? (
          <div className="address-grid">
            {user.addresses.map((addr) => (
              <div key={addr._id} className="address-card">
                <div className="address-card-header">
                  <strong>{addr.fullName || user.name}</strong>
                  <button onClick={() => handleDeleteAddress(addr._id)} className="delete-addr-btn">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p>{addr.street}</p>
                {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <span className="addr-phone">📞 {addr.phone}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-addresses-text">No saved addresses found. Add an address for faster checkout!</p>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add New Delivery Address</h3>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Street / House No *</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
