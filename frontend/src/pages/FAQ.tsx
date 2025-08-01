import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      category: '일반',
      question: 'YakJeong은 무엇인가요?',
      answer: 'YakJeong(약정)은 여러 사람의 일정을 조율하여 최적의 시간을 찾아주는 웹 서비스입니다. 회의, 모임, 약속 등의 시간을 정할 때 참여자들의 가능한 시간을 수집하고 분석하여 가장 많은 사람이 참여할 수 있는 시간을 제안합니다.'
    },
    {
      category: '사용법',
      question: '어떻게 방을 만들 수 있나요?',
      answer: '홈페이지에서 조율 방식(날짜/시간/블럭)을 선택한 후, 시간대를 설정하고 방 제목과 생성자 이름을 입력하면 됩니다. 방이 생성되면 참여자들에게 공유할 수 있는 링크가 제공됩니다.'
    },
    {
      category: '사용법',
      question: '3가지 조율 방식의 차이점은 무엇인가요?',
      answer: '• 날짜 기준: 여러 날짜 중 가능한 날짜를 선택 (예: 회의 날짜 정하기)\n• 시간 기준: 특정 기간 내 시간대별로 가능한 시간 선택 (예: 일주일 중 회의 시간 정하기)\n• 블럭 기준: 미리 정의된 시간 블럭 중 선택 (예: 영화 상영시간, 강의 시간)'
    },
    {
      category: '참여',
      question: '참여자는 어떻게 응답하나요?',
      answer: '방 생성자가 공유한 참여 링크를 클릭하면 응답 페이지로 이동합니다. 이름을 입력하고 자신이 가능한 시간대를 선택한 후 제출하면 됩니다. 별도의 회원가입이나 로그인은 필요하지 않습니다.'
    },
    {
      category: '참여',
      question: '같은 이름으로 여러 번 응답할 수 있나요?',
      answer: '네, 가능합니다. 같은 이름으로 여러 번 응답하면 각각 v1, v2, v3... 형태로 버전이 생성됩니다. 결과 페이지에서 원하는 버전을 선택하여 최적 시간 계산에 반영할 수 있습니다.'
    },
    {
      category: '결과',
      question: '최적 시간은 어떻게 계산되나요?',
      answer: '모든 참여자의 응답을 분석하여 가장 많은 사람이 참여 가능한 시간순으로 정렬합니다. 각 시간대별로 참여 가능한 인원수와 참여율(%)이 표시되며, 참여 가능한 사람들의 이름도 확인할 수 있습니다.'
    },
    {
      category: '결과',
      question: '결과는 실시간으로 업데이트되나요?',
      answer: '네, 새로운 참여자가 응답하거나 기존 참여자가 응답을 수정하면 결과 페이지의 최적 시간대가 실시간으로 업데이트됩니다.'
    },
    {
      category: '보안',
      question: '개인정보는 안전한가요?',
      answer: '네, 안전합니다. 모든 방은 고유한 링크를 통해서만 접근할 수 있으며, 링크를 모르면 방에 접근할 수 없습니다. 생성된 방의 공개 목록도 없어 개인정보가 보호됩니다.'
    },
    {
      category: '관리',
      question: '생성된 일정을 지우고 싶어요!',
      answer: '응답 마감 후 30일 내에 자동으로 지워집니다. 별도의 수동 삭제 기능은 제공하지 않으며, 개인정보 보호를 위해 일정 기간 후 자동으로 모든 데이터가 삭제됩니다.'
    },
    {
      category: '관리',
      question: '응답 마감일을 변경할 수 있나요?',
      answer: '현재는 방 생성 시에만 마감일을 설정할 수 있습니다. 방 생성 후에는 마감일을 변경할 수 없으니, 생성 시 신중하게 설정해주세요.'
    },
    {
      category: '기술',
      question: '모바일에서도 사용할 수 있나요?',
      answer: '네, YakJeong은 모바일 최적화되어 있어 스마트폰과 태블릿에서도 편리하게 사용할 수 있습니다. 터치 드래그로 시간대를 선택하는 등 모바일 친화적인 인터페이스를 제공합니다.'
    },
    {
      category: '기술',
      question: '어떤 브라우저에서 사용할 수 있나요?',
      answer: 'Chrome, Firefox, Safari, Edge 등 모든 최신 브라우저에서 사용할 수 있습니다. 인터넷 익스플로러는 지원하지 않습니다.'
    },
    {
      category: '문제해결',
      question: '방에 접근할 수 없어요.',
      answer: '링크가 정확한지 확인해주세요. 링크가 정확하다면 방이 삭제되었거나 비활성화되었을 수 있습니다. 방 생성자에게 새로운 링크를 요청해보세요.'
    },
    {
      category: '문제해결',
      question: '응답이 제출되지 않아요.',
      answer: '이름을 입력했는지, 최소 하나의 시간대를 선택했는지 확인해주세요. 네트워크 연결 상태도 확인하고, 문제가 지속되면 페이지를 새로고침한 후 다시 시도해보세요.'
    }
  ];

  const categories = ['전체', ...Array.from(new Set(faqData.map(item => item.category)))];
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredFAQ = selectedCategory === '전체' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          자주 묻는 질문 <span className="text-blue-600">FAQ</span>
        </h1>
        <p className="text-xl text-gray-600">
          YakJeong 사용 중 궁금한 점들을 확인해보세요
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ 목록 */}
      <div className="space-y-4">
        {filteredFAQ.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleOpen(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {item.category}
                </span>
                <h3 className="font-semibold text-gray-900">{item.question}</h3>
              </div>
              <div className={`transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {openIndex === index && (
              <div className="px-6 pb-4">
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 추가 도움말 */}
      <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          더 궁금한 점이 있으신가요?
        </h2>
        <p className="text-blue-800 mb-6">
          위 FAQ에서 답을 찾지 못하셨다면, 아래 방법으로 문의해주세요.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-semibold text-gray-900 mb-2">이메일 문의</h3>
            <p className="text-gray-600 text-sm">
              support@yakjeong.com으로<br />
              언제든지 문의해주세요
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-2">GitHub Issues</h3>
            <p className="text-gray-600 text-sm">
              버그 신고나 기능 제안은<br />
              GitHub Issues를 이용해주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
