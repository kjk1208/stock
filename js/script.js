// js/script.js

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
          // 추가 이벤트는 여기에 삽입 가능
        ]
      });
      calendar.render();
    }
  
    // 3. 종목 관계 그래프 초기화 (플레이스홀더)
    // 여기에 D3.js, Cytoscape.js 등의 라이브러리를 이용한 코드를 추가할 수 있습니다.
    // 예: document.getElementById('relationsGraph').innerText = '종목 관계 그래프가 여기에 표시됩니다.';
  
    // 4. 실시간 미국 주식 데이터 불러오기
    async function fetchLiveStockData() {
      // 사용하고자 하는 API (예: Finnhub) 사용, 반드시 유효한 API 토큰으로 교체할 것!
      const symbols = ['AAPL', 'AMZN', 'GOOGL', 'MSFT', 'TSLA'];
      const tableBody = document.getElementById('liveStockTableBody');
      tableBody.innerHTML = ''; // 기존 데이터를 초기화
  
      for (const symbol of symbols) {
        try {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cuq66l1r01qviv3jd21gcuq66l1r01qviv3jd220`);
          const data = await response.json();
          // Finnhub API 응답 예시: { c: 현재가, d: 변화량, dp: 변화율, h, l, o, pc: 전일 종가 }
          const currentPrice = data.c;
          const previousClose = data.pc;
          const percentChange = data.dp;
  
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${symbol}</td>
            <td>${currentPrice ? currentPrice.toFixed(2) : '-'}</td>
            <td>${previousClose ? previousClose.toFixed(2) : '-'}</td>
            <td>${percentChange ? percentChange.toFixed(2) + '%' : '-'}</td>
          `;
          tableBody.appendChild(row);
        } catch (error) {
          console.error(`Error fetching data for ${symbol}: `, error);
        }
      }
    }
  
    // 실시간 데이터 최초 호출
    fetchLiveStockData();
  
    // 1분(60000ms)마다 갱신 (옵션)
    setInterval(fetchLiveStockData, 60000);
  });