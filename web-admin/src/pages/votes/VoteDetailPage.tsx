import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Award,
  User,
  Mail,
  UserCheck,
  UserX
} from 'lucide-react';

interface VoteOption {
  id: string;
  text: string;
  voteCount: number;
}

interface Voter {
  id: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatar?: string;
  };
  optionId: string;
  createdAt: string;
}

interface VoteDetail {
  id: string;
  title: string;
  description?: string;
  voteType: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isLive: boolean;
  totalVotes: number;
  options: VoteOption[];
  voters?: Voter[];
}

export default function VoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { data: vote, isLoading } = useQuery({
    queryKey: ['vote', id],
    queryFn: async () => {
      const { data } = await api.get(`/votes/${id}`);
      return data.data as VoteDetail;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="text-gray-600 font-medium">Loading vote details...</span>
        </div>
      </div>
    );
  }

  if (!vote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Not Found</h2>
          <p className="text-gray-600 mb-6">The vote you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/votes')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700"
          >
            Back to Votes
          </button>
        </div>
      </div>
    );
  }

  const totalVotes = vote.totalVotes || 0;
  const sortedOptions = [...vote.options].sort((a, b) => b.voteCount - a.voteCount);
  const winningOption = sortedOptions[0];
  
  // Filter voters by selected option
  const filteredVoters = selectedOption 
    ? vote.voters?.filter(v => v.optionId === selectedOption) 
    : vote.voters;

  // Calculate participation stats
  const uniqueVoters = new Set(vote.voters?.map(v => v.user.id) || []).size;
  
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/votes')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vote.title}</h1>
          <p className="text-gray-500 mt-1">Detailed vote analytics and results</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Votes */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 size={24} />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              Total
            </span>
          </div>
          <h3 className="text-4xl font-bold mb-1">{totalVotes}</h3>
          <p className="text-indigo-100 text-sm font-medium">Total Votes Cast</p>
        </div>

        {/* Unique Voters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
              Unique
            </span>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1">{uniqueVoters}</h3>
          <p className="text-gray-500 text-sm font-medium">Unique Voters</p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${vote.isActive ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {vote.isActive ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${vote.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {vote.isLive ? 'Live' : 'Not Live'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {vote.isActive ? 'Active' : 'Ended'}
          </h3>
          <p className="text-gray-500 text-sm font-medium">Vote Status</p>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl">
              <Clock size={24} />
            </div>
            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
              {vote.voteType.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {new Date(vote.endsAt).toLocaleDateString()}
          </h3>
          <p className="text-gray-500 text-sm font-medium">End Date</p>
        </div>
      </div>

      {/* Vote Description */}
      {vote.description && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed">{vote.description}</p>
        </div>
      )}

      {/* Results & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Results */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vote Results</h2>
            <Award size={24} className="text-yellow-500" />
          </div>
          
          <div className="space-y-4">
            {sortedOptions.map((option, index) => {
              const percentage = totalVotes > 0 ? ((option.voteCount / totalVotes) * 100).toFixed(1) : '0.0';
              const isWinner = index === 0 && totalVotes > 0;
              
              return (
                <div
                  key={option.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isWinner 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                      : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isWinner && (
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Award size={16} className="text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className={`font-bold text-sm ${isWinner ? 'text-gray-900' : 'text-gray-800'}`}>
                          {option.text}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${isWinner ? 'text-yellow-700' : 'text-gray-600'}`}>
                      <span className="text-2xl font-bold">{percentage}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {selectedOption === option.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-indigo-600">
                        Click on a voter below to filter by this option
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vote Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vote Timeline</h2>
            <Calendar size={24} className="text-indigo-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Start Date</h3>
                <p className="text-sm text-gray-600">
                  {new Date(vote.startsAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                vote.isActive ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                <Clock size={24} className={vote.isActive ? 'text-orange-600' : 'text-red-600'} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">End Date</h3>
                <p className="text-sm text-gray-600">
                  {new Date(vote.endsAt).toLocaleString()}
                </p>
                {vote.isActive && (
                  <p className="text-xs text-orange-600 font-semibold mt-1">
                    Vote is currently active
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Participation Rate</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (totalVotes / Math.max(1, totalVotes)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{totalVotes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voters List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Voters List</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedOption 
                  ? `Showing voters for selected option (${filteredVoters?.length || 0})`
                  : `All voters (${vote.voters?.length || 0})`
                }
              </p>
            </div>
            {selectedOption && (
              <button
                onClick={() => setSelectedOption(null)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Show All
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Voter
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Option Selected
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Voted At
                </th>
              </tr>
            </thead>
            <tbody>
              {!filteredVoters || filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <UserX size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No voters yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedOption 
                        ? 'No one has voted for this option'
                        : 'Be the first to vote!'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter) => {
                  const option = vote.options.find(o => o.id === voter.optionId);
                  
                  return (
                    <tr key={voter.id} className="border-t border-gray-100 hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {voter.user.avatar ? (
                            <img
                              src={voter.user.avatar}
                              alt={voter.user.fullName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User size={20} className="text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {voter.user.fullName}
                            </p>
                            <p className="text-xs text-gray-500">@{voter.user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {voter.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200">
                          <CheckCircle size={12} />
                          {option?.text || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(voter.createdAt).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredVoters && filteredVoters.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Total: <span className="text-indigo-600 font-bold">{filteredVoters.length}</span> voter{filteredVoters.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <UserCheck size={14} />
                <span>Click on options above to filter voters</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
