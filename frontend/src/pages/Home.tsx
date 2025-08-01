import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import { Room } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const Home: React.FC = () => {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.getRooms,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">방 목록을 불러오는데 실패했습니다.</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">
          일정 조율을 쉽고 빠르게
        </h1>
        <p className="text-xl mb-8 opacity-90">
          참여자들의 가능한 시간을 수집하고 최적의 시간을 찾아보세요
        </p>
        <Link to="/create" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          새 방 만들기
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold mb-2">시간 기준 조율</h3>
          <p className="text-gray-600">24시간 중 가능한 시간대를 선택하여 최적의 시간을 찾습니다</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">📅</div>
          <h3 className="text-lg font-semibold mb-2">날짜 기준 조율</h3>
          <p className="text-gray-600">여러 날짜 중 가능한 날짜를 선택하여 모임 날짜를 정합니다</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">블럭 기준 조율</h3>
          <p className="text-gray-600">미리 설정된 시간 블럭 중에서 선택하여 효율적으로 조율합니다</p>
        </div>
      </div>

      {/* Recent Rooms */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">최근 생성된 방</h2>
          <Link to="/create" className="btn-primary">
            새 방 만들기
          </Link>
        </div>

        {rooms && rooms.length > 0 ? (
          <div className="grid gap-4">
            {rooms.slice(0, 5).map((room: Room) => (
              <div key={room.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{room.title}</h3>
                    {room.description && (
                      <p className="text-gray-600 mb-2">{room.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>생성자: {room.creator_name}</span>
                      <span>
                        생성일: {format(new Date(room.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                      </span>
                      <span>
                        유형: {room.room_type === 1 ? '시간 기준' : room.room_type === 2 ? '블럭 기준' : '날짜 기준'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/room/${room.id}`}
                      className="btn-primary"
                    >
                      보기
                    </Link>
                    <Link
                      to={`/room/${room.id}/participate`}
                      className="btn-secondary"
                    >
                      참여하기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <div className="text-gray-500 mb-4">아직 생성된 방이 없습니다.</div>
            <Link to="/create" className="btn-primary">
              첫 번째 방 만들기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
