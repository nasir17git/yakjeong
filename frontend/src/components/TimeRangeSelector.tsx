import React, { useState, useRef } from 'react';

interface TimeRangeSelectorProps {
  onComplete: (settings: any) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);

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
      const isSelected = selectedDates.includes(dateString);

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

  const handleDateClick = (dateString: string, isPast: boolean) => {
    if (isPast) return;

    setSelectedDates(prev => {
      const newDates = prev.includes(dateString) 
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString].sort();
      
      return newDates;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateStepComplete = () => {
    if (selectedDates.length === 0) {
      alert('최소 하나의 날짜를 선택해주세요.');
      return;
    }
    
    // 선택된 날짜 중 첫 번째 날짜가 포함된 주로 설정
    const firstDate = new Date(selectedDates[0]);
    setCurrentWeekStart(firstDate);
    setStep('time');
    // 시간 선택 초기화
    setSelectedTimeSlots(new Set());
  };

  const handleBackToDateSelection = () => {
    setStep('date');
    setSelectedTimeSlots(new Set());
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
    return `${dateString}-${timeString}`;
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

    // 날짜별로 시간대 그룹화
    const timeSlotsByDate: { [key: string]: string[] } = {};
    
    selectedTimeSlots.forEach(slotId => {
      const [dateString, timeString] = slotId.split('-');
      if (!timeSlotsByDate[dateString]) {
        timeSlotsByDate[dateString] = [];
      }
      timeSlotsByDate[dateString].push(timeString);
    });

    // 각 날짜의 시간대를 정렬
    Object.keys(timeSlotsByDate).forEach(date => {
      timeSlotsByDate[date].sort();
    });

    onComplete({
      type: 'time_range',
      selected_dates: selectedDates,
      time_slots_by_date: timeSlotsByDate,
      total_slots: selectedTimeSlots.size
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDates = generateWeekDates();
  const timeSlots = generateTimeSlots();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜 선택 단계
  if (step === 'date') {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <p className="text-gray-600 mb-4">
            시간 조율을 진행할 날짜들을 선택하세요.
            <br />
            선택된 날짜들에 대해 시간대별 조율이 가능합니다.
          </p>
          <div className="text-sm text-blue-600">
            선택된 날짜: {selectedDates.length}개
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
        {selectedDates.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">선택된 날짜들:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedDates.map(dateString => (
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
          disabled={selectedDates.length === 0}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-colors
            ${selectedDates.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          다음: 시간대 선택 ({selectedDates.length}개 날짜)
        </button>
      </div>
    );
  }

  // 선택된 날짜가 있으면 시간 선택 그리드 표시
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
        <button
          onClick={handleBackToDateSelection}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 날짜 선택으로 돌아가기
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
