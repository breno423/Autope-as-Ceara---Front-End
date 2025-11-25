<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Admin - AutoPeças Maia</title>
    <link rel="stylesheet" href="style copy.css">
    <style>
        #painel {
            display: none;
        }
    </style>
</head>

<body>

    <!-- LOGIN ADMIN -->
    <div class="box" id="loginBox">
        <h2>Login de Administrador</h2>

        <input type="text" id="adminUser" placeholder="Usuário">
        <input type="password" id="adminPass" placeholder="Senha">

        <button onclick="fazerLogin()">Entrar</button>

        <p style="font-size:14px;color:#666">
            Usuário: | Senha:
        </p>
    </div>

    <!-- PAINEL -->
    <div id="painel" class="box" style="display:none;">

        <div class="top-btns">
            <a href="index.php"><button>Voltar ao Site</button></a>
            <button onclick="toggleCadastro()">Ver Produtos Cadastrados</button>
        </div>

        <!-- CADASTRO -->
        <div id="cadastroBox">
            <h2>Cadastrar Novo Produto</h2>

            <label><b>Imagens do Produto (1 ou mais):</b></label>
            <input type="file" id="imgProduto" accept="image/*" multiple>
            <div id="previewContainer"></div>

            <label><b>Categoria:</b></label>
            <select id="categoriaProduto">
                <option value="destaque">Destaques</option>
                <option value="motores">Motores</option>
                <option value="pneus">Pneus</option>
                <option value="autopecas">Autopeças</option>
                <option value="suspensao">Suspensão</option>
            </select>

            <input type="text" id="nomeProduto" placeholder="Nome do Produto">
            <input type="number" id="precoProduto" placeholder="Preço (R$)" step="0.01">
            <input type="number" id="qtdProduto" placeholder="Quantidade">

            <input type="text" id="descProduto" placeholder="Descrição curta">

            <textarea id="detalhesProduto" placeholder="Detalhes técnicos"></textarea>

            <button onclick="salvarProduto()">Salvar Produto</button>

            <p id="msg" style="color:green;"></p>
        </div>

        <!-- LISTA -->
        <div id="listaProdutos" style="display:none;">
            <h2>Produtos Cadastrados</h2>
            <div id="produtosLista"></div>
        </div>

    </div>

<script>
/* ============================================================
   LOGIN
============================================================ */
const USER = "admin";
const PASS = "1234";

function fazerLogin() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if (user === USER && pass === PASS) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("painel").style.display = "block";
        carregarProdutos();
    } else {
        alert("Usuário ou senha incorretos.");
    }
}

/* ============================================================
   FUNÇÃO DE COMPRESSÃO
============================================================ */
function comprimirImagem(base64, qualidade = 0.4) {
    return new Promise(resolve => {
        let img = new Image();
        img.src = base64;

        img.onload = function () {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL("image/jpeg", qualidade));
        };
    });
}

/* ============================================================
   UPLOAD + COMPRESSÃO + PREVIEW
============================================================ */
let imagensBase64 = [];

document.getElementById("imgProduto").addEventListener("change", async function () {
    imagensBase64 = [];
    document.getElementById("previewContainer").innerHTML = "";

    for (const file of this.files) {
        const reader = new FileReader();

        reader.onload = async function () {
            const comprimida = await comprimirImagem(reader.result, 0.4);

            imagensBase64.push(comprimida);

            let img = document.createElement("img");
            img.src = comprimida;

            document.getElementById("previewContainer").appendChild(img);
        };

        reader.readAsDataURL(file);
    }
});

/* ============================================================
   SALVAR PRODUTO
============================================================ */
async function salvarProduto() {

    const categoria = document.getElementById("categoriaProduto").value;
    const nome = document.getElementById("nomeProduto").value;
    const preco = document.getElementById("precoProduto").value;
    const qtd = document.getElementById("qtdProduto").value;
    const desc = document.getElementById("descProduto").value;
    const detalhes = document.getElementById("detalhesProduto").value;

    if (!nome || !preco || !qtd || imagensBase64.length === 0) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const produto = {
        id: Date.now(),
        nome: nome,
        preco: parseFloat(preco),
        quantidade: parseInt(qtd),
        descricao: desc,
        detalhes: detalhes,
        imagens: imagensBase64,
        categoria: categoria
    };

    console.log("Enviando produto:", produto);

    try {
        const response = await fetch('api_produtos.php?acao=adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        });

        console.log("Response status:", response.status);
        
        const result = await response.json();
        console.log("Response result:", result);

        if (result.success) {
            document.getElementById("msg").textContent = "Produto salvo com sucesso!";
            document.getElementById("msg").style.color = "green";
            limparCampos();
            setTimeout(() => {
                document.getElementById("msg").textContent = "";
            }, 3000);
            await carregarProdutos();
        } else {
            document.getElementById("msg").textContent = "Erro: " + result.message;
            document.getElementById("msg").style.color = "red";
            console.error("Erro ao salvar:", result.message);
        }
    } catch (error) {
        document.getElementById("msg").textContent = "Erro de conexão: " + error.message;
        document.getElementById("msg").style.color = "red";
        console.error("Erro de conexão:", error);
    }
}

function limparCampos() {
    document.getElementById("nomeProduto").value = "";
    document.getElementById("precoProduto").value = "";
    document.getElementById("qtdProduto").value = "";
    document.getElementById("descProduto").value = "";
    document.getElementById("detalhesProduto").value = "";
    document.getElementById("imgProduto").value = "";
    document.getElementById("previewContainer").innerHTML = "";
    imagensBase64 = [];
}

/* ============================================================
   LISTAR PRODUTOS
============================================================ */
async function carregarProdutos() {
    const produtosLista = document.getElementById("produtosLista");
    
    if (!produtosLista) {
        console.error("Elemento produtosLista não encontrado");
        return;
    }
    
    produtosLista.innerHTML = "<p>Carregando produtos...</p>";

    try {
        const response = await fetch('api_produtos.php?acao=listar');
        console.log("Response status ao listar:", response.status);
        
        const result = await response.json();
        console.log("Produtos carregados:", result);

        produtosLista.innerHTML = "";

        if (result.success && result.produtos && result.produtos.length > 0) {
            result.produtos.forEach(prod => {

                const div = document.createElement("div");
                div.classList.add("produto-admin");

                let miniImgs = "";
                if (prod.imagens && prod.imagens.length > 0) {
                    prod.imagens.forEach(img => {
                        miniImgs += `<img src='${img}'>`;
                    });
                }

                div.innerHTML = `
                    ${miniImgs}
                    <h3>${prod.nome}</h3>
                    <p><b>Categoria:</b> ${prod.categoria}</p>
                    <p>${prod.descricao || 'Sem descrição'}</p>
                    <p><b>Preço:</b> R$ ${parseFloat(prod.preco).toFixed(2)}</p>
                    <p><b>Quantidade:</b> ${prod.quantidade}</p>
                    <button onclick="removerProduto(${prod.id})" style="background:#d9534f;color:white">
                        Remover
                    </button>
                `;

                produtosLista.appendChild(div);
            });
        } else {
            produtosLista.innerHTML = "<p>Nenhum produto cadastrado ainda.</p>";
        }
    } catch (error) {
        produtosLista.innerHTML = "<p style='color:red'>Erro ao carregar produtos: " + error.message + "</p>";
        console.error("Erro ao carregar produtos:", error);
    }
}

/* ============================================================
   REMOVER PRODUTO
============================================================ */
async function removerProduto(id) {
    if (!confirm("Deseja realmente remover este produto?")) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('api_produtos.php?acao=remover', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log("Resultado da remoção:", result);

        if (result.success) {
            alert("Produto removido com sucesso!");
            await carregarProdutos();
        } else {
            alert("Erro ao remover produto: " + result.message);
        }
    } catch (error) {
        alert("Erro de conexão: " + error.message);
        console.error("Erro ao remover:", error);
    }
}

/* ============================================================
   MOSTRAR OU OCULTAR CADASTRO E LISTA
============================================================ */
function toggleCadastro() {
    const cadastroBox = document.getElementById("cadastroBox");
    const listaProdutos = document.getElementById("listaProdutos");
    
    if (listaProdutos.style.display === "none" || listaProdutos.style.display === "") {
        // Mostrar lista, ocultar cadastro
        cadastroBox.style.display = "none";
        listaProdutos.style.display = "block";
        carregarProdutos();
    } else {
        // Mostrar cadastro, ocultar lista
        cadastroBox.style.display = "block";
        listaProdutos.style.display = "none";
    }
}
</script>

</body>
</html>