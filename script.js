document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const productItems = document.querySelectorAll('.product-item');

    searchInput.addEventListener('keyup', function(event) {
        const searchTerm = event.target.value.toLowerCase(); // Pega o termo digitado e converte para minúsculas

        productItems.forEach(function(item) {
            const itemText = item.textContent.toLowerCase(); // Pega todo o texto do item e converte para minúsculas

            // Verifica se o texto do item inclui o termo de busca
            if (itemText.includes(searchTerm)) {
                item.style.display = 'block'; // Mostra o item se houver correspondência
            } else {
                item.style.display = 'none'; // Esconde o item se não houver correspondência
            }
        });
    });
});


    // Abrir modal
    const openModalBtn = document.getElementById('openModal');
    const modal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModal');

    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Tabs do modal
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(tc => tc.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
