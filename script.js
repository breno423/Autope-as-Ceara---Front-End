document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DO MODAL (LOGIN/CADASTRO) ---
    const openModalBtn = document.getElementById('openModal');
    const modal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModal');
    const headerRight = document.querySelector('.header-right');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

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

    // --- LÓGICA DE LOGIN E SAUDAÇÃO ---
    function mostrarSaudacao(nome) {
        if (openModalBtn) {
            openModalBtn.style.display = 'none';
            let saudacao = document.getElementById('saudacao-usuario');
            if (!saudacao) {
                saudacao = document.createElement('span');
                saudacao.id = 'saudacao-usuario';
                saudacao.className = 'saudacao-usuario';
                headerRight.appendChild(saudacao);
            }
            saudacao.textContent = `Olá, ${nome}!`;
        }
    }

    const loginForm = document.querySelector('#login form');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const emailInput = loginForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const nome = emailInput.value.split('@')[0];
                modal.style.display = 'none';
                mostrarSaudacao(nome);
            }
        }
    }

    // --- LÓGICA DA BARRA DE BUSCA ---
    const searchInput = document.getElementById('searchInput');
    const productItems = document.querySelectorAll('.product-item');

    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            productItems.forEach(function(item) {
                const itemText = item.textContent.toLowerCase();
                // Lógica para esconder a seção inteira se todos os produtos nela forem escondidos
                const productList = item.parentElement;
                const section = productList.parentElement.parentElement;

                if (itemText.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
                
                // Verifica se algum item ainda está visível na lista
                const anyVisible = Array.from(productList.children).some(child => child.style.display !== 'none');
                section.style.display = anyVisible ? 'block' : 'none';
            });
        });
    }

    // --- DESTAQUE DO LINK ATIVO NO MENU AO ROLAR A PÁGINA ---
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.header-bottom nav a');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.4 // 40% da seção deve estar visível
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const linkId = `a[href="#${entry.target.id}"]`;
                document.querySelectorAll('.header-bottom ul li a').forEach(a => a.classList.remove('active'));
                const activeLink = document.querySelector(linkId);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

});