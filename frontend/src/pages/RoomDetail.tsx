import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi, participantApi } from '../services/api';
import { ROOM_TYPE_LABELS, ROOM_TYPES, TimeBlock } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: room, isLoading: roomLoading, error: roomError } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getRoom(id!),
    enabled: !!id,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['participants', id],
    queryFn: () => participantApi.getParticipantsByRoom(id!),
    enabled: !!id,
  });

  if (roomLoading || participantsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">방을 찾을 수 없습니다.</div>
        <Link to="/" className="btn-primary">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const isDeadlinePassed = room.deadline && new Date(room.deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto">
      {/* 방 정보 */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
            {room.description && (
              <p className="text-gray-600 mb-4">{room.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/room/${room.id}/participate`}
              className={`btn-primary ${isDeadlinePassed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              참여하기
            </Link>
            <Link
              to={`/room/${room.id}/results`}
              className="btn-secondary"
            >
              결과 보기
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">방 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">생성자:</span>
                <span>{room.creator_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">조율 방식:</span>
                <span>{ROOM_TYPE_LABELS[room.room_type as keyof typeof ROOM_TYPE_LABELS]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">생성일:</span>
                <span>{format(new Date(room.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</span>
              </div>
              {room.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-600">응답 마감일:</span>
                  <span className={isDeadlinePassed ? 'text-red-600' : ''}>
                    {format(new Date(room.deadline), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                    {isDeadlinePassed && ' (마감됨)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">참여 현황</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">현재 참여자:</span>
                <span>{participants?.length || 0}명</span>
              </div>
            </div>
          </div>
        </div>

        {isDeadlinePassed && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              ⚠️ 응답 마감일이 지났습니다. 더 이상 새로운 응답을 받을 수 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 블럭 기준일 때 시간 블럭 정보 표시 */}
      {room.room_type === ROOM_TYPES.BLOCK && room.settings?.time_blocks && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">시간 블럭 정보</h2>
          <div className="grid gap-3">
            {room.settings.time_blocks.map((block: TimeBlock, index: number) => (
              <div key={block.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{block.name}</div>
                    <div className="text-gray-600 mt-1">{block.time_range}</div>
                    {block.memo && (
                      <div className="text-gray-500 text-sm mt-2">{block.memo}</div>
                    )}
                  </div>
                  <div className="text-gray-400 font-bold text-lg">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            참여자들은 위 시간 블럭 중에서 가능한 시간을 선택할 수 있습니다.
          </p>
        </div>
      )}

      {/* 참여자 목록 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">참여자 목록</h2>
        
        {participants && participants.length > 0 ? (
          <div className="grid gap-3">
            {participants.map((participant, index) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{participant.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(participant.created_at), 'MM/dd HH:mm', { locale: ko })} 참여
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

      {/* 공유 링크 */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-3">방 공유하기</h3>
        <div className="space-y-3">
          {/* 참여 링크 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">참여 링크</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/room/${room.id}/participate`}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}/participate`);
                  alert('참여 링크가 복사되었습니다!');
                }}
                className="btn-secondary"
              >
                복사
              </button>
            </div>
          </div>
          
          {/* 결과 링크 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">결과 링크</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/room/${room.id}/results`}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}/results`);
                  alert('결과 링크가 복사되었습니다!');
                }}
                className="btn-secondary"
              >
                복사
              </button>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          이 링크들을 공유하여 다른 사람들을 초대하세요.
        </p>
      </div>
    </div>
  );
};

export default RoomDetail;
