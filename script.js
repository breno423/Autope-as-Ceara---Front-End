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

    // --- LÓGICA DO CARRINHO ---
    let cart = []; // Array para armazenar itens do carrinho (simples, sem persistência por enquanto)

    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000); // Desaparece após 3 segundos
        }
    }

    window.comprar = function(productName) {
        cart.push(productName);
        updateCartCount();
        showToast(`${productName} adicionado ao carrinho!`);
    };

    // Inicializa o contador do carrinho
    updateCartCount();

    // --- LÓGICA DO SLIDER DE IMAGENS ---
    document.querySelectorAll(".product-img").forEach(container => {
        const imgs = container.querySelectorAll("img");
        if (imgs.length > 1) {
          let index = 0;
          imgs[0].classList.add("ativa");
    
          // cria botões
          const prev = document.createElement("button");
          prev.innerHTML = "&#10094;"; // seta esquerda
          prev.classList.add("prev");
          prev.onclick = () => mudarImagem(-1);
    
          const next = document.createElement("button");
          next.innerHTML = "&#10095;"; // seta direita
          next.classList.add("next");
          next.onclick = () => mudarImagem(1);
    
          container.appendChild(prev);
          container.appendChild(next);
    
          function mudarImagem(direcao) {
            imgs[index].classList.remove("ativa");
            index = (index + direcao + imgs.length) % imgs.length;
            imgs[index].classList.add("ativa");
          }
        }
      });
});