from typing import List, Dict, Any
from collections import defaultdict

class ScheduleOptimizer:
    def __init__(self, room_type: int):
        self.room_type = room_type
    
    async def find_optimal_times(self, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """최적의 시간대 찾기"""
        if not responses:
            return []
            
        if self.room_type == 1:  # 시간 기준
            return await self._optimize_hourly_schedule(responses)
        elif self.room_type == 2:  # 블럭 기준
            return await self._optimize_block_schedule(responses)
        else:  # 날짜 기준
            return await self._optimize_daily_schedule(responses)
    
    async def _optimize_hourly_schedule(self, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """시간 단위 최적화 알고리즘"""
        time_availability = defaultdict(list)
        
        # 각 참여자의 가능한 시간대 수집
        for response in responses:
            participant_name = response.get('participant_name', 'Unknown')
            available_times = response.get('response_data', {}).get('available_times', [])
            
            for time_slot in available_times:
                time_availability[time_slot].append(participant_name)
        
        # 참여 가능 인원수 기준으로 정렬
        optimal_times = []
        for time_slot, participants in time_availability.items():
            optimal_times.append({
                'time_slot': time_slot,
                'available_participants': participants,
                'participant_count': len(participants),
                'availability_rate': len(participants) / len(responses) if responses else 0
            })
        
        # 참여 가능 인원수 내림차순 정렬
        optimal_times.sort(key=lambda x: x['participant_count'], reverse=True)
        
        return optimal_times
    
    async def _optimize_block_schedule(self, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """블럭 단위 최적화 알고리즘"""
        block_availability = defaultdict(list)
        
        # 각 참여자의 가능한 블럭 수집
        for response in responses:
            participant_name = response.get('participant_name', 'Unknown')
            available_blocks = response.get('response_data', {}).get('available_blocks', [])
            
            for block in available_blocks:
                block_key = f"{block.get('date', '')}-{block.get('time_range', '')}"
                block_availability[block_key].append(participant_name)
        
        # 참여 가능 인원수 기준으로 정렬
        optimal_times = []
        for block_key, participants in block_availability.items():
            optimal_times.append({
                'time_slot': block_key,
                'available_participants': participants,
                'participant_count': len(participants),
                'availability_rate': len(participants) / len(responses) if responses else 0
            })
        
        optimal_times.sort(key=lambda x: x['participant_count'], reverse=True)
        
        return optimal_times
    
    async def _optimize_daily_schedule(self, responses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """날짜 단위 최적화 알고리즘"""
        date_availability = defaultdict(list)
        
        # 각 참여자의 가능한 날짜 수집
        for response in responses:
            participant_name = response.get('participant_name', 'Unknown')
            available_dates = response.get('response_data', {}).get('available_dates', [])
            
            for date in available_dates:
                date_availability[date].append(participant_name)
        
        # 참여 가능 인원수 기준으로 정렬
        optimal_times = []
        for date, participants in date_availability.items():
            optimal_times.append({
                'time_slot': date,
                'available_participants': participants,
                'participant_count': len(participants),
                'availability_rate': len(participants) / len(responses) if responses else 0
            })
        
        optimal_times.sort(key=lambda x: x['participant_count'], reverse=True)
        
        return optimal_times
