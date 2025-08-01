import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi, participantApi } from '../services/api';
import { ROOM_TYPE_LABELS } from '../types';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getRoom(id!),
    enabled: !!id,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['participants', id],
    queryFn: () => participantApi.getParticipantsByRoom(id!),
    enabled: !!id,
  });

  const { data: optimalTimes, isLoading: optimalLoading } = useQuery({
    queryKey: ['optimal-times', id],
    queryFn: () => roomApi.getOptimalTimes(id!),
    enabled: !!id,
  });

  if (roomLoading || participantsLoading || optimalLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">방을 찾을 수 없습니다.</div>
        <Link to="/" className="btn-primary">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const totalParticipants = participants?.length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
            <p className="text-gray-600">일정 조율 결과</p>
          </div>
          <Link to={`/room/${id}`} className="btn-secondary">
            방 정보 보기
          </Link>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{totalParticipants}</div>
          <div className="text-gray-600">총 참여자</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {optimalTimes?.length || 0}
          </div>
          <div className="text-gray-600">가능한 시간대</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {ROOM_TYPE_LABELS[room.room_type as keyof typeof ROOM_TYPE_LABELS]}
          </div>
          <div className="text-gray-600">조율 방식</div>
        </div>
      </div>

      {/* 최적 시간대 */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">최적 시간대</h2>
        
        {optimalTimes && optimalTimes.length > 0 ? (
          <div className="space-y-3">
            {optimalTimes.slice(0, 10).map((timeSlot, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  index === 0
                    ? 'bg-green-50 border-green-200'
                    : index < 3
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-green-600 text-white'
                          : index < 3
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{timeSlot.time_slot}</div>
                      <div className="text-sm text-gray-600">
                        참여 가능: {timeSlot.participant_count}명 ({Math.round(timeSlot.availability_rate * 100)}%)
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      최적
                    </div>
                  )}
                </div>
                
                {/* 참여 가능한 사람들 */}
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-2">참여 가능한 사람:</div>
                  <div className="flex flex-wrap gap-2">
                    {timeSlot.available_participants.map((name, nameIndex) => (
                      <span
                        key={nameIndex}
                        className="px-2 py-1 bg-white border rounded text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {totalParticipants === 0
              ? '아직 참여자가 없습니다.'
              : '공통으로 가능한 시간대가 없습니다.'}
          </div>
        )}
      </div>

      {/* 참여자별 응답 현황 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">참여자별 응답 현황</h2>
        
        {participants && participants.length > 0 ? (
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div key={participant.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{participant.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    응답 완료
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            아직 참여자가 없습니다.
          </div>
        )}
      </div>

      {/* 공유 및 추가 참여 */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-3">더 많은 사람들을 초대하세요</h3>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={`${window.location.origin}/room/${id}/participate`}
            readOnly
            className="input-field flex-1"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/room/${id}/participate`);
              alert('참여 링크가 복사되었습니다!');
            }}
            className="btn-secondary"
          >
            복사
          </button>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/room/${id}/participate`}
            className="btn-primary"
          >
            직접 참여하기
          </Link>
          <Link
            to={`/room/${id}`}
            className="btn-secondary"
          >
            방 정보 보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
