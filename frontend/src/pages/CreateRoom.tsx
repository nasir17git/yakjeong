import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import { CreateRoomRequest, ROOM_TYPES, ROOM_TYPE_LABELS, Room, TimeBlock, DEFAULT_TIME_BLOCKS } from '../types';

const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  
  // 1주일 후 날짜를 기본값으로 설정
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM 형식
  };

  const [formData, setFormData] = useState<CreateRoomRequest>({
    title: '팀 회의 일정 조율',
    description: '다음 주 팀 회의 시간을 정해보아요. 가능한 시간대를 선택해주세요!',
    room_type: ROOM_TYPES.HOURLY,
    creator_name: '김철수',
    deadline: getDefaultDeadline(),
    settings: undefined,
  });

  // 커스텀 블럭 관리
  const [useCustomBlocks, setUseCustomBlocks] = useState(false);
  const [customBlocks, setCustomBlocks] = useState<TimeBlock[]>([...DEFAULT_TIME_BLOCKS]);

  const createRoomMutation = useMutation({
    mutationFn: roomApi.createRoom,
    onSuccess: (room) => {
      setCreatedRoom(room);
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

    // 블럭 기준일 때 설정 추가
    let settings = formData.settings;
    if (formData.room_type === ROOM_TYPES.BLOCK) {
      if (useCustomBlocks) {
        // 커스텀 블럭 검증
        if (customBlocks.length === 0) {
          alert('최소 하나의 시간 블럭을 추가해주세요.');
          return;
        }
        
        for (const block of customBlocks) {
          if (!block.name.trim() || !block.time_range.trim()) {
            alert('모든 블럭의 이름과 시간대를 입력해주세요.');
            return;
          }
        }
        
        settings = {
          time_blocks: customBlocks,
          use_custom_blocks: true,
        };
      } else {
        settings = {
          time_blocks: DEFAULT_TIME_BLOCKS,
          use_custom_blocks: false,
        };
      }
    }

    createRoomMutation.mutate({
      ...formData,
      settings,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'room_type' 
        ? value ? parseInt(value) : undefined
        : value
    }));
  };

  const addCustomBlock = () => {
    const newBlock: TimeBlock = {
      id: `custom_${Date.now()}`,
      name: '',
      time_range: '',
      memo: '',
    };
    setCustomBlocks([...customBlocks, newBlock]);
  };

  const updateCustomBlock = (index: number, field: keyof TimeBlock, value: string) => {
    const updated = [...customBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setCustomBlocks(updated);
  };

  const removeCustomBlock = (index: number) => {
    if (customBlocks.length > 1) {
      setCustomBlocks(customBlocks.filter((_, i) => i !== index));
    }
  };

  const resetToDefaultBlocks = () => {
    setCustomBlocks([...DEFAULT_TIME_BLOCKS]);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    alert(`${type} 링크가 복사되었습니다!`);
  };

  // 방이 생성된 후 링크 표시
  if (createdRoom) {
    const roomUrl = `${window.location.origin}/room/${createdRoom.id}`;
    const participateUrl = `${window.location.origin}/room/${createdRoom.id}/participate`;
    const resultsUrl = `${window.location.origin}/room/${createdRoom.id}/results`;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="text-green-600 text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-2">방이 생성되었습니다!</h1>
          <p className="text-gray-600">아래 링크들을 참여자들에게 공유하세요.</p>
        </div>

        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">{createdRoom.title}</h2>
            {createdRoom.description && (
              <p className="text-gray-600 mb-4">{createdRoom.description}</p>
            )}
            <div className="text-sm text-gray-500">
              <p>생성자: {createdRoom.creator_name}</p>
              <p>조율 방식: {ROOM_TYPE_LABELS[createdRoom.room_type as keyof typeof ROOM_TYPE_LABELS]}</p>
              {createdRoom.deadline && (
                <p>응답 마감일: {new Date(createdRoom.deadline).toLocaleString('ko-KR')}</p>
              )}
            </div>
          </div>

          {/* 방 정보 링크 */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">📋 방 정보 링크</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={roomUrl}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={() => copyToClipboard(roomUrl, '방 정보')}
                className="btn-secondary"
              >
                복사
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              방 정보를 확인하고 참여자 현황을 볼 수 있습니다.
            </p>
          </div>

          {/* 참여 링크 */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">✋ 참여 링크</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={participateUrl}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={() => copyToClipboard(participateUrl, '참여')}
                className="btn-secondary"
              >
                복사
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              참여자들이 이 링크를 통해 직접 응답할 수 있습니다.
            </p>
          </div>

          {/* 결과 링크 */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">📊 결과 링크</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={resultsUrl}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={() => copyToClipboard(resultsUrl, '결과')}
                className="btn-secondary"
              >
                복사
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              최적 시간대와 참여자별 응답 현황을 확인할 수 있습니다.
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className="border-t pt-6 flex space-x-4">
            <button
              onClick={() => navigate(`/room/${createdRoom.id}`)}
              className="btn-primary flex-1"
            >
              방 정보 보기
            </button>
            <button
              onClick={() => navigate(`/room/${createdRoom.id}/participate`)}
              className="btn-secondary flex-1"
            >
              직접 참여하기
            </button>
          </div>

          {/* 새 방 만들기 */}
          <div className="border-t pt-6 text-center">
            <button
              onClick={() => {
                setCreatedRoom(null);
                setFormData({
                  title: '팀 회의 일정 조율',
                  description: '다음 주 팀 회의 시간을 정해보아요. 가능한 시간대를 선택해주세요!',
                  room_type: ROOM_TYPES.HOURLY,
                  creator_name: '김철수',
                  deadline: getDefaultDeadline(),
                  settings: undefined,
                });
                setUseCustomBlocks(false);
                setCustomBlocks([...DEFAULT_TIME_BLOCKS]);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              새로운 방 만들기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 방 생성 폼
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

        {/* 블럭 기준일 때 커스텀 블럭 설정 */}
        {formData.room_type === ROOM_TYPES.BLOCK && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                시간 블럭 설정
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCustomBlocks"
                  checked={useCustomBlocks}
                  onChange={(e) => {
                    setUseCustomBlocks(e.target.checked);
                    if (!e.target.checked) {
                      setCustomBlocks([...DEFAULT_TIME_BLOCKS]);
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor="useCustomBlocks" className="text-sm text-gray-600">
                  커스텀 블럭 사용
                </label>
              </div>
            </div>

            {useCustomBlocks ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    참여자들이 선택할 수 있는 시간 블럭을 직접 설정하세요.
                  </p>
                  <button
                    type="button"
                    onClick={resetToDefaultBlocks}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    기본값으로 초기화
                  </button>
                </div>
                
                {customBlocks.map((block, index) => (
                  <div key={block.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          블럭 이름 *
                        </label>
                        <input
                          type="text"
                          value={block.name}
                          onChange={(e) => updateCustomBlock(index, 'name', e.target.value)}
                          className="input-field text-sm"
                          placeholder="예: 1막, 오전 연습, 리허설"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          시간대 *
                        </label>
                        <input
                          type="text"
                          value={block.time_range}
                          onChange={(e) => updateCustomBlock(index, 'time_range', e.target.value)}
                          className="input-field text-sm"
                          placeholder="예: 14:00-17:00, 19:30-22:00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        메모 (선택사항)
                      </label>
                      <input
                        type="text"
                        value={block.memo || ''}
                        onChange={(e) => updateCustomBlock(index, 'memo', e.target.value)}
                        className="input-field text-sm"
                        placeholder="추가 설명이나 참고사항"
                      />
                    </div>
                    {customBlocks.length > 1 && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeCustomBlock(index)}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCustomBlock}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  ➕ 시간 블럭 추가
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">
                  기본 시간 블럭을 사용합니다.
                </p>
                {DEFAULT_TIME_BLOCKS.map((block, index) => (
                  <div key={block.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{block.name}</span>
                      <span className="text-gray-600 ml-2">({block.time_range})</span>
                      {block.memo && (
                        <div className="text-sm text-gray-500 mt-1">{block.memo}</div>
                      )}
                    </div>
                    <div className="text-gray-400 font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
            기본적으로 1주일 후로 설정됩니다. 필요에 따라 변경하세요.
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
