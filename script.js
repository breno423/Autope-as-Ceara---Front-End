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
                const productList = item.parentElement;
                const section = productList.parentElement.parentElement;

                if (itemText.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }

                const anyVisible = Array.from(productList.children).some(child => child.style.display !== 'none');
                section.style.display = anyVisible ? 'block' : 'none';
            });
        });
    }

    // --- DESTAQUE DO LINK ATIVO NO MENU AO ROLAR A PÁGINA ---
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.header-bottom nav a');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.4
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
    let cart = [];

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
            }, 3000);
        }
    }

    window.comprar = function(productName, price, imgSrc, details) {
        cart.push({name: productName, price: price, imgSrc: imgSrc, details: details});
        updateCartCount();
        showToast(`${productName} adicionado ao carrinho!`);
    };

    updateCartCount();

    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');

    cartIcon.addEventListener('click', () => {
        atualizarModalCarrinho();
        cartModal.style.display = 'flex';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    function atualizarModalCarrinho() {
        const cartItemsList = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        cartItemsList.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} <span>R$ ${item.price.toFixed(2)}</span>
                <div>
                    <button onclick="mostrarDetalhesCarrinho(${index})">Detalhes</button>
                    <button onclick="removerItem(${index})">Remover</button>
                </div>
            `;
            cartItemsList.appendChild(li);
            total += item.price;
        });

        cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    }

    window.removerItem = function(index) {
        cart.splice(index, 1);
        updateCartCount();
        atualizarModalCarrinho();
        showToast('Item removido do carrinho!');
    };

    window.limparCarrinho = function() {
        cart = [];
        updateCartCount();
        atualizarModalCarrinho();
        showToast('Carrinho limpo!');
    };

    window.prosseguirCompra = function() {
        alert('Prosseguindo para pagamento... (Funcionalidade em desenvolvimento)');
    };

    // --- LÓGICA DE DETALHES DO PRODUTO ---
    let currentProduct = null;

    window.mostrarDetalhes = function(productElement) {
        currentProduct = {
            title: productElement.querySelector('h3').textContent,
            desc: productElement.querySelector('p').textContent,
            price: parseFloat(productElement.querySelector('span').textContent.replace('R$ ', '').replace(',', '.')),
            imgSrc: productElement.querySelector('.product-img img') ? productElement.querySelector('.product-img img').src : '',
            details: productElement.dataset.details || 'Detalhes adicionais não disponíveis.'
        };

        const detailModal = document.getElementById('productDetailsModal');
        document.getElementById('detailImg').src = currentProduct.imgSrc;
        document.getElementById('detailTitle').textContent = currentProduct.title;
        document.getElementById('detailDesc').textContent = currentProduct.desc;
        document.getElementById('detailPrice').textContent = `R$ ${currentProduct.price.toFixed(2)}`;

        const specsList = document.getElementById('detailSpecs');
        specsList.innerHTML = '';
        currentProduct.details.split('. ').forEach(spec => {
            if (spec.trim()) {
                const li = document.createElement('li');
                li.textContent = spec.trim() + '.';
                specsList.appendChild(li);
            }
        });

        detailModal.style.display = 'flex';
    };

    window.mostrarDetalhesCarrinho = function(index) {
        const item = cart[index];
        currentProduct = {
            title: item.name,
            price: item.price,
            imgSrc: item.imgSrc,
            details: item.details || 'Detalhes adicionais não disponíveis.',
            desc: 'Consulte as especificações abaixo para mais informações.'
        };

        const detailModal = document.getElementById('productDetailsModal');
        document.getElementById('detailImg').src = currentProduct.imgSrc;
        document.getElementById('detailTitle').textContent = currentProduct.title;
        document.getElementById('detailDesc').textContent = currentProduct.desc;
        document.getElementById('detailPrice').textContent = `R$ ${currentProduct.price.toFixed(2)}`;

        const specsList = document.getElementById('detailSpecs');
        specsList.innerHTML = '';
        currentProduct.details.split('. ').forEach(spec => {
            if (spec.trim()) {
                const li = document.createElement('li');
                li.textContent = spec.trim() + '.';
                specsList.appendChild(li);
            }
        });

        detailModal.style.display = 'flex';
    };

    window.comprarDoModal = function() {
        if (currentProduct) {
            comprar(currentProduct.title, currentProduct.price, currentProduct.imgSrc, currentProduct.details);
            fecharModal('productDetailsModal');
        }
    };

    window.fecharModal = function(modalId) {
        document.getElementById(modalId).style.display = 'none';
    };

    window.addEventListener('click', (e) => {
        const detailModal = document.getElementById('productDetailsModal');
        if (e.target === detailModal) {
            detailModal.style.display = 'none';
        }
    });

    // --- LÓGICA DO SLIDER DE IMAGENS NOS PRODUTOS ---
    document.querySelectorAll(".product-img").forEach(container => {
        const imgs = container.querySelectorAll("img");
        if (imgs.length > 0) {
            let index = 0;
            imgs[0].classList.add("ativa");

            const prev = document.createElement("button");
            prev.innerHTML = "&#10094;";
            prev.classList.add("prev");
            prev.onclick = () => mudarImagem(-1);

            const next = document.createElement("button");
            next.innerHTML = "&#10095;";
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

    const slides = document.getElementById('slides');
    const nav = document.querySelectorAll('#navegacao div');
    let index = 0;

    function mostrarSlide(i) {
      slides.style.transform = `translateX(${-i * 100}%)`;
      nav.forEach(dot => dot.classList.remove('ativo'));
      nav[i].classList.add('ativo');
    }

    nav.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        index = i;
        mostrarSlide(index);
      });
    });

    setInterval(() => {
      index = (index + 1) % 3;
      mostrarSlide(index);
    }, 4000);
    mostrarSlide(index);
});
