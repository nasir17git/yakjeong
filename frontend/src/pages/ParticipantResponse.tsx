import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { roomApi, participantApi, responseApi } from '../services/api';
import { ROOM_TYPES } from '../types';

const ParticipantResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState('');
  const [responseData, setResponseData] = useState<Record<string, any>>({});
  const [step, setStep] = useState<'name' | 'response'>('name');

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getRoom(id!),
    enabled: !!id,
  });

  const createParticipantMutation = useMutation({
    mutationFn: participantApi.createParticipant,
    onSuccess: (participant) => {
      // 응답 데이터 생성
      responseApi.createResponse({
        participant_id: participant.id,
        response_data: responseData,
      }).then(() => {
        navigate(`/room/${id}/results`);
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        alert('이미 같은 이름의 참여자가 있습니다. 다른 이름을 사용해주세요.');
      } else {
        alert('참여에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    setStep('response');
  };

  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room) return;

    // 응답 데이터 검증
    if (room.room_type === ROOM_TYPES.HOURLY) {
      if (!responseData.available_times || responseData.available_times.length === 0) {
        alert('최소 하나의 시간대를 선택해주세요.');
        return;
      }
    } else if (room.room_type === ROOM_TYPES.DAILY) {
      if (!responseData.available_dates || responseData.available_dates.length === 0) {
        alert('최소 하나의 날짜를 선택해주세요.');
        return;
      }
    } else if (room.room_type === ROOM_TYPES.BLOCK) {
      if (!responseData.available_blocks || responseData.available_blocks.length === 0) {
        alert('최소 하나의 시간 블럭을 선택해주세요.');
        return;
      }
    }

    // 참여자 생성 및 응답 저장
    createParticipantMutation.mutate({
      room_id: id!,
      name: participantName,
    });
  };

  const renderTimeSelection = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const selectedTimes = responseData.available_times || [];

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">가능한 시간대를 선택하세요</h3>
        <div className="grid grid-cols-6 gap-2">
          {hours.map(hour => (
            <button
              key={hour}
              type="button"
              onClick={() => {
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                const newTimes = selectedTimes.includes(timeStr)
                  ? selectedTimes.filter((t: string) => t !== timeStr)
                  : [...selectedTimes, timeStr];
                setResponseData({ ...responseData, available_times: newTimes });
              }}
              className={`p-2 text-sm rounded border ${
                selectedTimes.includes(`${hour.toString().padStart(2, '0')}:00`)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {hour.toString().padStart(2, '0')}:00
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          선택된 시간: {selectedTimes.length}개
        </p>
      </div>
    );
  };

  const renderDateSelection = () => {
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    const selectedDates = responseData.available_dates || [];

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">가능한 날짜를 선택하세요</h3>
        <div className="grid grid-cols-7 gap-2">
          {dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDates.includes(dateStr);
            
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  const newDates = isSelected
                    ? selectedDates.filter((d: string) => d !== dateStr)
                    : [...selectedDates, dateStr];
                  setResponseData({ ...responseData, available_dates: newDates });
                }}
                className={`p-3 text-sm rounded border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">
                  {date.getMonth() + 1}/{date.getDate()}
                </div>
                <div className="text-xs">
                  {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          선택된 날짜: {selectedDates.length}개
        </p>
      </div>
    );
  };

  const renderBlockSelection = () => {
    const blocks = [
      { id: 'morning', label: '오전 (09:00-12:00)', value: '09:00-12:00' },
      { id: 'afternoon', label: '오후 (13:00-18:00)', value: '13:00-18:00' },
      { id: 'evening', label: '저녁 (19:00-22:00)', value: '19:00-22:00' },
    ];
    const selectedBlocks = responseData.available_blocks || [];

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">가능한 시간 블럭을 선택하세요</h3>
        <div className="space-y-3">
          {blocks.map(block => (
            <button
              key={block.id}
              type="button"
              onClick={() => {
                const isSelected = selectedBlocks.some((b: any) => b.time_range === block.value);
                const newBlocks = isSelected
                  ? selectedBlocks.filter((b: any) => b.time_range !== block.value)
                  : [...selectedBlocks, { time_range: block.value, date: new Date().toISOString().split('T')[0] }];
                setResponseData({ ...responseData, available_blocks: newBlocks });
              }}
              className={`w-full p-4 text-left rounded-lg border ${
                selectedBlocks.some((b: any) => b.time_range === block.value)
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{block.label}</div>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          선택된 블럭: {selectedBlocks.length}개
        </p>
      </div>
    );
  };

  if (roomLoading) {
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
      </div>
    );
  }

  const isDeadlinePassed = room.deadline && new Date(room.deadline) < new Date();

  if (isDeadlinePassed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card">
          <h1 className="text-2xl font-bold mb-4">응답 마감</h1>
          <p className="text-gray-600 mb-6">
            이 방의 응답 마감일이 지났습니다.
          </p>
          <button
            onClick={() => navigate(`/room/${id}`)}
            className="btn-primary"
          >
            방 정보 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
        <p className="text-gray-600">일정 조율에 참여해주세요.</p>
      </div>

      {step === 'name' ? (
        <form onSubmit={handleNameSubmit} className="card">
          <h2 className="text-xl font-bold mb-4">참여자 정보</h2>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              id="name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="input-field"
              placeholder="이름을 입력하세요"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              방 내에서 중복되지 않는 이름을 사용해주세요.
            </p>
          </div>
          <button type="submit" className="btn-primary w-full">
            다음 단계
          </button>
        </form>
      ) : (
        <form onSubmit={handleResponseSubmit} className="card">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">안녕하세요, {participantName}님!</h2>
            <p className="text-gray-600">가능한 시간을 선택해주세요.</p>
          </div>

          <div className="mb-8">
            {room.room_type === ROOM_TYPES.HOURLY && renderTimeSelection()}
            {room.room_type === ROOM_TYPES.DAILY && renderDateSelection()}
            {room.room_type === ROOM_TYPES.BLOCK && renderBlockSelection()}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep('name')}
              className="btn-secondary"
            >
              이전
            </button>
            <button
              type="submit"
              disabled={createParticipantMutation.isPending}
              className="btn-primary flex-1"
            >
              {createParticipantMutation.isPending ? '제출 중...' : '응답 제출'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ParticipantResponse;
