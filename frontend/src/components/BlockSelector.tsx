import React, { useState } from 'react';
import { TimeBlock } from '../types';

interface BlockSelectorProps {
  step?: 'date' | 'block' | 'grid';
  selectedDates?: string[];
  blocks?: TimeBlock[];
  onComplete: (settings: any) => void;
}

const BlockSelector: React.FC<BlockSelectorProps> = ({ 
  step = 'date', 
  selectedDates = [], 
  blocks: initialBlocks = [], 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(step);
  const [selectedDatesState, setSelectedDatesState] = useState<string[]>(selectedDates);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedBlockSlots, setSelectedBlockSlots] = useState<Set<string>>(new Set());
  const [blocks, setBlocks] = useState<TimeBlock[]>(
    initialBlocks.length > 0 ? initialBlocks : [
      { id: 'movie_a_2', name: '영화A-2회차', time_range: '11:30-13:00', memo: 'CGV용산' },
      { id: 'movie_a_3', name: '영화A-3회차', time_range: '14:00-15:30', memo: 'CGV용산' },
      { id: 'movie_a_5', name: '영화A-5회차', time_range: '18:00-19:30', memo: 'CGV용산' },
      { id: 'movie_a_6', name: '영화A-6회차', time_range: '20:00-21:30', memo: 'CGV용산' },
    ]
  );

  // step이 변경되면 currentStep 업데이트
  React.useEffect(() => {
    setCurrentStep(step);
  }, [step]);

  // selectedDates가 변경되면 상태 업데이트
  React.useEffect(() => {
    setSelectedDatesState(selectedDates);
    if (selectedDates.length > 0) {
      const firstDate = new Date(selectedDates[0]);
      setCurrentWeekStart(firstDate);
    }
  }, [selectedDates]);

  // 현재 월의 날짜들 생성
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isSelected = selectedDatesState.includes(dateString);

      days.push({
        date,
        dateString,
        isCurrentMonth,
        isPast,
        isSelected,
        day: date.getDate()
      });
    }

    return days;
  };

  // 주별 날짜 생성 (월요일 시작)
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
      
      if (selectedDatesState.includes(dateString)) {
        dates.push({
          date,
          dateString,
          dayName: ['월', '화', '수', '목', '금', '토', '일'][i]
        });
      }
    }

    return dates;
  };

  const handleDateClick = (dateString: string, isPast: boolean) => {
    if (isPast) return;

    setSelectedDatesState(prev => {
      if (prev.includes(dateString)) {
        return prev.filter(d => d !== dateString);
      } else {
        return [...prev, dateString].sort();
      }
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
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

  const handleDateStepComplete = () => {
    if (selectedDatesState.length === 0) {
      alert('최소 하나의 날짜를 선택해주세요.');
      return;
    }
    
    onComplete({
      type: 'date_selection',
      selected_dates: selectedDatesState
    });
  };

  const handleBlockStepComplete = () => {
    // 빈 블럭 검증
    for (const block of blocks) {
      if (!block.name.trim() || !block.time_range.trim()) {
        alert('모든 블럭의 이름과 시간대를 입력해주세요.');
        return;
      }
    }

    if (blocks.length === 0) {
      alert('최소 하나의 블럭을 추가해주세요.');
      return;
    }

    onComplete({
      type: 'block_settings',
      time_blocks: blocks
    });
  };

  const addBlock = () => {
    const newBlock: TimeBlock = {
      id: `block_${Date.now()}`,
      name: '',
      time_range: '',
      memo: '',
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, field: keyof TimeBlock, value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
  };

  const removeBlock = (index: number) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((_, i) => i !== index));
    }
  };

  const resetToDefault = () => {
    setBlocks([
      { id: 'movie_a_2', name: '영화A-2회차', time_range: '11:30-13:00', memo: 'CGV용산' },
      { id: 'movie_a_3', name: '영화A-3회차', time_range: '14:00-15:30', memo: 'CGV용산' },
      { id: 'movie_a_5', name: '영화A-5회차', time_range: '18:00-19:30', memo: 'CGV용산' },
      { id: 'movie_a_6', name: '영화A-6회차', time_range: '20:00-21:30', memo: 'CGV용산' },
    ]);
  };

  const setMealPreset = () => {
    setBlocks([
      { id: 'lunch', name: '점심식사', time_range: '12:00-14:00', memo: '' },
      { id: 'dinner', name: '저녁식사', time_range: '18:00-20:00', memo: '' },
      { id: 'drink', name: '술약속', time_range: '21:00-23:00', memo: '' },
    ]);
  };

  const setTimeSlotPreset = () => {
    setBlocks([
      { id: 'morning', name: '아침', time_range: '06:00-10:00', memo: '' },
      { id: 'forenoon', name: '오전', time_range: '10:00-12:00', memo: '' },
      { id: 'afternoon', name: '오후', time_range: '14:00-18:00', memo: '' },
      { id: 'evening', name: '저녁', time_range: '20:00-23:00', memo: '' },
      { id: 'night', name: '심야', time_range: '23:00-01:00', memo: '' },
    ]);
  };

  const getSlotId = (dateIndex: number, blockIndex: number) => {
    return `${dateIndex}-${blockIndex}`;
  };

  const handleBlockSlotClick = (dateIndex: number, blockIndex: number) => {
    const slotId = getSlotId(dateIndex, blockIndex);
    const newSelected = new Set(selectedBlockSlots);
    
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    
    setSelectedBlockSlots(newSelected);
  };

  const handleComplete = () => {
    if (selectedBlockSlots.size === 0) {
      alert('최소 하나의 블럭을 선택해주세요.');
      return;
    }

    const weekDates = generateWeekDates();
    const blockSlotsByDate: { [key: string]: string[] } = {};
    
    selectedBlockSlots.forEach(slotId => {
      const [dateIndex, blockIndex] = slotId.split('-').map(Number);
      if (weekDates[dateIndex] && blocks[blockIndex]) {
        const date = weekDates[dateIndex].dateString;
        const blockId = blocks[blockIndex].id;
        
        if (!blockSlotsByDate[date]) {
          blockSlotsByDate[date] = [];
        }
        blockSlotsByDate[date].push(blockId);
      }
    });

    onComplete({
      type: 'custom_blocks',
      selected_dates: selectedDatesState,
      time_blocks: blocks,
      block_slots_by_date: blockSlotsByDate,
      use_custom_blocks: true
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDates = generateWeekDates();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  if (currentStep === 'date') {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-4">
            블럭 조율을 진행할 날짜들을 선택하세요.
            <br />
            선택된 날짜들에 대해 블럭별 조율이 가능합니다.
          </p>
          <div className="text-sm text-blue-600">
            선택된 날짜: {selectedDatesState.length}개
          </div>
        </div>

        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold">
            {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day.dateString, day.isPast)}
              disabled={day.isPast}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                ${!day.isCurrentMonth 
                  ? 'text-gray-300 cursor-default' 
                  : day.isPast 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : day.isSelected
                      ? 'bg-green-500 text-white font-semibold shadow-md'
                      : 'hover:bg-blue-100 text-gray-700'
                }
              `}
            >
              {day.day}
            </button>
          ))}
        </div>

        {/* 선택된 날짜 미리보기 */}
        {selectedDatesState.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">선택된 날짜들:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedDatesState.map(dateString => (
                <span
                  key={dateString}
                  className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm"
                >
                  {new Date(dateString).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 다음 단계 버튼 */}
        <button
          onClick={handleDateStepComplete}
          disabled={selectedDatesState.length === 0}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-colors
            ${selectedDatesState.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          다음: 블럭 설정 ({selectedDatesState.length}개 날짜)
        </button>
      </div>
    );
  }

  if (currentStep === 'block') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-4">
            선택된 날짜들에서 참여자들이 선택할 수 있는 시간 블럭들을 설정하세요.
            <br />
            영화 상영시간, 회의실 예약 시간 등 구체적인 옵션들을 만들 수 있습니다.
          </p>
          <div className="text-sm text-blue-600">
            총 {blocks.length}개의 블럭
          </div>
        </div>

        {/* 프리셋 버튼들 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={resetToDefault}
            className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            🎬 영화
          </button>
          <button
            onClick={setMealPreset}
            className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            🍽️ 식사
          </button>
          <button
            onClick={setTimeSlotPreset}
            className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            ⏰ 주요시간
          </button>
        </div>

        {/* 블럭 예시 미리보기 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-3">📋 참여자에게 보여질 블럭 예시:</h4>
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <div key={block.id} className="p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{block.name || `블럭 ${index + 1}`}</div>
                    <div className="text-sm text-gray-600 mt-1">{block.time_range || '시간대 미설정'}</div>
                    {block.memo && (
                      <div className="text-sm text-gray-500 mt-1">{block.memo}</div>
                    )}
                  </div>
                  <div className="text-gray-400 text-xl">☐</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-blue-700 mt-3">
            참여자들은 이런 형태로 블럭들을 보고 선택할 수 있습니다.
          </p>
        </div>

        {/* 블럭 목록 */}
        <div className="space-y-4 mb-6">
          {blocks.map((block, index) => (
            <div key={block.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">블럭 {index + 1}</h4>
                {blocks.length > 1 && (
                  <button
                    onClick={() => removeBlock(index)}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                  >
                    🗑️ 삭제
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    블럭 이름 *
                  </label>
                  <input
                    type="text"
                    value={block.name}
                    onChange={(e) => updateBlock(index, 'name', e.target.value)}
                    className="input-field text-sm"
                    placeholder="예: 영화A-2회차, 오전 회의"
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
                    onChange={(e) => updateBlock(index, 'time_range', e.target.value)}
                    className="input-field text-sm"
                    placeholder="예: 11:30-13:00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  추가 정보 (선택사항)
                </label>
                <input
                  type="text"
                  value={block.memo || ''}
                  onChange={(e) => updateBlock(index, 'memo', e.target.value)}
                  className="input-field text-sm"
                  placeholder="예: CGV용산, 3층 회의실"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 블럭 추가 버튼 */}
        <div className="flex justify-center mb-6">
          <button
            onClick={addBlock}
            className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          >
            ➕ 블럭 추가
          </button>
        </div>

        {/* 다음 단계 버튼 */}
        <div className="text-center">
          <button
            onClick={handleBlockStepComplete}
            disabled={blocks.length === 0}
            className={`
              py-3 px-8 rounded-lg font-semibold transition-colors
              ${blocks.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            다음: 날짜별 블럭 선택 ({blocks.length}개 블럭)
          </button>
        </div>
      </div>
    );
  }

  // 날짜별 블럭 선택 단계 (step === 'grid')
  if (currentStep === 'grid') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-4">
            각 날짜별로 참여자들이 선택할 수 있는 블럭들을 설정하세요.
            <br />
            체크된 블럭들만 해당 날짜에 표시됩니다.
          </p>
          <div className="text-sm text-blue-600">
            선택된 블럭 슬롯: {selectedBlockSlots.size}개
          </div>
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
            {/* 블럭 그리드 */}
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
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
              {blocks.map((block, blockIndex) => (
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
                  {weekDates.map((_, dateIndex) => {
                    const slotId = getSlotId(dateIndex, blockIndex);
                    const isSelected = selectedBlockSlots.has(slotId);
                    
                    return (
                      <div
                        key={dateIndex}
                        className="p-3 border-r border-gray-200 last:border-r-0 flex items-center justify-center"
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBlockSlotClick(dateIndex, blockIndex)}
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
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 선택된 블럭 요약 */}
            {selectedBlockSlots.size > 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">
                  선택된 블럭 슬롯: {selectedBlockSlots.size}개
                </h4>
                <p className="text-sm text-purple-700">
                  참여자들은 각 날짜에서 선택된 블럭들 중에서 자신이 가능한 블럭을 선택할 수 있습니다.
                </p>
              </div>
            )}

            {/* 완료 버튼 */}
            <div className="mt-6 text-center">
              <button
                onClick={handleComplete}
                disabled={selectedBlockSlots.size === 0}
                className={`
                  py-3 px-8 rounded-lg font-semibold transition-colors
                  ${selectedBlockSlots.size > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                블럭 설정 완료 ({selectedBlockSlots.size}개 선택됨)
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 기본 렌더링 (잘못된 단계)
  return (
    <div className="text-center py-8 text-gray-500">
      잘못된 단계입니다.
    </div>
  );
};

export default BlockSelector;
