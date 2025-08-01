import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { roomApi, participantApi, responseApi } from '../services/api';
import { ROOM_TYPES, TimeBlock, DEFAULT_TIME_BLOCKS } from '../types';

const ParticipantResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState('');
  const [responseData, setResponseData] = useState<Record<string, any>>({});
  const [step, setStep] = useState<'name' | 'response'>('name');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  const { data: room, isLoading: roomLoading, error: roomError } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getRoom(id!),
    enabled: !!id,
  });

  // 디버깅용 로그
  console.log('ParticipantResponse Debug:', {
    id,
    room: room ? {
      id: room.id,
      title: room.title,
      room_type: room.room_type,
      settings: room.settings
    } : null,
    roomLoading,
    roomError,
    step,
    participantName
  });

  // 시간 기준 조율을 위한 currentWeekStart 초기화
  React.useEffect(() => {
    if (room?.settings?.time_slots_by_date) {
      const selectedDates = Object.keys(room.settings.time_slots_by_date).sort();
      if (selectedDates.length > 0) {
        setCurrentWeekStart(new Date(selectedDates[0]));
      }
    }
  }, [room?.settings?.time_slots_by_date]);

  const createParticipantMutation = useMutation({
    mutationFn: participantApi.createParticipant,
    onSuccess: (participant) => {
      // Set을 Array로 변환하여 응답 데이터 준비
      const processedResponseData = { ...responseData };
      
      // 시간 기준 조율: Set을 Array로 변환
      if (processedResponseData.available_time_slots instanceof Set) {
        processedResponseData.available_time_slots = Array.from(processedResponseData.available_time_slots);
      }
      
      // 블럭 기준 조율: Set을 Array로 변환
      if (processedResponseData.available_block_slots instanceof Set) {
        processedResponseData.available_block_slots = Array.from(processedResponseData.available_block_slots);
      }

      console.log('Processed response data:', processedResponseData);

      // 응답 데이터 생성
      responseApi.createResponse({
        participant_id: participant.id,
        response_data: processedResponseData,
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
      if (!responseData.available_time_slots || responseData.available_time_slots.size === 0) {
        alert('최소 하나의 시간대를 선택해주세요.');
        return;
      }
      // Set을 Array로 변환하여 저장
      const timeSlotArray = Array.from(responseData.available_time_slots);
      const finalResponseData = { ...responseData, available_time_slots: timeSlotArray };
      
      // 참여자 생성 및 응답 저장
      createParticipantMutation.mutate({
        room_id: id!,
        name: participantName,
      });
      
      // 응답 데이터를 미리 설정
      setResponseData(finalResponseData);
    } else if (room.room_type === ROOM_TYPES.DAILY) {
      if (!responseData.available_dates || responseData.available_dates.length === 0) {
        alert('최소 하나의 날짜를 선택해주세요.');
        return;
      }
      
      // 참여자 생성 및 응답 저장
      createParticipantMutation.mutate({
        room_id: id!,
        name: participantName,
      });
    } else if (room.room_type === ROOM_TYPES.BLOCK) {
      if (!responseData.available_block_slots || responseData.available_block_slots.size === 0) {
        alert('최소 하나의 시간 블럭을 선택해주세요.');
        return;
      }
      // Set을 Array로 변환
      const blockSlotArray = Array.from(responseData.available_block_slots);
      const finalResponseData = { ...responseData, available_block_slots: blockSlotArray };
      
      // 참여자 생성 및 응답 저장
      createParticipantMutation.mutate({
        room_id: id!,
        name: participantName,
      });
      
      // 응답 데이터를 미리 설정
      setResponseData(finalResponseData);
    }
  };

  const renderTimeSelection = () => {
    // 방 설정에서 시간 슬롯 정보 가져오기
    console.log('Room settings for time selection:', JSON.stringify(room?.settings, null, 2));
    
    if (!room?.settings?.time_slots_by_date) {
      console.log('No time_slots_by_date found');
      return (
        <div className="text-center py-8 text-gray-500">
          시간 설정 정보를 불러올 수 없습니다.
        </div>
      );
    }

    // 데이터 구조 확인 및 변환
    let timeSlotsByDate = room.settings.time_slots_by_date;
    let selectedDates = room.settings.selected_dates || [];
    
    console.log('Original timeSlotsByDate:', timeSlotsByDate);
    console.log('Selected dates:', selectedDates);
    
    // 만약 timeSlotsByDate가 {2025: Array} 형태라면 변환 필요
    if (timeSlotsByDate && typeof timeSlotsByDate === 'object') {
      const keys = Object.keys(timeSlotsByDate);
      console.log('timeSlotsByDate keys:', keys);
      
      // 연도 키가 있는 경우 (잘못된 구조)
      if (keys.length === 1 && keys[0].match(/^\d{4}$/)) {
        console.log('Detected year-based structure, need to convert');
        // 임시로 모든 선택된 날짜에 대해 기본 시간대 설정
        const newTimeSlotsByDate: { [key: string]: string[] } = {};
        selectedDates.forEach((date: string) => {
          // 기본 시간대 (9시-18시, 30분 단위)
          const timeSlots = [];
          for (let hour = 9; hour <= 17; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
          newTimeSlotsByDate[date] = timeSlots;
        });
        timeSlotsByDate = newTimeSlotsByDate;
        console.log('Converted timeSlotsByDate:', timeSlotsByDate);
      }
    }

    const selectedTimeSlots = responseData.available_time_slots || new Set();

    // 시간 슬롯 생성 (0시-24시, 30분 단위)
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const isHour = minute === 0;
          
          let displayTime = '';
          if (isHour) {
            if (hour === 0) displayTime = '12 AM';
            else if (hour === 12) displayTime = '12 PM';
            else if (hour < 12) displayTime = `${hour} AM`;
            else displayTime = `${hour - 12} PM`;
          } else {
            displayTime = ':30';
          }
          
          slots.push({
            time: timeString,
            display: displayTime,
            isHour,
            minute,
            hour
          });
        }
      }
      return slots;
    };

    const timeSlots = generateTimeSlots();

    // 날짜와 시간으로 슬롯 ID 생성
    const getSlotId = (dateString: string, timeString: string) => {
      return `${dateString}|${timeString}`;
    };

    const handleTimeSlotClick = (dateString: string, timeString: string) => {
      const slotId = getSlotId(dateString, timeString);
      const newSelected = new Set(selectedTimeSlots);
      
      if (newSelected.has(slotId)) {
        newSelected.delete(slotId);
      } else {
        newSelected.add(slotId);
      }
      
      setResponseData({ ...responseData, available_time_slots: newSelected });
    };

    const handleSelectAll = () => {
      const allSlots = new Set<string>();
      selectedDates.forEach(dateString => {
        const availableSlots = timeSlotsByDate[dateString] || [];
        availableSlots.forEach(timeString => {
          allSlots.add(getSlotId(dateString, timeString));
        });
      });
      setResponseData({ ...responseData, available_time_slots: allSlots });
    };

    const handleDeselectAll = () => {
      setResponseData({ ...responseData, available_time_slots: new Set() });
    };

    const handlePrevWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
    };

    const handleNextWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
    };

    // 주별 날짜 생성 (선택된 날짜만)
    const generateWeekDates = () => {
      const dates = [];
      const startOfWeek = new Date(currentWeekStart);
      
      // 월요일로 조정
      const dayOfWeek = startOfWeek.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        if (selectedDates.includes(dateString)) {
          dates.push({
            date,
            dateString,
            dayName: ['월', '화', '수', '목', '금', '토', '일'][i]
          });
        }
      }

      return dates;
    };

    const weekDates = generateWeekDates();
    
    console.log('Final data for rendering:', {
      selectedDates,
      weekDates,
      timeSlotsByDate: Object.keys(timeSlotsByDate),
      selectedTimeSlots: selectedTimeSlots.size
    });

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">가능한 시간대를 선택하세요</h3>
        
        {/* 모두 선택/해제 버튼 */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            모두 선택
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            모두 해제
          </button>
        </div>

        {/* 주별 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← 이전 주
          </button>
          <div className="text-lg font-semibold">
            {weekDates.length > 0 && (
              <>
                {weekDates[0].date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - 
                {weekDates[weekDates.length - 1].date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </>
            )}
          </div>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            다음 주 →
          </button>
        </div>

        {weekDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            이 주에는 선택된 날짜가 없습니다. 다른 주를 확인해보세요.
          </div>
        ) : (
          <>
            {/* 시간 그리드 */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* 헤더 (날짜들) */}
          <div className="grid bg-gray-50 border-b border-gray-300" style={{ gridTemplateColumns: `120px repeat(${weekDates.length}, 1fr)` }}>
            <div className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-300">
              시간
            </div>
            {weekDates.map((dateInfo, index) => (
              <div key={index} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-300 last:border-r-0">
                <div className="font-semibold">{dateInfo.dayName}</div>
                <div className="text-xs text-gray-500">
                  {dateInfo.date.getMonth() + 1}/{dateInfo.date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 시간 슬롯들 */}
          {timeSlots.map((slot, timeIndex) => (
            <div key={timeIndex} className="grid border-t border-gray-200" style={{ gridTemplateColumns: `120px repeat(${weekDates.length}, 1fr)` }}>
              {/* 시간 라벨 */}
              <div className="p-2 text-center text-xs text-gray-600 border-r border-gray-300 bg-gray-50 flex items-center justify-center">
                <span className={slot.isHour ? 'font-medium text-gray-800' : 'text-gray-400 text-xs'}>
                  {slot.display}
                </span>
              </div>
              
              {/* 각 날짜별 시간 슬롯 */}
              {weekDates.map((dateInfo, dateIndex) => {
                const availableSlots = timeSlotsByDate[dateInfo.dateString] || [];
                const isAvailable = availableSlots.includes(slot.time);
                const slotId = getSlotId(dateInfo.dateString, slot.time);
                const isSelected = selectedTimeSlots.has(slotId);
                
                return (
                  <div
                    key={dateIndex}
                    className={`
                      h-6 border-r border-gray-200 last:border-r-0 transition-colors
                      ${!isAvailable 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-green-400 hover:bg-green-500 cursor-pointer' 
                          : 'hover:bg-blue-100 cursor-pointer'
                      }
                    `}
                    onClick={() => isAvailable && handleTimeSlotClick(dateInfo.dateString, slot.time)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>선택된 시간</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span>선택 가능한 시간</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>선택 불가능한 시간</span>
          </div>
        </div>

            {/* 선택된 시간대 요약 */}
            {selectedTimeSlots.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">선택된 시간: {selectedTimeSlots.size}개</h4>
                <p className="text-sm text-blue-700">
                  선택하신 시간대들이 최적 시간 계산에 반영됩니다.
                </p>
              </div>
            )}
          </>
        )}
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
        
        {/* 선택된 날짜 모두 표시 */}
        {selectedDates.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">선택된 날짜: {selectedDates.length}개</h4>
            <div className="flex flex-wrap gap-2">
              {selectedDates.sort().map((dateStr: string) => (
                <span
                  key={dateStr}
                  className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm"
                >
                  {new Date(dateStr).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBlockSelection = () => {
    // 방 설정에서 시간 블럭과 날짜별 블럭 슬롯 정보 가져오기
    let timeBlocks: TimeBlock[] = DEFAULT_TIME_BLOCKS;
    let blockSlotsByDate: { [key: string]: string[] } = {};
    let selectedDates: string[] = [];
    
    if (room?.settings?.time_blocks) {
      timeBlocks = room.settings.time_blocks;
    }
    
    if (room?.settings?.block_slots_by_date) {
      blockSlotsByDate = room.settings.block_slots_by_date;
      selectedDates = Object.keys(blockSlotsByDate).sort();
    }

    const selectedBlockSlots = responseData.available_block_slots || new Set();

    // 날짜와 블럭으로 슬롯 ID 생성
    const getSlotId = (dateString: string, blockId: string) => {
      return `${dateString}-${blockId}`;
    };

    const handleBlockSlotClick = (dateString: string, blockId: string) => {
      const slotId = getSlotId(dateString, blockId);
      const newSelected = new Set(selectedBlockSlots);
      
      if (newSelected.has(slotId)) {
        newSelected.delete(slotId);
      } else {
        newSelected.add(slotId);
      }
      
      setResponseData({ ...responseData, available_block_slots: newSelected });
    };

    const handleSelectAll = () => {
      const allSlots = new Set<string>();
      selectedDates.forEach(dateString => {
        const availableBlocks = blockSlotsByDate[dateString] || [];
        availableBlocks.forEach(blockId => {
          allSlots.add(getSlotId(dateString, blockId));
        });
      });
      setResponseData({ ...responseData, available_block_slots: allSlots });
    };

    const handleDeselectAll = () => {
      setResponseData({ ...responseData, available_block_slots: new Set() });
    };

    // 주별 날짜 생성
    const generateWeekDates = () => {
      return selectedDates.map(dateString => {
        const date = new Date(dateString);
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        return {
          date,
          dateString,
          dayName: dayNames[date.getDay()]
        };
      });
    };

    const weekDates = generateWeekDates();

    if (selectedDates.length === 0 || timeBlocks.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          블럭 설정 정보를 불러올 수 없습니다.
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">가능한 시간 블럭을 선택하세요</h3>
        
        {/* 모두 선택/해제 버튼 */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            모두 선택
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            모두 해제
          </button>
        </div>

        {/* 블럭 그리드 */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* 헤더 (날짜들) */}
          <div className="grid bg-gray-50 border-b border-gray-300" style={{ gridTemplateColumns: `200px repeat(${weekDates.length}, 1fr)` }}>
            <div className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-300">
              블럭
            </div>
            {weekDates.map((dateInfo, index) => (
              <div key={index} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-300 last:border-r-0">
                <div className="font-semibold">{dateInfo.dayName}</div>
                <div className="text-xs text-gray-500">
                  {dateInfo.date.getMonth() + 1}/{dateInfo.date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 블럭 행들 */}
          {timeBlocks.map((block, blockIndex) => (
            <div key={block.id} className="grid border-t border-gray-200" style={{ gridTemplateColumns: `200px repeat(${weekDates.length}, 1fr)` }}>
              {/* 블럭 정보 */}
              <div className="p-3 text-xs text-gray-600 border-r border-gray-300 bg-gray-50">
                <div className="font-medium text-gray-800 mb-1">{block.name}</div>
                <div className="text-gray-500">{block.time_range}</div>
                {block.memo && (
                  <div className="text-gray-400 mt-1">{block.memo}</div>
                )}
              </div>
              
              {/* 각 날짜별 블럭 슬롯 */}
              {weekDates.map((dateInfo, dateIndex) => {
                const availableBlocks = blockSlotsByDate[dateInfo.dateString] || [];
                const isAvailable = availableBlocks.includes(block.id);
                const slotId = getSlotId(dateInfo.dateString, block.id);
                const isSelected = selectedBlockSlots.has(slotId);
                
                return (
                  <div
                    key={dateIndex}
                    className="p-3 border-r border-gray-200 last:border-r-0 flex items-center justify-center"
                  >
                    {isAvailable ? (
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBlockSlotClick(dateInfo.dateString, block.id)}
                          className="sr-only"
                        />
                        <div className={`
                          w-6 h-6 rounded border-2 transition-colors flex items-center justify-center
                          ${isSelected 
                            ? 'bg-purple-500 border-purple-500 text-white' 
                            : 'border-gray-300 hover:border-purple-300'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </label>
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded opacity-50"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>선택된 블럭</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span>선택 가능한 블럭</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded opacity-50"></div>
            <span>선택 불가능한 블럭</span>
          </div>
        </div>

        {/* 선택된 블럭 요약 */}
        {selectedBlockSlots.size > 0 && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">선택된 블럭: {selectedBlockSlots.size}개</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from(selectedBlockSlots).map((slotId: string) => {
                const [dateString, blockId] = slotId.split('-');
                const block = timeBlocks.find(b => b.id === blockId);
                const date = new Date(dateString);
                if (!block) return null;
                return (
                  <div key={slotId} className="p-2 bg-purple-200 rounded text-sm">
                    <div className="font-medium text-purple-900">
                      {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })} - {block.name}
                    </div>
                    <div className="text-purple-700 text-xs">{block.time_range}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (roomLoading) {
    console.log('Room is loading...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">방 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (roomError) {
    console.log('Room error:', roomError);
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">방 정보를 불러오는 중 오류가 발생했습니다.</div>
        <p className="text-gray-600">오류: {roomError.message}</p>
      </div>
    );
  }

  if (!room) {
    console.log('Room not found');
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">방을 찾을 수 없습니다.</div>
        <p className="text-gray-600">방 ID: {id}</p>
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
        {room.description && (
          <p className="text-gray-500 text-sm mt-2">{room.description}</p>
        )}
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
