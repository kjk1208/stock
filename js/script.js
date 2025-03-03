document.addEventListener('DOMContentLoaded', function() {
  /* --- 0. 비밀번호 인증 처리 --- */
  // 비밀번호 인증 전 메인 콘텐츠 숨김은 index.html에서 mainContent에 inline style로 처리됨.
  const loginModalEl = document.getElementById('loginModal');
  const loginModal = new bootstrap.Modal(loginModalEl);
  // 로그인 모달을 표시
  loginModal.show();

  // 엔터 키를 누르면 로그인 버튼 클릭 이벤트를 트리거
  document.getElementById('passwordInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { // 또는 e.keyCode === 13
      document.getElementById('loginBtn').click();
    }
  });

  document.getElementById('loginBtn').addEventListener('click', function() {
    const passwordInput = document.getElementById('passwordInput').value;
    if (passwordInput === PASSWORD) {
      // 비밀번호가 일치하면 모달 숨기고 메인 콘텐츠 보이기
      loginModal.hide();
      document.getElementById('mainContent').style.display = 'block';
    } else {
      document.getElementById('loginError').style.display = 'block';
    }    
  });
  
  

  /* -----------------------------
     1. 포트폴리오 차트 초기화
  ----------------------------- */
  const ctx = document.getElementById('portfolioChart')?.getContext('2d');
  if (ctx) {
    new Chart(ctx, {
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
        scales: { y: { beginAtZero: false } }
      }
    });
  }

  /* -----------------------------
     2. FullCalendar 초기화 (Google Calendar 연동)
  ----------------------------- */
  const calendarEl = document.getElementById('calendarContainer');
  let calendar;
  if (calendarEl) {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      googleCalendarApiKey: GOOGLE_API_KEY,
      events: {
        googleCalendarId: GOOGLE_CALENDAR_ID
      }
    });
    calendar.render();
  }
  // 탭 활성화 시 재렌더링
  document.querySelector('#tab-calendar').addEventListener('shown.bs.tab', function() {
    if (calendar) {
      calendar.render();
    }
  });

  /* -----------------------------
     3. 실시간 미국 주식 데이터 (기존 코드 그대로 유지)
  ----------------------------- */
  async function fetchLiveStockData() {
    const symbols = ['AAPL', 'AMZN', 'GOOGL', 'MSFT', 'TSLA'];
    const tableBody = document.getElementById('liveStockTableBody');
    tableBody.innerHTML = ''; // 초기화

    for (const symbol of symbols) {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_TOKEN}`);
        const data = await response.json();
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
  fetchLiveStockData();
  setInterval(fetchLiveStockData, 60000);

  /* -----------------------------
     4. 보유 주식 목록 CRUD 및 실시간 가격/수익률 갱신 (1초마다)
  ----------------------------- */
  const stockTbody = document.getElementById('stockTbody');
  const addStockBtn = document.getElementById('addStockBtn');
  const editStockBtn = document.getElementById('editStockBtn');
  const deleteStockBtn = document.getElementById('deleteStockBtn');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');

  // 초기 데이터: localStorage에서 읽어오거나 기본값 사용
  let stocks = JSON.parse(localStorage.getItem('stocks')) || [
    { symbol: 'Apple (AAPL)', quantity: 10, buyPrice: 150, currentPrice: null, profitRate: null },
    { symbol: 'Amazon (AMZN)', quantity: 5, buyPrice: 3000, currentPrice: null, profitRate: null }
  ];

  // 드롭다운(select) 생성 함수 (Bootstrap-Select 적용)
  function createSymbolSelect(initialValue = '') {
    const select = document.createElement('select');
    select.classList.add('form-control', 'selectpicker');
    select.setAttribute('data-live-search', 'true');
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '종목명 선택';
    select.appendChild(defaultOption);
    const options = [
      { value: 'NVDA', text: 'Nvidia' },
      { value: 'NVDL', text: 'Nvidia 2x Long' },
      { value: 'BBAI', text: 'BigBear AI' },
      { value: 'RGTI', text: 'Rigetti' },
      { value: 'QBTS', text: 'D-wave' },
      { value: 'SES', text: 'SES AI' },
      { value: 'LAES', text: 'Seal SQ' },
      { value: 'IONQ', text: 'IonQ' },
      { value: 'ORCL', text: 'Oracle' },
      { value: 'ARM', text: 'Arm' },
      { value: 'PDYN', text: 'Palladyne' },
      { value: 'AAPL', text: 'Apple' },
      { value: 'AMZN', text: 'Amazon' },
      { value: 'GOOGL', text: 'Google' },
      { value: 'MSFT', text: 'Microsoft' },
      { value: 'TSLA', text: 'Tesla' }
    ];
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      if (initialValue && initialValue.includes(opt.value)) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    return select;
  }

  // 렌더링 시, 각 행의 현재가와 수익률 셀에 id 부여
  function renderStocks() {
    stockTbody.innerHTML = '';
    stocks.forEach((item, index) => {
      const tr = document.createElement('tr');

      const noTd = document.createElement('td');
      noTd.textContent = index + 1;

      const checkboxTd = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('rowCheckbox');
      checkboxTd.appendChild(checkbox);

      const symbolTd = document.createElement('td');
      symbolTd.textContent = item.symbol;

      const quantityTd = document.createElement('td');
      quantityTd.textContent = item.quantity;

      const buyPriceTd = document.createElement('td');
      buyPriceTd.textContent = `$${item.buyPrice}`;

      const currentTd = document.createElement('td');
      currentTd.id = `currentPrice-${index}`;
      currentTd.textContent = item.currentPrice !== null ? `$${item.currentPrice}` : '-';

      const profitTd = document.createElement('td');
      profitTd.id = `profitRate-${index}`;
      profitTd.textContent = item.profitRate || '-';

      const actionTd = document.createElement('td');
      tr.append(noTd, checkboxTd, symbolTd, quantityTd, buyPriceTd, currentTd, profitTd, actionTd);
      stockTbody.appendChild(tr);
    });
    localStorage.setItem('stocks', JSON.stringify(stocks));
    $('.selectpicker').selectpicker('refresh');
  }
  renderStocks();

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
      rowCheckboxes.forEach(chk => { chk.checked = selectAllCheckbox.checked; });
    });
  }

  // 추가 버튼: 입력 폼 행 추가 (드롭다운 사용)
  addStockBtn.addEventListener('click', function() {
    const tr = document.createElement('tr');

    const noTd = document.createElement('td');
    noTd.textContent = '-';

    const checkboxTd = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.disabled = true;
    checkboxTd.appendChild(checkbox);

    const symbolSelect = createSymbolSelect();
    const symbolTd = document.createElement('td');
    symbolTd.appendChild(symbolSelect);

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.placeholder = '보유 수량';
    quantityInput.classList.add('form-control');
    const quantityTd = document.createElement('td');
    quantityTd.appendChild(quantityInput);

    const buyPriceInput = document.createElement('input');
    buyPriceInput.type = 'number';
    buyPriceInput.placeholder = '매수가';
    buyPriceInput.classList.add('form-control');
    const buyPriceTd = document.createElement('td');
    buyPriceTd.appendChild(buyPriceInput);

    const currentTd = document.createElement('td');
    currentTd.textContent = '-';

    const profitTd = document.createElement('td');
    profitTd.textContent = '-';

    const actionTd = document.createElement('td');
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '저장';
    saveBtn.classList.add('btn', 'btn-sm', 'btn-success');
    saveBtn.addEventListener('click', function() {
      const symbolVal = symbolSelect.options[symbolSelect.selectedIndex].text;
      const quantityVal = parseInt(quantityInput.value.trim(), 10) || 0;
      const buyPriceVal = parseFloat(buyPriceInput.value.trim()) || 0;
      if (!symbolVal || symbolVal === '종목명 선택') {
        alert('종목명을 선택하세요.');
        return;
      }
      stocks.push({
        symbol: symbolVal,
        quantity: quantityVal,
        buyPrice: buyPriceVal,
        currentPrice: null,
        profitRate: null
      });
      renderStocks();
    });
    actionTd.appendChild(saveBtn);

    tr.append(noTd, checkboxTd, symbolTd, quantityTd, buyPriceTd, currentTd, profitTd, actionTd);
    stockTbody.appendChild(tr);
    $('.selectpicker').selectpicker('refresh');
  });

  // 삭제 버튼: 선택된 행 삭제
  deleteStockBtn.addEventListener('click', function() {
    const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
    for (let i = rowCheckboxes.length - 1; i >= 0; i--) {
      if (rowCheckboxes[i].checked) {
        stocks.splice(i, 1);
      }
    }
    renderStocks();
  });

  // 변경 버튼: 단일 행 편집 (체크된 행이 1개일 때)
  editStockBtn.addEventListener('click', function() {
    const rowCheckboxes = document.querySelectorAll('.rowCheckbox');
    const checkedIndexes = [];
    rowCheckboxes.forEach((chk, idx) => {
      if (chk.checked) checkedIndexes.push(idx);
    });
    if (checkedIndexes.length !== 1) {
      alert('변경할 행을 한 개만 선택하세요.');
      return;
    }
    const editIndex = checkedIndexes[0];
    const target = stocks[editIndex];
    stocks.splice(editIndex, 1);
    renderStocks();

    const tr = document.createElement('tr');
    const noTd = document.createElement('td');
    noTd.textContent = editIndex + 1;
    const checkboxTd = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.disabled = true;
    checkboxTd.appendChild(checkbox);

    const symbolSelect = createSymbolSelect(target.symbol);
    const symbolTd = document.createElement('td');
    symbolTd.appendChild(symbolSelect);

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = target.quantity;
    quantityInput.classList.add('form-control');
    const quantityTd = document.createElement('td');
    quantityTd.appendChild(quantityInput);

    const buyPriceInput = document.createElement('input');
    buyPriceInput.type = 'number';
    buyPriceInput.value = target.buyPrice;
    buyPriceInput.classList.add('form-control');
    const buyPriceTd = document.createElement('td');
    buyPriceTd.appendChild(buyPriceInput);

    const currentTd = document.createElement('td');
    currentTd.textContent = target.currentPrice !== null ? `$${target.currentPrice}` : '-';

    const profitTd = document.createElement('td');
    profitTd.textContent = target.profitRate || '-';

    const actionTd = document.createElement('td');
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '저장';
    saveBtn.classList.add('btn', 'btn-sm', 'btn-success');
    saveBtn.addEventListener('click', function() {
      const symbolVal = symbolSelect.options[symbolSelect.selectedIndex].text;
      const quantityVal = parseInt(quantityInput.value.trim(), 10) || 0;
      const buyPriceVal = parseFloat(buyPriceInput.value.trim()) || 0;
      if (!symbolVal || symbolVal === '종목명 선택') {
        alert('종목명을 선택하세요.');
        return;
      }
      stocks.splice(editIndex, 0, {
        symbol: symbolVal,
        quantity: quantityVal,
        buyPrice: buyPriceVal,
        currentPrice: target.currentPrice,
        profitRate: target.profitRate
      });
      renderStocks();
    });
    actionTd.appendChild(saveBtn);

    tr.append(noTd, checkboxTd, symbolTd, quantityTd, buyPriceTd, currentTd, profitTd, actionTd);
    stockTbody.insertBefore(tr, stockTbody.children[editIndex]);
    $('.selectpicker').selectpicker('refresh');
  });

  /* -----------------------------
     5. 보유 주식 목록의 현재가/수익률 실시간 갱신 (1초마다)
  ----------------------------- */
  async function updateOwnedStockPrices() {
    for (let i = 0; i < stocks.length; i++) {
      const symbol = stocks[i].symbol.split('(')[1]?.replace(')', '') || stocks[i].symbol;
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_TOKEN}`);
        const data = await response.json();
        const currentPrice = data.c;
        const percentChange = data.dp;

        stocks[i].currentPrice = currentPrice;
        stocks[i].profitRate = percentChange ? (percentChange.toFixed(2) + '%') : '-';

        const currentTd = document.getElementById(`currentPrice-${i}`);
        const profitTd = document.getElementById(`profitRate-${i}`);
        if (currentTd) {
          currentTd.textContent = currentPrice ? `$${currentPrice.toFixed(2)}` : '-';
        }
        if (profitTd) {
          profitTd.textContent = percentChange ? (percentChange.toFixed(2) + '%') : '-';
        }
      } catch (error) {
        console.error(`Error updating price for ${symbol}:`, error);
      }
    }
    localStorage.setItem('stocks', JSON.stringify(stocks));
  }
  setInterval(updateOwnedStockPrices, 30000);
});
