import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { roomApi } from '../services/api';
import { CreateRoomRequest, ROOM_TYPES } from '../types';
import DateRangeSelector from '../components/DateRangeSelector';
import TimeRangeSelector from '../components/TimeRangeSelector';
import BlockSelector from '../components/BlockSelector';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'select' | 'date' | 'time' | 'block' | 'block-grid' | 'form'>('select');
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [dateSettings, setDateSettings] = useState<any>(null);
  const [timeSettings, setTimeSettings] = useState<any>(null);
  const [blockSettings, setBlockSettings] = useState<any>(null);
  const [blockGridSettings, setBlockGridSettings] = useState<any>(null);

  // 방 제목 태그들
  const titleTags = ['팀 회의', '친목모임', '정기모임', '온라인미팅', '스터디', '회식', '그 외 모임'];
  
  // 랜덤 생성자 이름 생성
  const getRandomCreatorName = () => {
    const adjectives = ['활발한', '친근한', '성실한', '밝은', '따뜻한', '차분한', '유쾌한', '신중한'];
    const nouns = ['다람쥐', '토끼', '고양이', '강아지', '판다', '코알라', '햄스터', '펭귄'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  };

  // 방 설명 동적 생성
  const generateDescription = (title: string) => {
    return `다가올 ${title} 시간을 정해보아요. 가능한 시간대를 선택해주세요!`;
  };

  // 1주일 후 날짜를 기본값으로 설정
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<CreateRoomRequest>({
    title: '팀 회의',
    description: generateDescription('팀 회의'),
    room_type: ROOM_TYPES.HOURLY,
    creator_name: getRandomCreatorName(),
    deadline: getDefaultDeadline(),
    settings: undefined,
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

  const handleRoomTypeSelect = (roomType: number) => {
    setSelectedRoomType(roomType);
    setFormData(prev => ({ ...prev, room_type: roomType }));
    
    // 날짜 기준 조율은 바로 날짜 설정으로, 나머지는 날짜 설정 단계로
    if (roomType === ROOM_TYPES.DAILY) {
      setCurrentStep('date');
    } else {
      setCurrentStep('date'); // 시간, 블럭 기준도 모두 날짜 설정부터 시작
    }
  };

  const handleDateSettingsComplete = (settings: any) => {
    setDateSettings(settings);
    
    if (selectedRoomType === ROOM_TYPES.DAILY) {
      // 날짜 기준은 바로 방 정보 입력으로
      setCurrentStep('form');
    } else if (selectedRoomType === ROOM_TYPES.HOURLY) {
      // 시간 기준은 시간대 설정으로
      setCurrentStep('time');
    } else if (selectedRoomType === ROOM_TYPES.BLOCK) {
      // 블럭 기준은 블럭 설정으로
      setCurrentStep('block');
    }
  };

  const handleTimeSettingsComplete = (settings: any) => {
    setTimeSettings(settings);
    setCurrentStep('form');
  };

  const handleBlockSettingsComplete = (settings: any) => {
    setBlockSettings(settings);
    setCurrentStep('block-grid');
  };

  const handleBlockGridSettingsComplete = (settings: any) => {
    setBlockGridSettings(settings);
    setCurrentStep('form');
  };

  const handleTitleTagClick = (tag: string) => {
    setFormData(prev => ({ 
      ...prev, 
      title: tag,
      description: generateDescription(tag)
    }));
  };

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

    // 최종 설정 데이터 조합
    let finalSettings = null;
    if (selectedRoomType === ROOM_TYPES.DAILY) {
      finalSettings = dateSettings;
    } else if (selectedRoomType === ROOM_TYPES.HOURLY) {
      finalSettings = { ...dateSettings, ...timeSettings };
    } else if (selectedRoomType === ROOM_TYPES.BLOCK) {
      finalSettings = { ...dateSettings, ...blockSettings, ...blockGridSettings };
    }

    createRoomMutation.mutate({
      ...formData,
      settings: finalSettings,
    });
  };

  const resetForm = () => {
    setCurrentStep('select');
    setSelectedRoomType(null);
    setDateSettings(null);
    setTimeSettings(null);
    setBlockSettings(null);
    setBlockGridSettings(null);
    setFormData({
      title: '팀 회의',
      description: generateDescription('팀 회의'),
      room_type: ROOM_TYPES.HOURLY,
      creator_name: getRandomCreatorName(),
      deadline: getDefaultDeadline(),
      settings: undefined,
    });
  };

  const goBackToTimeSettings = () => {
    setCurrentStep('time');
  };

  const goBackToBlockSettings = () => {
    setCurrentStep('block');
  };

  const goBackToBlockGridSettings = () => {
    setCurrentStep('block-grid');
  };

  const goBackToDateSettings = () => {
    setCurrentStep('date');
    if (selectedRoomType === ROOM_TYPES.HOURLY) {
      setTimeSettings(null);
    } else if (selectedRoomType === ROOM_TYPES.BLOCK) {
      setBlockSettings(null);
      setBlockGridSettings(null);
    }
  };

  const goBackToSelect = () => {
    setCurrentStep('select');
    setSelectedRoomType(null);
    setRoomSettings(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">약</span><span className="text-blue-400">속</span> <span className="text-blue-400">결</span><span className="text-blue-600">정</span>을 쉽고 빠르게
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            참여자들의 가능한 시간을 수집하고 최적의 시간을 찾아보세요
          </p>
        </div>

        {/* 사용 방법 + 개인정보 보호 통합 섹션 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          {/* 사용 방법 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🚀 사용 방법</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">1. 조율 방식 선택</h3>
                <p className="text-gray-600">날짜, 시간, 블럭 중 원하는 방식을 선택하세요</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✋</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">2. 참여자 초대</h3>
                <p className="text-gray-600">생성된 링크를 참여자들에게 공유하세요</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">3. 최적 시간 확인</h3>
                <p className="text-gray-600">모든 응답을 종합한 최적의 시간을 확인하세요</p>
              </div>
            </div>
          </div>

          {/* 개인정보 보호 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔒 개인정보 보호</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">개별 링크 접근</h3>
                <p className="text-gray-600">모든 방은 고유한 링크를 통해서만 접근 가능</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚫</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">공개 목록 없음</h3>
                <p className="text-gray-600">생성된 방의 공개 목록이 없어 개인정보 보호</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">자동 삭제</h3>
                <p className="text-gray-600">응답 마감 후 30일 내에 자동으로 삭제</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1단계: 조율 방식 선택 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 'select' ? '조율 방식을 선택하세요' : '✅ 선택된 조율 방식'}
            </h2>
            {currentStep !== 'select' && (
              <button
                onClick={goBackToSelect}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                수정
              </button>
            )}
          </div>

          {currentStep === 'select' ? (
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => handleRoomTypeSelect(ROOM_TYPES.DAILY)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">날짜 기준 조율</h3>
                <p className="text-gray-600">여러 날짜 중에서 가능한 날짜를 선택</p>
              </button>

              <button
                onClick={() => handleRoomTypeSelect(ROOM_TYPES.HOURLY)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-center group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">시간 기준 조율</h3>
                <p className="text-gray-600">기간 내 시간대별로 가능한 시간을 선택</p>
              </button>

              <button
                onClick={() => handleRoomTypeSelect(ROOM_TYPES.BLOCK)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center group"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200">
                  <span className="text-2xl">🎬</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">블럭 기준 조율</h3>
                <p className="text-gray-600">미리 설정된 시간 블럭 중에서 선택</p>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">
                    {selectedRoomType === ROOM_TYPES.DAILY && '📅'}
                    {selectedRoomType === ROOM_TYPES.HOURLY && '⏰'}
                    {selectedRoomType === ROOM_TYPES.BLOCK && '🎬'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {selectedRoomType === ROOM_TYPES.DAILY && '날짜 기준 조율'}
                    {selectedRoomType === ROOM_TYPES.HOURLY && '시간 기준 조율'}
                    {selectedRoomType === ROOM_TYPES.BLOCK && '블럭 기준 조율'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedRoomType === ROOM_TYPES.DAILY && '여러 날짜 중에서 가능한 날짜를 선택'}
                    {selectedRoomType === ROOM_TYPES.HOURLY && '기간 내 시간대별로 가능한 시간을 선택'}
                    {selectedRoomType === ROOM_TYPES.BLOCK && '미리 설정된 시간 블럭 중에서 선택'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2단계: 날짜 설정 */}
        {currentStep === 'date' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📅 날짜 설정</h2>
              <button
                onClick={goBackToSelect}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                ← 조율 방식 변경
              </button>
            </div>

            <DateRangeSelector onComplete={handleDateSettingsComplete} />
          </div>
        )}

        {/* 날짜 설정 완료 상태 표시 */}
        {(currentStep === 'time' || currentStep === 'block' || currentStep === 'block-grid' || currentStep === 'form') && dateSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ 날짜 설정 완료</h2>
              <button
                onClick={goBackToDateSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                수정
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">선택된 날짜: {dateSettings.selected_dates?.length || 0}개</h4>
              <div className="flex flex-wrap gap-2">
                {dateSettings.selected_dates?.slice(0, 5).map((date: string) => (
                  <span key={date} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                ))}
                {dateSettings.selected_dates?.length > 5 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                    +{dateSettings.selected_dates.length - 5}개
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3단계: 시간대 설정 (시간 기준 조율만) */}
        {currentStep === 'time' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">⏰ 시간대 설정</h2>
              <button
                onClick={goBackToDateSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                ← 날짜 설정으로
              </button>
            </div>

            <TimeRangeSelector 
              selectedDates={dateSettings?.selected_dates || []}
              onComplete={handleTimeSettingsComplete} 
            />
          </div>
        )}

        {/* 시간대 설정 완료 상태 표시 */}
        {currentStep === 'form' && selectedRoomType === ROOM_TYPES.HOURLY && timeSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ 시간대 설정 완료</h2>
              <button
                onClick={goBackToTimeSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                수정
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                설정된 시간대: {timeSettings.total_slots || 0}개
              </h4>
              <p className="text-sm text-gray-600">
                {dateSettings?.selected_dates?.length}개 날짜에 대한 시간대별 조율이 설정되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* 3단계: 블럭 설정 (블럭 기준 조율만) */}
        {currentStep === 'block' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🎬 블럭 설정</h2>
              <button
                onClick={goBackToDateSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                ← 날짜 설정으로
              </button>
            </div>

            <BlockSelector 
              step="block"
              selectedDates={dateSettings?.selected_dates || []}
              onComplete={handleBlockSettingsComplete} 
            />
          </div>
        )}

        {/* 블럭 설정 완료 상태 표시 */}
        {(currentStep === 'block-grid' || currentStep === 'form') && selectedRoomType === ROOM_TYPES.BLOCK && blockSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ 블럭 설정 완료</h2>
              <button
                onClick={goBackToBlockSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                수정
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                설정된 블럭: {blockSettings.time_blocks?.length || 0}개
              </h4>
              <div className="flex flex-wrap gap-2">
                {blockSettings.time_blocks?.slice(0, 3).map((block: any) => (
                  <span key={block.id} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {block.name}
                  </span>
                ))}
                {blockSettings.time_blocks?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                    +{blockSettings.time_blocks.length - 3}개
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4단계: 날짜별 블럭 선택 (블럭 기준 조율만) */}
        {currentStep === 'block-grid' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📋 날짜별 블럭 선택</h2>
              <button
                onClick={goBackToBlockSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                ← 블럭 설정으로
              </button>
            </div>

            <BlockSelector 
              step="grid"
              selectedDates={dateSettings?.selected_dates || []}
              blocks={blockSettings?.time_blocks || []}
              onComplete={handleBlockGridSettingsComplete} 
            />
          </div>
        )}

        {/* 날짜별 블럭 선택 완료 상태 표시 */}
        {currentStep === 'form' && selectedRoomType === ROOM_TYPES.BLOCK && blockGridSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">✅ 날짜별 블럭 선택 완료</h2>
              <button
                onClick={goBackToBlockGridSettings}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                수정
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                선택된 블럭 슬롯: {Object.values(blockGridSettings.block_slots_by_date || {}).flat().length}개
              </h4>
              <p className="text-sm text-gray-600">
                각 날짜별로 참여자가 선택할 수 있는 블럭들이 설정되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* 3단계: 방 정보 입력 */}
        {currentStep === 'form' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">방 정보 입력</h2>
              <button
                onClick={() => {
                  if (selectedRoomType === ROOM_TYPES.DAILY) {
                    goBackToDateSettings();
                  } else if (selectedRoomType === ROOM_TYPES.HOURLY) {
                    goBackToTimeSettings();
                  } else if (selectedRoomType === ROOM_TYPES.BLOCK) {
                    goBackToBlockGridSettings();
                  }
                }}
                className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                ← 이전 단계로
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 방 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  방 제목 *
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {titleTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTitleTagClick(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.title === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="직접 입력하거나 위 태그를 선택하세요"
                  required
                />
              </div>

              {/* 방 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  방 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="방에 대한 간단한 설명을 입력하세요"
                />
              </div>

              {/* 생성자 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생성자 이름 *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.creator_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, creator_name: e.target.value }))}
                    className="input-field flex-1"
                    placeholder="이름을 입력하세요"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, creator_name: getRandomCreatorName() }))}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    🎲 랜덤
                  </button>
                </div>
              </div>

              {/* 응답 마감일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  응답 마감일
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="input-field"
                />
                <p className="mt-1 text-sm text-gray-500">
                  기본적으로 1주일 후로 설정됩니다. 필요에 따라 변경하세요.
                </p>
              </div>

              {/* 방 만들기 버튼 */}
              <button
                type="submit"
                disabled={createRoomMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg shadow-lg"
              >
                {createRoomMutation.isPending ? '생성 중...' : '🎉 방 만들기'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
