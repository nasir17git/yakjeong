import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi, participantApi, responseApi } from '../services/api';
import { ROOM_TYPE_LABELS, ROOM_TYPES } from '../types';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<'optimal' | 'responses'>('optimal');
  const queryClient = useQueryClient();

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getRoom(id!),
    enabled: !!id,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['participants', id],
    queryFn: () => participantApi.getParticipantsByRoom(id!),
    enabled: !!id,
  });

  const { data: optimalTimes, isLoading: optimalLoading, refetch: refetchOptimalTimes } = useQuery({
    queryKey: ['optimal-times', id],
    queryFn: () => roomApi.getOptimalTimes(id!),
    enabled: !!id,
  });

  // 각 참여자의 모든 응답 데이터 가져오기 (이름별로 그룹화)
  const participantResponses = useQuery({
    queryKey: ['participant-responses', id, participants],
    queryFn: async () => {
      if (!participants || participants.length === 0) return [];
      
      // 이름별로 참여자들을 그룹화
      const participantsByName = participants.reduce((acc, participant) => {
        if (!acc[participant.name]) {
          acc[participant.name] = [];
        }
        acc[participant.name].push(participant);
        return acc;
      }, {} as Record<string, typeof participants>);

      const groupedResponses = await Promise.all(
        Object.entries(participantsByName).map(async ([name, participantGroup]) => {
          try {
            // 해당 이름의 모든 참여자들의 응답을 수집
            const allResponses = [];
            for (const participant of participantGroup) {
              const participantResponses = await responseApi.getResponsesByParticipant(participant.id);
              allResponses.push(...participantResponses);
            }
            
            // 버전별로 정렬 (최신 버전이 먼저)
            const sortedResponses = allResponses.sort((a, b) => b.version - a.version);
            
            return {
              name,
              participantGroup,
              responses: sortedResponses,
              hasResponse: sortedResponses.length > 0,
              activeResponse: sortedResponses.find(r => r.is_active) || null,
              // 첫 번째 참여 시간 (가장 오래된 참여자 기준)
              firstParticipationTime: Math.min(...participantGroup.map(p => new Date(p.created_at).getTime()))
            };
          } catch (error) {
            console.error(`Error fetching responses for ${name}:`, error);
            return {
              name,
              participantGroup,
              responses: [],
              hasResponse: false,
              activeResponse: null,
              firstParticipationTime: Math.min(...participantGroup.map(p => new Date(p.created_at).getTime()))
            };
          }
        })
      );
      
      // 첫 참여 시간 순으로 정렬
      return groupedResponses.sort((a, b) => a.firstParticipationTime - b.firstParticipationTime);
    },
    enabled: !!participants && participants.length > 0,
  });

  // 응답 활성화 뮤테이션
  const activateResponseMutation = useMutation({
    mutationFn: responseApi.activateResponse,
    onSuccess: () => {
      // 관련 쿼리들 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['participant-responses', id] });
      refetchOptimalTimes();
    },
    onError: (error) => {
      console.error('응답 활성화 실패:', error);
      alert('응답 활성화에 실패했습니다.');
    },
  });

  const handleActivateResponse = (responseId: string) => {
    activateResponseMutation.mutate(responseId);
  };

  if (roomLoading || participantsLoading || optimalLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">방을 찾을 수 없습니다.</div>
        <Link to="/" className="btn-primary">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  // 고유한 이름 기준으로 카운트
  const uniqueParticipantNames = new Set(participants?.map(p => p.name) || []).size;
  const respondedParticipants = participantResponses.data?.filter(p => p.activeResponse).length || 0;

  // 시간대별 응답 현황 렌더링 함수
  const renderTimeSlotResponses = (responseData: any) => {
    if (!responseData) return <span className="text-gray-400">응답 없음</span>;

    // 디버깅용 로그
    console.log('renderTimeSlotResponses - responseData:', responseData);
    console.log('renderTimeSlotResponses - room.room_type:', room.room_type);

    // 실제 응답 데이터 구조에 맞게 처리
    let availableItems: string[] = [];

    if (room.room_type === ROOM_TYPES.HOURLY) {
      // 시간 기준 - available_time_slots Set/Array에서 시간 추출
      console.log('Processing HOURLY type, available_time_slots:', responseData.available_time_slots);
      
      if (responseData.available_time_slots) {
        let timeSlots: string[] = [];
        
        // Set이 빈 객체로 직렬화된 경우 처리
        if (typeof responseData.available_time_slots === 'object' && 
            !Array.isArray(responseData.available_time_slots) &&
            Object.keys(responseData.available_time_slots).length === 0) {
          console.log('Empty Set detected, no time slots available');
          return <span className="text-gray-400">가능한 시간 없음</span>;
        }
        
        if (Array.isArray(responseData.available_time_slots)) {
          timeSlots = responseData.available_time_slots;
        } else if (responseData.available_time_slots instanceof Set) {
          timeSlots = Array.from(responseData.available_time_slots);
        } else if (typeof responseData.available_time_slots === 'object') {
          // 객체 형태인 경우 키를 추출
          timeSlots = Object.keys(responseData.available_time_slots);
        }

        console.log('Extracted timeSlots:', timeSlots);

        if (timeSlots.length === 0) {
          return <span className="text-gray-400">가능한 시간 없음</span>;
        }

        // 날짜|시간 형태에서 시간만 추출하고 중복 제거
        const uniqueTimes = new Set<string>();
        timeSlots.forEach((slotId: string) => {
          if (typeof slotId === 'string' && slotId.includes('|')) {
            const [_, timeString] = slotId.split('|');
            uniqueTimes.add(timeString);
          } else if (typeof slotId === 'string') {
            // 직접 시간 문자열인 경우
            uniqueTimes.add(slotId);
          }
        });

        console.log('Unique times:', Array.from(uniqueTimes));

        availableItems = Array.from(uniqueTimes)
          .sort()
          .map((time: string) => {
            // "07:00" 형태를 "7:00"로 변환
            if (time.includes(':')) {
              const [hour, minute] = time.split(':');
              const hourNum = parseInt(hour);
              return minute === '00' ? `${hourNum}시` : `${hourNum}:${minute}`;
            }
            return time;
          })
          .slice(0, 5); // 처음 5개만 표시
      } else if (responseData.available_times && Array.isArray(responseData.available_times)) {
        // 이전 구조 지원
        availableItems = responseData.available_times
          .map((time: string) => {
            const hour = parseInt(time.split(':')[0]);
            return `${hour}시`;
          })
          .slice(0, 5);
      } else if (typeof responseData === 'object') {
        // 기존 형태 {7: true, 8: true} 지원
        availableItems = Object.entries(responseData)
          .filter(([_, available]) => available)
          .map(([hour, _]) => `${hour}시`)
          .slice(0, 5);
      }

      if (availableItems.length === 0) {
        return <span className="text-gray-400">가능한 시간 없음</span>;
      }

      const totalCount = responseData.available_time_slots ? 
                        (Array.isArray(responseData.available_time_slots) ? responseData.available_time_slots.length : responseData.available_time_slots.size) :
                        responseData.available_times ? responseData.available_times.length : 
                        Object.keys(responseData).filter(hour => responseData[hour]).length;

      return (
        <div className="flex flex-wrap gap-1">
          {availableItems.map((time, index) => (
            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              {time}
            </span>
          ))}
          {totalCount > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{totalCount - 5}개
            </span>
          )}
        </div>
      );
    } else if (room.room_type === ROOM_TYPES.DAILY) {
      // 날짜 기준
      if (responseData.available_dates && Array.isArray(responseData.available_dates)) {
        availableItems = responseData.available_dates
          .map((date: string) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }))
          .slice(0, 3);
      } else if (typeof responseData === 'object') {
        availableItems = Object.entries(responseData)
          .filter(([_, available]) => available)
          .map(([date, _]) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }))
          .slice(0, 3);
      }

      if (availableItems.length === 0) {
        return <span className="text-gray-400">가능한 날짜 없음</span>;
      }

      const totalCount = responseData.available_dates ? responseData.available_dates.length : 
                        Object.keys(responseData).filter(date => responseData[date]).length;

      return (
        <div className="flex flex-wrap gap-1">
          {availableItems.map((date, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {date}
            </span>
          ))}
          {totalCount > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{totalCount - 3}개
            </span>
          )}
        </div>
      );
    } else if (room.room_type === ROOM_TYPES.BLOCK) {
      // 블럭 기준 - 새로운 데이터 구조 (available_block_slots) 지원
      console.log('Processing BLOCK type, available_block_slots:', responseData.available_block_slots);
      
      if (responseData.available_block_slots) {
        // Set이 빈 객체로 직렬화된 경우 처리
        if (typeof responseData.available_block_slots === 'object' && 
            !Array.isArray(responseData.available_block_slots) &&
            Object.keys(responseData.available_block_slots).length === 0) {
          console.log('Empty Set detected for blocks, no block slots available');
          return <span className="text-gray-400">가능한 블럭 없음</span>;
        }

        let blockSlots: string[] = [];
        
        if (Array.isArray(responseData.available_block_slots)) {
          blockSlots = responseData.available_block_slots;
        } else if (typeof responseData.available_block_slots === 'object') {
          // 객체 형태인 경우 키를 추출
          blockSlots = Object.keys(responseData.available_block_slots);
        }

        console.log('Extracted blockSlots:', blockSlots);

        if (blockSlots.length === 0) {
          return <span className="text-gray-400">가능한 블럭 없음</span>;
        }

        // 새로운 구조: 날짜-블럭 조합 배열
        const blockSlotMap = new Map<string, Set<string>>();
        
        blockSlots.forEach((slotId: string) => {
          if (typeof slotId === 'string') {
            // slotId 형태: "2025-08-09-movie_a_2" -> 마지막 '-'를 기준으로 분리
            const lastDashIndex = slotId.lastIndexOf('-');
            if (lastDashIndex > 0) {
              const dateString = slotId.substring(0, lastDashIndex);
              const blockId = slotId.substring(lastDashIndex + 1);
              
              if (!blockSlotMap.has(blockId)) {
                blockSlotMap.set(blockId, new Set());
              }
              blockSlotMap.get(blockId)!.add(dateString);
            }
          }
        });

        console.log('Block slot map:', blockSlotMap);

        availableItems = Array.from(blockSlotMap.keys())
          .map((blockId: string) => {
            const settings = room.settings;
            if (settings && settings.time_blocks) {
              const block = settings.time_blocks.find((b: any) => b.id === blockId);
              const dates = blockSlotMap.get(blockId)!;
              return block ? `${block.name} (${dates.size}일)` : `${blockId} (${dates.size}일)`;
            }
            return blockId;
          })
          .slice(0, 3);
      } else if (responseData.available_blocks && Array.isArray(responseData.available_blocks)) {
        // 이전 구조: 블럭 ID 배열
        availableItems = responseData.available_blocks
          .map((blockId: string) => {
            const settings = room.settings;
            if (settings && settings.time_blocks) {
              const block = settings.time_blocks.find((b: any) => b.id === blockId);
              return block ? block.name : blockId;
            }
            return blockId;
          })
          .slice(0, 3);
      } else if (typeof responseData === 'object') {
        // 객체 형태의 이전 구조
        availableItems = Object.entries(responseData)
          .filter(([_, available]) => available)
          .map(([blockId, _]) => {
            const settings = room.settings;
            if (settings && settings.time_blocks) {
              const block = settings.time_blocks.find((b: any) => b.id === blockId);
              return block ? block.name : blockId;
            }
            return blockId;
          })
          .slice(0, 3);
      }

      if (availableItems.length === 0) {
        return <span className="text-gray-400">가능한 블럭 없음</span>;
      }

      const totalCount = responseData.available_block_slots ? responseData.available_block_slots.length : 
                        responseData.available_blocks ? responseData.available_blocks.length :
                        Object.keys(responseData).filter(block => responseData[block]).length;

      return (
        <div className="flex flex-wrap gap-1">
          {availableItems.map((block, index) => (
            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
              {block}
            </span>
          ))}
          {totalCount > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{totalCount - 3}개
            </span>
          )}
        </div>
      );
    }

    return <span className="text-gray-400">알 수 없는 형식</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
            <p className="text-gray-600">일정 조율 결과</p>
            {room.description && (
              <p className="text-gray-500 mt-1">{room.description}</p>
            )}
          </div>
          <Link to={`/room/${id}`} className="btn-secondary">
            방 정보 보기
          </Link>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{uniqueParticipantNames}</div>
          <div className="text-gray-600">총 참여자</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{respondedParticipants}</div>
          <div className="text-gray-600">응답 완료</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {optimalTimes?.length || 0}
          </div>
          <div className="text-gray-600">가능한 시간대</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {uniqueParticipantNames > 0 ? Math.round((respondedParticipants / uniqueParticipantNames) * 100) : 0}%
          </div>
          <div className="text-gray-600">응답률</div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('optimal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'optimal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              최적 시간대
            </button>
            <button
              onClick={() => setSelectedTab('responses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'responses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              참여자별 응답 현황
            </button>
          </nav>
        </div>
      </div>

      {/* 최적 시간대 탭 */}
      {selectedTab === 'optimal' && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">최적 시간대</h2>
          
          {optimalTimes && optimalTimes.length > 0 ? (
            <div className="space-y-3">
              {optimalTimes.slice(0, 10).map((timeSlot, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    index === 0
                      ? 'bg-green-50 border-green-200'
                      : index < 3
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-green-600 text-white'
                            : index < 3
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{timeSlot.time_slot}</div>
                        <div className="text-sm text-gray-600">
                          참여 가능: {timeSlot.participant_count}명 ({Math.round(timeSlot.availability_rate * 100)}%)
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        최적
                      </div>
                    )}
                  </div>
                  
                  {/* 참여 가능한 사람들 */}
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-2">참여 가능한 사람:</div>
                    <div className="flex flex-wrap gap-2">
                      {timeSlot.available_participants.map((name, nameIndex) => (
                        <span
                          key={nameIndex}
                          className="px-2 py-1 bg-white border rounded text-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {uniqueParticipantNames === 0
                ? '아직 참여자가 없습니다.'
                : respondedParticipants === 0
                ? '아직 응답한 참여자가 없습니다.'
                : '공통으로 가능한 시간대가 없습니다.'}
            </div>
          )}
        </div>
      )}

      {/* 참여자별 응답 현황 탭 */}
      {selectedTab === 'responses' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">참여자별 응답 현황</h2>
          
          {participantResponses.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : participantResponses.data && participantResponses.data.length > 0 ? (
            <div className="space-y-6">
              {participantResponses.data.map((item, index) => (
                <div key={`${item.name}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium text-lg">{item.name}</span>
                        <div className="text-sm text-gray-500">
                          {new Date(item.firstParticipationTime).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} 참여
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.hasResponse 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.hasResponse ? '응답 완료' : '응답 대기'}
                    </div>
                  </div>
                  
                  {/* 응답 버전들 */}
                  {item.hasResponse && item.responses.length > 0 ? (
                    <div className="ml-11 space-y-4">
                      {/* 버전 선택 버튼들 */}
                      {item.responses.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-sm text-gray-600 mr-2">버전 선택:</span>
                          {item.responses.map((response) => (
                            <button
                              key={response.id}
                              onClick={() => handleActivateResponse(response.id)}
                              disabled={activateResponseMutation.isPending}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                response.is_active
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } ${activateResponseMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              v{response.version}
                              <span className="ml-1 text-xs opacity-75">
                                ({new Date(response.updated_at).toLocaleDateString('ko-KR', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })})
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* 활성화된 응답 내용 */}
                      {item.activeResponse ? (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">
                            가능한 시간 {item.responses.length > 1 && (
                              <span className="text-blue-600 font-medium">(v{item.activeResponse.version})</span>
                            )}:
                          </div>
                          {renderTimeSlotResponses(item.activeResponse.response_data)}
                          <div className="text-xs text-gray-400 mt-2">
                            마지막 수정: {new Date(item.activeResponse.updated_at).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">활성화된 응답이 없습니다.</div>
                      )}
                    </div>
                  ) : (
                    <div className="ml-11 text-gray-400 text-sm">아직 응답하지 않았습니다.</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 참여자가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 공유 및 추가 참여 */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-3">더 많은 사람들을 초대하세요</h3>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={`${window.location.origin}/room/${id}/participate`}
            readOnly
            className="input-field flex-1"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/room/${id}/participate`);
              alert('참여 링크가 복사되었습니다!');
            }}
            className="btn-secondary"
          >
            복사
          </button>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/room/${id}/participate`}
            className="btn-primary"
          >
            직접 참여하기
          </Link>
          <Link
            to={`/room/${id}`}
            className="btn-secondary"
          >
            방 정보 보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
