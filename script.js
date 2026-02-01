document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.querySelector('.grid-container');
    const addForm = document.getElementById('add-item-form');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Funkcja pobierająca ogłoszenia
    function fetchItems(query = '') {
        let url = 'http://localhost:3000/api/items';
        if (query) url += `?q=${encodeURIComponent(query)}`;

        fetch(url)
            .then(response => response.json())
            .then(result => {
                itemsContainer.innerHTML = ''; 
                
                if (!result.data || result.data.length === 0) {
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
        // Zabezpieczenie przed brakiem zdjęcia
        const imgUrl = item.image_url ? item.image_url : 'https://placehold.co/600x400?text=Brak+Zdjecia';
        
        div.innerHTML = `
            <div class="card-image">
                <img src="${imgUrl}" alt="${item.title}" onerror="this.src='https://placehold.co/600x400?text=Blad+Zdjecia'">
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

    // --- OBSŁUGA FORMULARZA DODAWANIA ---
    if(addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Zatrzymaj przeładowanie strony

            // Pobieranie wartości
            const titleVal = document.getElementById('title').value;
            const priceVal = document.getElementById('price').value;
            const locationVal = document.getElementById('location').value;
            const imageVal = document.getElementById('image_url').value;

            const newItem = {
                title: titleVal,
                price: priceVal,
                location: locationVal,
                image_url: imageVal
            };

            console.log("Wysyłam dane:", newItem);

            fetch('http://localhost:3000/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            })
            .then(response => {
                if (!response.ok) {
                    // Jeśli serwer zwróci błąd (np. 400 lub 500)
                    return response.json().then(err => { throw new Error(err.error || 'Błąd serwera') });
                }
                return response.json();
            })
            .then(() => {
                alert('Ogłoszenie dodane pomyślnie!');
                addForm.reset(); // Wyczyść pola
                fetchItems();    // Odśwież listę
                // Ukryj formularz
                document.querySelector('.add-form-container').style.display = 'none';
            })
            .catch(err => {
                console.error("Błąd dodawania:", err);
                alert('Nie udało się dodać ogłoszenia: ' + err.message);
            });
        });
    }

    // Obsługa wyszukiwarki
    if (searchBtn) {
        searchBtn.addEventListener('click', () => fetchItems(searchInput.value.trim()));
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchItems(searchInput.value.trim());
        });
    }

    // Start
    fetchItems();
});

// Funkcja globalna (poza DOMContentLoaded)
function toggleForm() {
    const formContainer = document.querySelector('.add-form-container');
    if (formContainer) {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    }
}