import React, { useState, useRef } from 'react';

interface TimeRangeSelectorProps {
  selectedDates?: string[];
  onComplete: (settings: any) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedDates = [], onComplete }) => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  // props로 받은 selectedDates 사용
  React.useEffect(() => {
    if (selectedDates.length > 0) {
      const firstDate = new Date(selectedDates[0]);
      setCurrentWeekStart(firstDate);
    }
  }, [selectedDates]);

  // 주별 날짜 생성 (월요일 시작) - 선택된 날짜만
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
          dayName: ['월', '화', '수', '목', '금', '토', '일'][i],
          dayIndex: i
        });
      }
    }

    return dates;
  };

  // 시간 슬롯 생성 (0시-24시, 30분 단위)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isHour = minute === 0;
        
        // 시간 표시 형식 개선
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

  // 날짜와 시간으로 슬롯 ID 생성
  const getSlotId = (dateString: string, timeString: string) => {
    return `${dateString}|${timeString}`;
  };

  const handleMouseDown = (dateString: string, timeString: string) => {
    const slotId = getSlotId(dateString, timeString);
    const isSelected = selectedTimeSlots.has(slotId);
    
    setIsDragging(true);
    setDragMode(isSelected ? 'deselect' : 'select');
    
    const newSelected = new Set(selectedTimeSlots);
    if (isSelected) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedTimeSlots(newSelected);
  };

  const handleMouseEnter = (dateString: string, timeString: string) => {
    if (!isDragging) return;
    
    const slotId = getSlotId(dateString, timeString);
    const newSelected = new Set(selectedTimeSlots);
    
    if (dragMode === 'select') {
      newSelected.add(slotId);
    } else {
      newSelected.delete(slotId);
    }
    
    setSelectedTimeSlots(newSelected);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 모두 선택/해제 기능
  const handleSelectAll = () => {
    const allSlots = new Set<string>();
    weekDates.forEach(dateInfo => {
      timeSlots.forEach(slot => {
        allSlots.add(getSlotId(dateInfo.dateString, slot.time));
      });
    });
    setSelectedTimeSlots(allSlots);
  };

  const handleDeselectAll = () => {
    setSelectedTimeSlots(new Set());
  };

  const handleComplete = () => {
    if (selectedDates.length === 0) {
      alert('최소 하나의 날짜를 선택해주세요.');
      return;
    }

    if (selectedTimeSlots.size === 0) {
      alert('최소 하나의 시간대를 선택해주세요.');
      return;
    }

    console.log('TimeRangeSelector - selectedTimeSlots:', Array.from(selectedTimeSlots));

    // 날짜별로 시간대 그룹화
    const timeSlotsByDate: { [key: string]: string[] } = {};
    
    selectedTimeSlots.forEach(slotId => {
      console.log('Processing slotId:', slotId);
      const [dateString, timeString] = slotId.split('|');
      console.log('Split result:', { dateString, timeString });
      
      if (!timeSlotsByDate[dateString]) {
        timeSlotsByDate[dateString] = [];
      }
      timeSlotsByDate[dateString].push(timeString);
    });

    // 각 날짜의 시간대를 정렬
    Object.keys(timeSlotsByDate).forEach(date => {
      timeSlotsByDate[date].sort();
    });

    console.log('TimeRangeSelector - Final timeSlotsByDate:', timeSlotsByDate);

    const result = {
      type: 'time_range',
      selected_dates: selectedDates,
      time_slots_by_date: timeSlotsByDate,
      total_slots: selectedTimeSlots.size
    };

    console.log('TimeRangeSelector - Calling onComplete with:', result);
    onComplete(result);
  };

  const weekDates = generateWeekDates();
  const timeSlots = generateTimeSlots();

  if (selectedDates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        먼저 날짜를 선택해주세요.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 text-center">
        <p className="text-gray-600 mb-4">
          선택된 날짜들에서 참여자들이 선택할 수 있는 시간대를 설정하세요.
          <br />
          마우스를 누른 상태로 드래그하면 여러 시간대를 한번에 선택할 수 있습니다.
        </p>
        <div className="text-sm text-blue-600 mb-2">
          선택된 시간대: {selectedTimeSlots.size}개
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

          {/* 시간 그리드 - when2meet 스타일 */}
          <div 
            ref={gridRef}
            className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
                  const slotId = getSlotId(dateInfo.dateString, slot.time);
                  const isSelected = selectedTimeSlots.has(slotId);
                  
                  return (
                    <div
                      key={dateIndex}
                      className={`
                        h-6 border-r border-gray-200 last:border-r-0 cursor-pointer transition-colors
                        ${isSelected 
                          ? 'bg-green-400 hover:bg-green-500' 
                          : 'hover:bg-blue-100'
                        }
                      `}
                      onMouseDown={() => handleMouseDown(dateInfo.dateString, slot.time)}
                      onMouseEnter={() => handleMouseEnter(dateInfo.dateString, slot.time)}
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
          </div>

          {/* 선택된 시간대 요약 */}
          {selectedTimeSlots.size > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                선택된 시간대: {selectedTimeSlots.size}개
              </h4>
              <p className="text-sm text-green-700">
                참여자들은 각 날짜에서 선택된 시간대들 중에서 자신이 가능한 시간을 선택할 수 있습니다.
              </p>
            </div>
          )}

          {/* 완료 버튼 */}
          <div className="mt-6 text-center">
            <button
              onClick={handleComplete}
              disabled={selectedTimeSlots.size === 0}
              className={`
                py-3 px-8 rounded-lg font-semibold transition-colors
                ${selectedTimeSlots.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              시간 설정 완료 ({selectedTimeSlots.size}개 선택됨)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeRangeSelector;
