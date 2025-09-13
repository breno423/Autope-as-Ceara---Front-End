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

