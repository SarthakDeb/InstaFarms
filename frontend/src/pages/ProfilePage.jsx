import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import UserAvatar from '../components/user/UserAvatar';
import Button from '../components/common/Button';
import ProfileEditModal from '../components/user/ProfileEditModal';
import { Mail, Phone, CalendarDays, Users, UserCheck, Edit3, ShieldCheck, Sparkles, Award, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { currentUser, loading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Spinner size="lg" />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-emerald-600 font-semibold text-lg"
          >
            Loading your profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-600 mb-2">Access Denied</h3>
          <p className="text-red-500">Please log in or complete your profile to view this page.</p>
        </motion.div>
      </div>
    );
  }

  const StatItem = ({ icon, label, value, gradient }) => (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {icon}
          <Sparkles className="w-5 h-5 text-white/70" />
        </div>
        <div className="space-y-1">
          <p className="text-white/80 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  const ContactItem = ({ icon, text, color }) => (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <span className="text-gray-700 font-medium">{text}</span>
    </motion.div>
  );

  const FollowItem = ({ user, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <UserAvatar src={user.profile_image_url} name={user.name} size="sm" />
      <span className="text-gray-800 font-medium flex-1 truncate">{user.name}</span>
      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
    </motion.div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-16 px-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="container mx-auto relative z-10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50 scale-110"></div>
                <UserAvatar 
                  src={currentUser.profile_image_url} 
                  name={currentUser.name} 
                  size="xl" 
                  className="relative z-10 ring-4 ring-white/30 shadow-2xl"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                  <Star className="w-4 h-4 text-white" fill="currentColor" />
                </div>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left text-white">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-4"
                >
                  <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{currentUser.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Award className="w-5 h-5 text-yellow-300" />
                      <span className="font-semibold">Premium Member</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="space-y-3"
                >
                  <ContactItem 
                    icon={<Mail className="w-5 h-5 text-emerald-600" />}
                    text={currentUser.email}
                    color="bg-emerald-100"
                  />
                  {currentUser.phone && (
                    <ContactItem 
                      icon={<Phone className="w-5 h-5 text-blue-600" />}
                      text={currentUser.phone}
                      color="bg-blue-100"
                    />
                  )}
                  {currentUser.age && (
                    <ContactItem 
                      icon={<CalendarDays className="w-5 h-5 text-purple-600" />}
                      text={`${currentUser.age} years old`}
                      color="bg-purple-100"
                    />
                  )}
                </motion.div>
              </div>

              {/* Edit Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button 
                  onClick={() => setIsEditModalOpen(true)} 
                  variant="outline"
                  className="bg-white text-emerald-600 border-white hover:bg-emerald-50 shadow-lg whitespace-nowrap"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <StatItem 
              icon={<Users className="w-8 h-8 text-white" />}
              label="Followers"
              value={currentUser.followers_count || 0}
              gradient="from-blue-500 to-purple-600"
            />
            <StatItem 
              icon={<UserCheck className="w-8 h-8 text-white" />}
              label="Following"
              value={currentUser.following_count || 0}
              gradient="from-emerald-500 to-teal-600"
            />
          </div>

          {/* Following/Followers Lists */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Following */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">People I Follow</h3>
                      <p className="text-emerald-100">({currentUser.following_list?.length || 0} connections)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {currentUser.following_list && currentUser.following_list.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {currentUser.following_list.slice(0, 10).map((followed, index) => (
                        <FollowItem key={followed.id} user={followed} index={index} />
                      ))}
                      {currentUser.following_list.length > 10 && (
                        <div className="text-center py-3">
                          <span className="text-gray-500 font-medium">
                            +{currentUser.following_list.length - 10} more connections
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 italic">You're not following anyone yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Followers */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">My Followers</h3>
                      <p className="text-blue-100">({currentUser.followers_list?.length || 0} supporters)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {currentUser.followers_list && currentUser.followers_list.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {currentUser.followers_list.slice(0, 10).map((follower, index) => (
                        <FollowItem key={follower.id} user={follower} index={index} />
                      ))}
                      {currentUser.followers_list.length > 10 && (
                        <div className="text-center py-3">
                          <span className="text-gray-500 font-medium">
                            +{currentUser.followers_list.length - 10} more supporters
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 italic">No one is following you yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </>
  );
};

export default ProfilePage;