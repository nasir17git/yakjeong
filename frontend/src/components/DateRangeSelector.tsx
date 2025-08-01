import React, { useState } from 'react';

interface DateRangeSelectorProps {
  onComplete: (settings: any) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onComplete }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 현재 월의 날짜들 생성
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 주의 시작을 일요일로

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) { // 6주 * 7일
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

  const handleDateClick = (dateString: string, isPast: boolean) => {
    if (isPast) return;

    setSelectedDates(prev => {
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

  const handleComplete = () => {
    if (selectedDates.length === 0) {
      alert('최소 하나의 날짜를 선택해주세요.');
      return;
    }

    onComplete({
      type: 'date_range',
      selected_dates: selectedDates
    });
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <p className="text-gray-600 mb-4">
          참여자들이 선택할 수 있는 날짜들을 클릭하여 선택하세요.
          <br />
          드래그로 여러 날짜를 한번에 선택할 수도 있습니다.
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

      {/* 완료 버튼 */}
      <button
        onClick={handleComplete}
        disabled={selectedDates.length === 0}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold transition-colors
          ${selectedDates.length > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        날짜 설정 완료 ({selectedDates.length}개 선택됨)
      </button>
    </div>
  );
};

export default DateRangeSelector;
