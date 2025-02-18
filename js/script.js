// script.js

// DOMContentLoaded 이벤트로 HTML 로딩 후 스크립트 실행
document.addEventListener('DOMContentLoaded', function() {
    // 1. Chart.js를 활용한 포트폴리오 가치 추이 차트 초기화
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    const portfolioChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: '포트폴리오 가치',
          data: [50000, 52000, 51000, 53000, 55000, 55000],
          backgroundColor: 'rgba(13, 110, 253, 0.2)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 2,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  
    // 2. FullCalendar를 활용한 주식 일정 달력 초기화
    var calendarEl = document.getElementById('calendarContainer');
    if (calendarEl) {
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
          {
            title: '실적 발표',
            start: '2025-03-15'
          },
          {
            title: '배당 지급',
            start: '2025-03-22'
          }
          // 추가 이벤트는 여기에 삽입
        ]
      });
      calendar.render();
    }
  
    // 3. 종목 관계 그래프 초기화 (플레이스홀더)
    // 여기에 D3.js, Cytoscape.js 등 원하는 라이브러리를 이용한 코드 작성 가능
    // 예시: document.getElementById('relationsGraph').innerText = '종목 관계 그래프가 여기에 표시됩니다.';
  });