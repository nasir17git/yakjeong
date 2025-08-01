import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import { CreateRoomRequest, ROOM_TYPES, ROOM_TYPE_LABELS } from '../types';

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateRoomRequest>({
    title: '',
    description: '',
    room_type: ROOM_TYPES.HOURLY,
    creator_name: '',
    max_participants: undefined,
    deadline: undefined,
  });

  const createRoomMutation = useMutation({
    mutationFn: roomApi.createRoom,
    onSuccess: (room) => {
      navigate(`/room/${room.id}`);
    },
    onError: (error) => {
      console.error('방 생성 실패:', error);
      alert('방 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('방 제목을 입력해주세요.');
      return;
    }
    
    if (!formData.creator_name.trim()) {
      alert('생성자 이름을 입력해주세요.');
      return;
    }

    createRoomMutation.mutate(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'room_type' || name === 'max_participants' 
        ? value ? parseInt(value) : undefined
        : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">새 방 만들기</h1>
        <p className="text-gray-600">일정 조율을 위한 새로운 방을 생성합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* 방 제목 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            방 제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="input-field"
            placeholder="예: 팀 회의 일정 조율"
            required
          />
        </div>

        {/* 방 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            방 설명
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="input-field"
            placeholder="방에 대한 간단한 설명을 입력하세요"
          />
        </div>

        {/* 방 유형 */}
        <div>
          <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-2">
            조율 방식 *
          </label>
          <select
            id="room_type"
            name="room_type"
            value={formData.room_type}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="mt-2 text-sm text-gray-500">
            {formData.room_type === ROOM_TYPES.HOURLY && (
              <p>• 0시부터 24시까지 시간대별로 가능한 시간을 선택합니다.</p>
            )}
            {formData.room_type === ROOM_TYPES.BLOCK && (
              <p>• 미리 설정된 시간 블럭 중에서 가능한 시간을 선택합니다.</p>
            )}
            {formData.room_type === ROOM_TYPES.DAILY && (
              <p>• 여러 날짜 중에서 가능한 날짜를 선택합니다.</p>
            )}
          </div>
        </div>

        {/* 생성자 이름 */}
        <div>
          <label htmlFor="creator_name" className="block text-sm font-medium text-gray-700 mb-2">
            생성자 이름 *
          </label>
          <input
            type="text"
            id="creator_name"
            name="creator_name"
            value={formData.creator_name}
            onChange={handleInputChange}
            className="input-field"
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        {/* 최대 참여자 수 */}
        <div>
          <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
            최대 참여자 수
          </label>
          <input
            type="number"
            id="max_participants"
            name="max_participants"
            value={formData.max_participants || ''}
            onChange={handleInputChange}
            className="input-field"
            placeholder="제한 없음"
            min="1"
            max="100"
          />
          <p className="mt-1 text-sm text-gray-500">
            비워두면 참여자 수에 제한이 없습니다.
          </p>
        </div>

        {/* 마감일 */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
            응답 마감일
          </label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={formData.deadline || ''}
            onChange={handleInputChange}
            className="input-field"
          />
          <p className="mt-1 text-sm text-gray-500">
            마감일을 설정하지 않으면 언제든 응답할 수 있습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={createRoomMutation.isPending}
            className="btn-primary flex-1"
          >
            {createRoomMutation.isPending ? '생성 중...' : '방 만들기'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
