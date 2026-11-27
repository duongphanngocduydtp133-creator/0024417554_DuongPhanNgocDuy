const API_URL = 'http://localhost:4000/api/events';

const formatDateTime = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes}, ${day}/${month}/${year}`;
};

// Câu 2a (1,0 điểm): Định dạng số chỗ còn lại
const formatSeats = (event) => {
  const remaining = event.capacity - event.registeredCount;
  if (remaining <= 0) {
    return 'Hết chỗ';
  }
  return `Còn ${remaining}/${event.capacity} chỗ`;
};

// Câu 2b (2,0 điểm): Tạo danh sách card bằng DOM API an toàn
const renderEvents = (events) => {
  const eventListEl = document.getElementById('event-list');

  const cards = events.map((event) => {
    const article = document.createElement('article');
    article.className = 'event-card';

    const img = document.createElement('img');
    img.setAttribute('src', event.image || 'img/event.svg');
    img.setAttribute('alt', `Minh họa ${event.name}`);

    const body = document.createElement('div');
    body.className = 'event-body';

    const title = document.createElement('h2');
    title.className = 'event-title';

    const link = document.createElement('a');
    link.setAttribute('href', `event-detail.html?id=${encodeURIComponent(event.id)}`);
    link.textContent = event.name;
    title.appendChild(link);

    const timeP = document.createElement('p');
    timeP.className = 'event-meta';
    timeP.textContent = 'Thời gian: ';

    const timeEl = document.createElement('time');
    timeEl.setAttribute('datetime', event.startTime);
    timeEl.textContent = formatDateTime(event.startTime);
    timeP.appendChild(timeEl);

    const locationP = document.createElement('p');
    locationP.className = 'event-meta';
    locationP.textContent = `Địa điểm: ${event.location}`;

    const seatsP = document.createElement('p');
    seatsP.className = 'event-seats';

    const seatText = formatSeats(event);
    if (seatText === 'Hết chỗ') {
      const badge = document.createElement('span');
      badge.className = 'badge-full';
      badge.textContent = seatText;
      seatsP.appendChild(badge);
    } else {
      seatsP.textContent = seatText;
    }

    body.append(title, timeP, locationP, seatsP);
    article.append(img, body);
    return article;
  });

  eventListEl.replaceChildren(...cards);
};

// Câu 2c (2,0 điểm): Gọi API, xử lý tìm kiếm và trạng thái
const loadEvents = async (keyword = '') => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Đang tải...';

  const params = new URLSearchParams();
  params.set('pageSize', '50');

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword !== '') {
    params.set('q', trimmedKeyword);
  }

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    renderEvents(items);

    if (items.length === 0) {
      statusEl.textContent = 'Không có sự kiện nào khớp từ khoá.';
    } else {
      statusEl.textContent = `Tìm thấy ${items.length} sự kiện`;
    }
  } catch (error) {
    statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
  }
};

// Khởi chạy khi tải trang và bắt sự kiện gửi form
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const keywordInput = document.getElementById('keyword');

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadEvents(keywordInput.value);
  });

  loadEvents();
});
