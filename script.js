document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.querySelector('.grid-container');
    const addForm = document.getElementById('add-item-form');
    
    // Elementy wyszukiwarki
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Główna funkcja pobierająca dane
    function fetchItems(query = '') {
        let url = '/api/items';
        // Jeśli jest zapytanie, doklejamy je do URL
        if (query) {
            url += `?q=${encodeURIComponent(query)}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(result => {
                itemsContainer.innerHTML = ''; // Czyścimy listę
                
                if (result.data.length === 0) {
                    itemsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Nie znaleziono ogłoszeń.</p>';
                    return;
                }

                result.data.forEach(item => {
                    renderItem(item);
                });
            })
            .catch(err => console.error('Błąd pobierania:', err));
    }

    // Renderowanie pojedynczego kafelka
    function renderItem(item) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-image">
                <img src="${item.image_url || 'https://placehold.co/600x400?text=Brak+Zdjecia'}" alt="${item.title}">
            </div>
            <div class="card-content">
                <h4 class="card-title">${item.title}</h4>
                <p class="card-price">${item.price} zł</p>
                <div class="card-footer">
                    <span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>
                    <span>${item.date}</span>
                </div>
            </div>
        `;
        itemsContainer.appendChild(div);
    }

    // --- OBSŁUGA WYSZUKIWANIA ---

    // 1. Kliknięcie w przycisk
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            fetchItems(query);
        });
    }

    // 2. Wciśnięcie ENTER w polu tekstowym
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                fetchItems(query);
            }
        });
    }

    // --- OBSŁUGA DODAWANIA (opcjonalna) ---
    if(addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                title: document.getElementById('title').value,
                price: document.getElementById('price').value,
                location: document.getElementById('location').value,
                image_url: document.getElementById('image_url').value 
            };

            fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            })
            .then(response => response.json())
            .then(() => {
                alert('Ogłoszenie dodane!');
                addForm.reset();
                fetchItems(); 
                document.querySelector('.add-form-container').style.display = 'none';
            });
        });
    }

    // Start: załaduj wszystko
    fetchItems();
});

// Funkcja globalna do pokazywania formularza
function toggleForm() {
    const formContainer = document.querySelector('.add-form-container');
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
}