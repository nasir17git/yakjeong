import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="font-extrabold">약</span>속 결<span className="font-extrabold">정</span>을 쉽고 빠르게
        </h1>
        <p className="text-xl mb-8 opacity-90">
          참여자들의 가능한 시간을 수집하고 최적의 시간을 찾아보세요
        </p>
        <Link to="/create" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          새 방 만들기
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold mb-2">시간 기준 조율</h3>
          <p className="text-gray-600">24시간 중 가능한 시간대를 선택하여 최적의 시간을 찾습니다</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">📅</div>
          <h3 className="text-lg font-semibold mb-2">날짜 기준 조율</h3>
          <p className="text-gray-600">여러 날짜 중 가능한 날짜를 선택하여 모임 날짜를 정합니다</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">블럭 기준 조율</h3>
          <p className="text-gray-600">미리 설정된 시간 블럭 중에서 선택하여 효율적으로 조율합니다</p>
        </div>
      </div>

      {/* How to Use */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">사용 방법</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold mb-2">방 만들기</h3>
            <p className="text-gray-600 text-sm">
              새 방을 만들고 조율 방식을 선택하세요. 
              방이 생성되면 고유한 링크가 제공됩니다.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold mb-2">링크 공유</h3>
            <p className="text-gray-600 text-sm">
              생성된 방의 링크를 참여자들에게 공유하세요.
              각자 편한 시간에 응답할 수 있습니다.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold mb-2">결과 확인</h3>
            <p className="text-gray-600 text-sm">
              모든 응답이 수집되면 최적의 시간대를 
              자동으로 계산하여 보여드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 text-xl">🔒</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">개인정보 보호</h3>
            <p className="text-blue-800 text-sm">
              모든 방은 고유한 링크를 통해서만 접근할 수 있습니다. 
              링크를 알지 못하면 방에 접근할 수 없어 개인정보가 안전하게 보호됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
