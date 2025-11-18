document.addEventListener('DOMContentLoaded', function () {
    // --- LÓGICA DO MODAL (LOGIN/CADASTRO) ---
    const openModalBtn = document.getElementById('openModal');
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModal');
    const headerRight = document.querySelector('.header-right');

    if (openModalBtn && loginModal) {
        openModalBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
    }

    if (closeModalBtn && loginModal) {
        closeModalBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    // Tabs login / cadastro
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabContents.forEach(tc => tc.classList.remove('active'));
            const tab = document.getElementById(btn.dataset.tab);
            if (tab) tab.classList.add('active');
        });
    });

    // --- LÓGICA DE LOGIN E SAUDAÇÃO ---
    function mostrarSaudacao(nome) {
        if (!headerRight) return;
        if (openModalBtn) openModalBtn.style.display = 'none';

        let saudacao = document.getElementById('saudacao-usuario');
        if (!saudacao) {
            saudacao = document.createElement('span');
            saudacao.id = 'saudacao-usuario';
            saudacao.className = 'saudacao-usuario';
            headerRight.appendChild(saudacao);
        }
        saudacao.textContent = `Olá, ${nome}!`;
    }

    const loginForm = document.querySelector('#login form');
    if (loginForm && loginModal) {
        loginForm.onsubmit = function (e) {
            e.preventDefault();
            const emailInput = loginForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const nome = emailInput.value.split('@')[0];
                loginModal.style.display = 'none';
                mostrarSaudacao(nome);
            }
        };
    }

    // --- LÓGICA DA BARRA DE BUSCA ---
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keyup', function (event) {
            const searchTerm = event.target.value.toLowerCase();
            const productItems = document.querySelectorAll('.product-item');

            productItems.forEach(function (item) {
                const itemText = item.textContent.toLowerCase();
                const productList = item.parentElement;
                const section = productList?.parentElement?.parentElement;

                if (itemText.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }

                if (section && productList) {
                    const anyVisible = Array.from(productList.children).some(child => child.style.display !== 'none');
                    section.style.display = anyVisible ? 'block' : 'none';
                }
            });
        });
    }

    // --- DESTAQUE DO LINK ATIVO NO MENU AO ROLAR A PÁGINA ---
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.header-bottom nav a');

    if (sections.length && navLinks.length) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.4
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const linkSelector = `.header-bottom ul li a[href="#${entry.target.id}"]`;
                    document.querySelectorAll('.header-bottom ul li a').forEach(a => a.classList.remove('active'));
                    const activeLink = document.querySelector(linkSelector);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

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

    window.comprar = function (productName, price, imgSrc, details) {
        cart.push({ name: productName, price: price, imgSrc: imgSrc, details: details });
        updateCartCount();
        showToast(`${productName} adicionado ao carrinho!`);
    };

    updateCartCount();

    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');

    if (cartIcon && cartModal) {
        cartIcon.addEventListener('click', () => {
            atualizarModalCarrinho();
            cartModal.style.display = 'flex';
        });
    }

    function atualizarModalCarrinho() {
        const cartItemsList = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        if (!cartItemsList || !cartTotal) return;

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

    window.removerItem = function (index) {
        cart.splice(index, 1);
        updateCartCount();
        atualizarModalCarrinho();
        showToast('Item removido do carrinho!');
    };

    window.limparCarrinho = function () {
        cart = [];
        updateCartCount();
        atualizarModalCarrinho();
        showToast('Carrinho limpo!');
    };

    window.prosseguirCompra = function () {
        alert('Prosseguindo para pagamento... (Funcionalidade em desenvolvimento)');
    };

    // --- LÓGICA DE DETALHES DO PRODUTO ---
    let currentProduct = null;

    window.mostrarDetalhes = function (productElement) {
        if (!productElement) return;

        // Coleta todas as imagens do card (estáticos + vindos do admin)
        const imgs = productElement.querySelectorAll('.product-img img');
        const imagens = Array.from(imgs).map(i => i.src);

        currentProduct = {
            title: productElement.querySelector('h3')?.textContent || '',
            desc: productElement.querySelector('p')?.textContent || '',
            price: parseFloat(
                (productElement.querySelector('span')?.textContent || '0')
                    .replace('R$ ', '')
                    .replace('.', '')
                    .replace(',', '.')
            ) || 0,
            imagens: imagens,
            imgSrc: imagens[0] || '',
            details: productElement.dataset.details || 'Detalhes adicionais não disponíveis.'
        };

        const detailModal = document.getElementById('productDetailsModal');
        const detailImg = document.getElementById('detailImg');
        const detailTitle = document.getElementById('detailTitle');
        const detailDesc = document.getElementById('detailDesc');
        const detailPrice = document.getElementById('detailPrice');
        const specsList = document.getElementById('detailSpecs');

        if (!detailModal || !detailImg || !detailTitle || !detailDesc || !detailPrice || !specsList) return;

        // Imagem principal (primeira)
        detailImg.src = currentProduct.imgSrc;

        // Se houver mais de uma imagem, permite passar clicando na imagem do modal
        if (currentProduct.imagens.length > 1) {
            let idx = 0;
            detailImg.onclick = function () {
                idx = (idx + 1) % currentProduct.imagens.length;
                detailImg.src = currentProduct.imagens[idx];
            };
        } else {
            detailImg.onclick = null;
        }

        detailTitle.textContent = currentProduct.title;
        detailDesc.textContent = currentProduct.desc;
        detailPrice.textContent = `R$ ${currentProduct.price.toFixed(2)}`;

        specsList.innerHTML = '';
        currentProduct.details.split('. ').forEach(spec => {
            if (spec.trim()) {
                const li = document.createElement('li');
                li.textContent = spec.trim().endsWith('.') ? spec.trim() : spec.trim() + '.';
                specsList.appendChild(li);
            }
        });

        detailModal.style.display = 'flex';
    };

    window.mostrarDetalhesCarrinho = function (index) {
        const item = cart[index];
        if (!item) return;

        currentProduct = {
            title: item.name,
            price: item.price,
            imgSrc: item.imgSrc,
            imagens: [item.imgSrc],
            details: item.details || 'Detalhes adicionais não disponíveis.',
            desc: 'Consulte as especificações abaixo para mais informações.'
        };

        const detailModal = document.getElementById('productDetailsModal');
        const detailImg = document.getElementById('detailImg');
        const detailTitle = document.getElementById('detailTitle');
        const detailDesc = document.getElementById('detailDesc');
        const detailPrice = document.getElementById('detailPrice');
        const specsList = document.getElementById('detailSpecs');

        if (!detailModal || !detailImg || !detailTitle || !detailDesc || !detailPrice || !specsList) return;

        detailImg.src = currentProduct.imgSrc;
        detailImg.onclick = null;

        detailTitle.textContent = currentProduct.title;
        detailDesc.textContent = currentProduct.desc;
        detailPrice.textContent = `R$ ${currentProduct.price.toFixed(2)}`;

        specsList.innerHTML = '';
        currentProduct.details.split('. ').forEach(spec => {
            if (spec.trim()) {
                const li = document.createElement('li');
                li.textContent = spec.trim().endsWith('.') ? spec.trim() : spec.trim() + '.';
                specsList.appendChild(li);
            }
        });

        detailModal.style.display = 'flex';
    };

    window.comprarDoModal = function () {
        if (currentProduct) {
            const imgSrc = currentProduct.imgSrc || (currentProduct.imagens && currentProduct.imagens[0]) || '';
            window.comprar(currentProduct.title, currentProduct.price, imgSrc, currentProduct.details);
            window.fecharModal('productDetailsModal');
        }
    };

    window.fecharModal = function (modalId) {
        const m = document.getElementById(modalId);
        if (m) m.style.display = 'none';
    };

    // Fechar modais clicando fora
    window.addEventListener('click', (e) => {
        const detailModal = document.getElementById('productDetailsModal');
        const cartModal2 = document.getElementById('cartModal');
        if (e.target === detailModal) detailModal.style.display = 'none';
        if (e.target === cartModal2) cartModal2.style.display = 'none';
        if (e.target === loginModal) loginModal.style.display = 'none';
    });

    // --- CARREGAR PRODUTOS DO ADMIN NA PÁGINA PRINCIPAL ---
    const produtosSalvos = JSON.parse(localStorage.getItem('produtos')) || [];
    const listaDestaque = document.querySelector('#produtosEmDestaque .product-list');

    if (listaDestaque && produtosSalvos.length > 0) {
        produtosSalvos.forEach(prod => {
            const item = document.createElement('div');
            item.classList.add('product-item');
            item.dataset.details = prod.detalhes || '';

            let imagensHTML = '';
            if (Array.isArray(prod.imagens)) {
                prod.imagens.forEach((img, index) => {
                    imagensHTML += `<img src="${img}" class="${index === 0 ? 'ativa' : ''}">`;
                });
            }

            const precoNumber = parseFloat(prod.preco) || 0;

            item.innerHTML = `
                <h3>${prod.nome}</h3>

                <div class="product-img">
                    ${imagensHTML}
                </div>

                <p>${prod.descricao || ''}</p>
                <span>R$ ${precoNumber.toFixed(2)}</span>

                <div class="botao">
                    <button onclick="comprar('${prod.nome.replace(/'/g, "\\'")}', ${precoNumber}, '${(prod.imagens && prod.imagens[0]) || ''}', this.parentElement.parentElement.dataset.details)">Comprar</button>
                    <button class="btn-detalhes" onclick="mostrarDetalhes(this.parentElement.parentElement)">Mais Detalhes</button>
                </div>
            `;

            listaDestaque.appendChild(item);
        });
    }

    // --- LÓGICA DO SLIDER DE IMAGENS NOS PRODUTOS (CARDS) ---
    document.querySelectorAll('.product-img').forEach(container => {
        const imgs = container.querySelectorAll('img');
        if (imgs.length > 1) {
            let index = 0;
            imgs[0].classList.add('ativa');

            const prev = document.createElement('button');
            prev.innerHTML = '&#10094;';
            prev.classList.add('prev');
            const next = document.createElement('button');
            next.innerHTML = '&#10095;';
            next.classList.add('next');

            container.appendChild(prev);
            container.appendChild(next);

            function mudarImagem(direcao) {
                imgs[index].classList.remove('ativa');
                index = (index + direcao + imgs.length) % imgs.length;
                imgs[index].classList.add('ativa');
            }

            prev.onclick = () => mudarImagem(-1);
            next.onclick = () => mudarImagem(1);
        } else if (imgs.length === 1) {
            imgs[0].classList.add('ativa');
        }
    });

    // --- SLIDER DO BANNER PRINCIPAL ---
    const slides = document.getElementById('slides');
    const navDots = document.querySelectorAll('#navegacao div');
    let bannerIndex = 0;

    function mostrarSlide(i) {
        if (!slides || !navDots.length) return;
        slides.style.transform = `translateX(${-i * 100}%)`;
        navDots.forEach(dot => dot.classList.remove('ativo'));
        if (navDots[i]) navDots[i].classList.add('ativo');
    }

    navDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            bannerIndex = i;
            mostrarSlide(bannerIndex);
        });
    });

    if (slides && navDots.length) {
        setInterval(() => {
            bannerIndex = (bannerIndex + 1) % navDots.length;
            mostrarSlide(bannerIndex);
        }, 4000);
        mostrarSlide(bannerIndex);
    }
});
