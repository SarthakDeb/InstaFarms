import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as userService from '../../api/userService';
import Button from '../common/Button';
import UserAvatar from './UserAvatar';
import { Users, UserPlus, UserMinus, CalendarDays, Mail, Phone, MapPin, Star, Sparkles } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { motion } from 'framer-motion';

const UserCard = ({ user, onFollowUpdate, viewMode = 'grid' }) => {
  const { currentUser, refreshBackendUser } = useAuth();
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  if (!user) return null;

  const isLoggedInUser = currentUser && currentUser.id === user.id;
  const isFollowing = currentUser?.following_list?.some(followedUser => followedUser.id === user.id);

  const handleFollowToggle = async () => {
    if (!currentUser || isLoggedInUser) return;
    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(currentUser.id, user.id);
      } else {
        await userService.followUser(currentUser.id, user.id);
      }
      await refreshBackendUser(); 
      if (onFollowUpdate) onFollowUpdate(user.id, !isFollowing);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
    setIsLoadingFollow(false);
  };

  // Random gradient for each card based on user ID
  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red-500',
    'from-teal-400 to-cyan-500',
    'from-indigo-400 to-purple-500'
  ];
  const gradient = gradients[user.id % gradients.length];

  if (viewMode === 'list') {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className={`h-3 bg-gradient-to-r ${gradient}`}></div>
        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <UserAvatar src={user.profile_image_url} name={user.name} size="lg" />
              {isLoggedInUser && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Star className="w-3 h-3 text-white" fill="currentColor" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                {isLoggedInUser && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                  <span>Age: {user.age !== null && user.age !== undefined ? `${user.age} yrs` : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex gap-6 text-center">
                <div className="bg-gray-50 rounded-lg p-3 min-w-[70px]">
                  <p className="text-lg font-bold text-gray-800">{user.followers_count || 0}</p>
                  <p className="text-xs text-gray-500 font-medium">Followers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 min-w-[70px]">
                  <p className="text-lg font-bold text-gray-800">{user.following_count || 0}</p>
                  <p className="text-xs text-gray-500 font-medium">Following</p>
                </div>
              </div>

              {currentUser && !isLoggedInUser && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? 'outline' : 'emerald'}
                  size="md"
                  isLoading={isLoadingFollow}
                  disabled={isLoadingFollow}
                  className="whitespace-nowrap"
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Gradient Header */}
      <div className={`h-20 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-3 right-3">
          {isLoggedInUser ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Star className="w-4 h-4 text-white" fill="currentColor" />
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative px-6 pb-6 pt-2">
        {/* Avatar */}
        <div className="flex justify-center -mt-10 mb-4">
          <div className="relative">
            <UserAvatar src={user.profile_image_url} name={user.name} size="xl" />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
              <div className={`w-3 h-3 bg-gradient-to-r ${gradient} rounded-full`}></div>
            </div>
          </div>
        </div>

        {/* Name and Badge */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
            {isLoggedInUser && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                You
              </span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-emerald-500" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 text-purple-500" />
            <span>Age: {user.age !== null && user.age !== undefined ? `${user.age} yrs` : 'N/A'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center bg-gray-50 rounded-xl p-3 flex-1">
            <p className="text-lg font-bold text-gray-800">{user.followers_count || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Followers</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl p-3 flex-1">
            <p className="text-lg font-bold text-gray-800">{user.following_count || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Following</p>
          </div>
        </div>

        {/* Follow Button */}
        {currentUser && !isLoggedInUser && (
          <Button
            onClick={handleFollowToggle}
            variant={isFollowing ? 'outline' : 'emerald'}
            size="md"
            className="w-full group-hover:shadow-lg transition-all"
            isLoading={isLoadingFollow}
            disabled={isLoadingFollow}
          >
            {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default UserCard;