import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Trophy, Medal, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/leaderboard', { params: { period: 'WEEKLY', limit: 50 } });
      return data.data;
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={28} className="text-yellow-500 drop-shadow-lg" />;
    if (rank === 2) return <Medal size={28} className="text-gray-400 drop-shadow-lg" />;
    if (rank === 3) return <Medal size={28} className="text-orange-600 drop-shadow-lg" />;
    return <span className="w-8 text-center text-gray-400 text-sm font-bold">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-l-4 border-yellow-500';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-l-4 border-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-l-4 border-orange-500';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 mt-1">Top performing community members</p>
        </div>
        <select className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm">
          <option>📅 Weekly</option>
          <option>📆 Monthly</option>
          <option>🏆 All Time</option>
        </select>
      </div>

      {/* Top 3 Podium */}
      {!isLoading && data?.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg flex flex-col items-center transform hover:scale-105 transition-all">
            <Medal size={40} className="text-gray-400 mb-3" />
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-xl">
              {data[1]?.user?.fullName?.charAt(0) || '?'}
            </div>
            <h3 className="font-bold text-gray-900 text-center">{data[1]?.user?.fullName}</h3>
            <p className="text-xs text-gray-500 mb-2">@{data[1]?.user?.username}</p>
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-2xl font-bold text-gray-700">{data[1]?.score}</span>
              <span className="text-xs text-gray-500 ml-1">pts</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-300 shadow-2xl flex flex-col items-center transform hover:scale-105 transition-all -mt-4">
            <Trophy size={48} className="text-yellow-500 mb-3 animate-pulse" />
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-2xl ring-4 ring-yellow-200">
              {data[0]?.user?.fullName?.charAt(0) || '?'}
            </div>
            <h3 className="font-bold text-gray-900 text-center text-lg">{data[0]?.user?.fullName}</h3>
            <p className="text-xs text-gray-600 mb-3">@{data[0]?.user?.username}</p>
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2.5 rounded-full shadow-lg">
              <span className="text-3xl font-bold text-white">{data[0]?.score}</span>
              <span className="text-xs text-yellow-100 ml-1">pts</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-white rounded-2xl p-6 border-2 border-orange-300 shadow-lg flex flex-col items-center transform hover:scale-105 transition-all">
            <Medal size={40} className="text-orange-600 mb-3" />
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-xl">
              {data[2]?.user?.fullName?.charAt(0) || '?'}
            </div>
            <h3 className="font-bold text-gray-900 text-center">{data[2]?.user?.fullName}</h3>
            <p className="text-xs text-gray-500 mb-2">@{data[2]?.user?.username}</p>
            <div className="bg-orange-100 px-4 py-2 rounded-full">
              <span className="text-2xl font-bold text-orange-700">{data[2]?.score}</span>
              <span className="text-xs text-orange-500 ml-1">pts</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              Loading leaderboard...
            </div>
          </div>
        ) : (
          <div>
            {data?.map((entry: any, i: number) => (
              <div 
                key={entry.user?.id || i} 
                className={`flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-indigo-50/30 transition-all group ${getRankBg(entry.rank)}`}
              >
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform ${
                  entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                  entry.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  {entry.user?.fullName?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{entry.user?.fullName}</p>
                  <p className="text-xs text-gray-500 font-mono">@{entry.user?.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{entry.score}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Star size={12} className="text-yellow-500" /> points
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
