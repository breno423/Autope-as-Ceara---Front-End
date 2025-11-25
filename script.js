document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       LOGIN / CADASTRO
    ============================================================ */
    const openModalBtn = document.getElementById("openModal");
    const loginModal = document.getElementById("loginModal");
    const closeModalBtn = document.getElementById("closeModal");
    const headerRight = document.querySelector(".header-right");

    if (openModalBtn && loginModal) {
        openModalBtn.addEventListener("click", () => {
            loginModal.style.display = "flex";
        });
    }

    if (closeModalBtn && loginModal) {
        closeModalBtn.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            tabContents.forEach(tc => tc.classList.remove("active"));
            const alvo = document.getElementById(btn.dataset.tab);
            if (alvo) alvo.classList.add("active");
        });
    });

    function mostrarSaudacao(nome) {
        if (!headerRight) return;
        if (openModalBtn) openModalBtn.style.display = "none";

        let saudacao = document.getElementById("saudacao-usuario");
        if (!saudacao) {
            saudacao = document.createElement("span");
            saudacao.id = "saudacao-usuario";
            saudacao.className = "saudacao-usuario";
            headerRight.appendChild(saudacao);
        }
        saudacao.textContent = `Olá, ${nome}!`;
    }

    const loginForm = document.querySelector("#login form");
    if (loginForm && loginModal) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = loginForm.querySelector("input[type='email']");
            if (emailInput && emailInput.value) {
                mostrarSaudacao(emailInput.value.split("@")[0]);
                loginModal.style.display = "none";
            }
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === loginModal) loginModal.style.display = "none";
    });

    /* ============================================================
       BUSCA
    ============================================================ */
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const termo = searchInput.value.toLowerCase();
            const itens = document.querySelectorAll(".product-item");

            itens.forEach(item => {
                const texto = item.textContent.toLowerCase();
                item.style.display = texto.includes(termo) ? "block" : "none";
            });
        });
    }

    /* ============================================================
       CARRINHO
    ============================================================ */
    let cart = [];

    function updateCartCount() {
        const cartCount = document.getElementById("cart-count");
        if (cartCount) cartCount.textContent = cart.length;
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = message;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 3000);
        }
    }

    window.comprar = function (productName, price, imgSrc, details) {
        cart.push({
            name: productName,
            price: price,
            imgSrc: imgSrc,
            details: details || ""
        });
        updateCartCount();
        showToast(`${productName} adicionado ao carrinho!`);
    };

    updateCartCount();

    const cartIcon = document.getElementById("cartIcon");
    const cartModal = document.getElementById("cartModal");

    if (cartIcon && cartModal) {
        cartIcon.addEventListener("click", () => {
            atualizarModalCarrinho();
            cartModal.style.display = "flex";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === cartModal) cartModal.style.display = "none";
    });

    function atualizarModalCarrinho() {
        const cartItemsList = document.getElementById("cartItems");
        const cartTotal = document.getElementById("cartTotal");
        if (!cartItemsList || !cartTotal) return;

        cartItemsList.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.name} <span>R$ ${item.price.toFixed(2)}</span>
                <div>
                    <button onclick="mostrarDetalhesCarrinho(${index})">Detalhes</button>
                    <button onclick="removerItem(${index})">Remover</button>
                </div>
            `;
            cartItemsList.appendChild(li);
        });

        cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    }

    window.removerItem = function (index) {
        cart.splice(index, 1);
        updateCartCount();
        atualizarModalCarrinho();
        showToast("Item removido do carrinho!");
    };

    window.limparCarrinho = function () {
        cart = [];
        updateCartCount();
        atualizarModalCarrinho();
        showToast("Carrinho limpo!");
    };

    window.prosseguirCompra = function () {
        alert("Prosseguindo para pagamento... (Funcionalidade em desenvolvimento)");
    };

    /* ============================================================
       DETALHES
    ============================================================ */
    let currentProduct = null;

    window.mostrarDetalhes = function (productElement) {
        if (!productElement) return;

        const detailModal = document.getElementById("productDetailsModal");
        const detailImg = document.getElementById("detailImg");
        const detailTitle = document.getElementById("detailTitle");
        const detailDesc = document.getElementById("detailDesc");
        const detailPrice = document.getElementById("detailPrice");
        const specsList = document.getElementById("detailSpecs");

        const title = productElement.querySelector("h3")?.textContent || "";
        const desc = productElement.querySelector("p")?.textContent || "";
        const priceText = productElement.querySelector("span")?.textContent || "R$ 0,00";
        const price = parseFloat(priceText.replace("R$ ", "").replace(".", "").replace(",", ".")) || 0;
        const details = productElement.dataset.details || "Detalhes adicionais não disponíveis.";

        const imgs = productElement.querySelectorAll(".product-img img");
        const imagens = Array.from(imgs).map(img => img.src);

        currentProduct = {
            title,
            desc,
            price,
            details,
            imagens,
            imgSrc: imagens[0] || ""
        };

        detailTitle.textContent = title;
        detailDesc.textContent = desc;
        detailPrice.textContent = `R$ ${price.toFixed(2)}`;
        detailImg.src = currentProduct.imgSrc;

        if (imagens.length > 1) {
            let idx = 0;
            detailImg.onclick = () => {
                idx = (idx + 1) % imagens.length;
                detailImg.src = imagens[idx];
            };
        } else {
            detailImg.onclick = null;
        }

        specsList.innerHTML = "";
        details.split(". ").forEach(spec => {
            if (spec.trim()) {
                const li = document.createElement("li");
                li.textContent = spec.trim().endsWith(".") ? spec.trim() : spec.trim() + ".";
                specsList.appendChild(li);
            }
        });

        detailModal.style.display = "flex";
    };

    window.mostrarDetalhesCarrinho = function (index) {
        const item = cart[index];
        if (!item) return;

        const detailModal = document.getElementById("productDetailsModal");
        const detailImg = document.getElementById("detailImg");
        const detailTitle = document.getElementById("detailTitle");
        const detailDesc = document.getElementById("detailDesc");
        const detailPrice = document.getElementById("detailPrice");
        const specsList = document.getElementById("detailSpecs");

        currentProduct = {
            title: item.name,
            desc: "Consulte as especificações abaixo para mais informações.",
            price: item.price,
            details: item.details || "Detalhes adicionais não disponíveis.",
            imagens: [item.imgSrc],
            imgSrc: item.imgSrc
        };

        detailTitle.textContent = currentProduct.title;
        detailDesc.textContent = currentProduct.desc;
        detailPrice.textContent = `R$ ${currentProduct.price.toFixed(2)}`;
        detailImg.src = currentProduct.imgSrc;

        specsList.innerHTML = "";
        currentProduct.details.split(". ").forEach(spec => {
            if (spec.trim()) {
                const li = document.createElement("li");
                li.textContent = spec.trim().endsWith(".") ? spec.trim() : spec.trim() + ".";
                specsList.appendChild(li);
            }
        });

        detailModal.style.display = "flex";
    };

    window.comprarDoModal = function () {
        if (!currentProduct) return;
        window.comprar(
            currentProduct.title,
            currentProduct.price,
            currentProduct.imgSrc,
            currentProduct.details
        );
        window.fecharModal("productDetailsModal");
    };

    window.fecharModal = function (modalId) {
        const m = document.getElementById(modalId);
        if (m) m.style.display = "none";
    };

    window.addEventListener("click", (e) => {
        const detailModal = document.getElementById("productDetailsModal");
        if (e.target === detailModal) detailModal.style.display = "none";
    });

    /* ============================================================
       CORREÇÃO PRINCIPAL
       AGORA OS PRODUTOS VÊM DO BANCO DE DADOS!
    ============================================================ */

    let produtosSalvos = window.produtosSalvos || [];

    if (!Array.isArray(produtosSalvos)) produtosSalvos = [];

    console.log("Produtos carregados do banco:", produtosSalvos);

    /* ============================================================
       LISTAS
    ============================================================ */

    const listaDestaque   = document.querySelector("#produtosEmDestaque .product-list");
    const listaMotores    = document.querySelector("#Motores .product-list");
    const listaPneus      = document.querySelector("#Pneus .product-list");
    const listaAutopecas  = document.querySelector("#Autopeças .product-list");
    const listaSuspensao  = document.querySelector("#AmortecedoreseSuspensões .product-list");

    function criarCard(prod) {
        const item = document.createElement("div");
        item.classList.add("product-item");
        item.dataset.details = prod.detalhes || "";

        const precoNumber = parseFloat(prod.preco) || 0;

        let imagensHTML = "";
        if (Array.isArray(prod.imagens)) {
            prod.imagens.forEach((img, index) => {
                imagensHTML += `<img src="${img}" class="${index === 0 ? "ativa" : ""}">`;
            });
        }

        item.innerHTML = `
            <h3>${prod.nome}</h3>
            <div class="product-img">${imagensHTML}</div>
            <p>${prod.descricao || ""}</p>
            <span>R$ ${precoNumber.toFixed(2)}</span>
            <div class="botao">
                <button class="btn-comprar">Comprar</button>
                <button class="btn-detalhes">Mais Detalhes</button>
            </div>
        `;

        item.querySelector(".btn-comprar").addEventListener("click", () => {
            window.comprar(prod.nome, precoNumber, prod.imagens?.[0] || "", prod.detalhes);
        });

        item.querySelector(".btn-detalhes").addEventListener("click", () => {
            window.mostrarDetalhes(item);
        });

        return item;
    }

    produtosSalvos.forEach(prod => {
        const card = criarCard(prod);

        switch (prod.categoria) {
            case "motores":
                listaMotores.appendChild(card);
                break;
            case "pneus":
                listaPneus.appendChild(card);
                break;
            case "autopecas":
                listaAutopecas.appendChild(card);
                break;
            case "suspensao":
                listaSuspensao.appendChild(card);
                break;
            default:
                listaDestaque.appendChild(card);
                break;
        }
    });

    /* ============================================================
       CARROSSEL DAS IMAGENS
    ============================================================ */
    document.querySelectorAll(".product-img").forEach(container => {
        const imgs = container.querySelectorAll("img");
        if (imgs.length <= 1) {
            imgs[0]?.classList.add("ativa");
            return;
        }

        let index = 0;
        imgs[0].classList.add("ativa");

        const prev = document.createElement("button");
        prev.innerHTML = "&#10094;";
        prev.classList.add("prev");

        const next = document.createElement("button");
        next.innerHTML = "&#10095;";
        next.classList.add("next");

        container.appendChild(prev);
        container.appendChild(next);

        const mudarImagem = (dir) => {
            imgs[index].classList.remove("ativa");
            index = (index + dir + imgs.length) % imgs.length;
            imgs[index].classList.add("ativa");
        };

        prev.onclick = () => mudarImagem(-1);
        next.onclick = () => mudarImagem(1);
    });

    /* ============================================================
       CARROSSEL PRINCIPAL
    ============================================================ */
    const slides = document.getElementById("slides");
    const navDots = document.querySelectorAll("#navegacao div");
    let indexSlide = 0;

    function mostrarSlide(i) {
        if (!slides || navDots.length === 0) return;
        slides.style.transform = `translateX(${-i * 100}%)`;
        navDots.forEach(d => d.classList.remove("ativo"));
        if (navDots[i]) navDots[i].classList.add("ativo");
    }

    if (slides && navDots.length) {
        mostrarSlide(indexSlide);
        setInterval(() => {
            indexSlide = (indexSlide + 1) % navDots.length;
            mostrarSlide(indexSlide);
        }, 4000);
    }

});
