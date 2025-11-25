<?php
// api_produtos.php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

// Sempre devolver JSON, mesmo em erro
try {
    $conn = conectarBanco();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}

$acao = $_GET['acao'] ?? $_POST['acao'] ?? '';

switch ($acao) {
    case 'listar':
        listarProdutos($conn);
        break;

    case 'adicionar':
        adicionarProduto($conn);
        break;

    case 'remover':
        removerProduto($conn);
        break;

    default:
        echo json_encode([
            'success' => false,
            'message' => 'Ação inválida'
        ]);
        break;
}

fecharBanco($conn);
exit;

/* ==========================
   FUNÇÕES
========================== */

// LISTAR PRODUTOS
function listarProdutos($conn) {
    $sql = "SELECT id, nome, preco, quantidade, descricao, detalhes, categoria
            FROM produtos
            ORDER BY data_cadastro DESC";

    $result   = $conn->query($sql);
    $produtos = [];

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $produto = [
                'id'         => (int) $row['id'],
                'nome'       => $row['nome'],
                'preco'      => (float) $row['preco'],
                'quantidade' => (int) $row['quantidade'],
                'descricao'  => $row['descricao'],
                'detalhes'   => $row['detalhes'],
                'categoria'  => $row['categoria']
            ];

            // Buscar imagens do produto
            $sqlImg  = "SELECT imagem FROM produto_imagens WHERE produto_id = ? ORDER BY ordem";
            $stmtImg = $conn->prepare($sqlImg);
            $stmtImg->bind_param("i", $row['id']);
            $stmtImg->execute();
            $resultImg = $stmtImg->get_result();

            $imagens = [];
            while ($img = $resultImg->fetch_assoc()) {
                $imagens[] = $img['imagem'];
            }
            $stmtImg->close();

            $produto['imagens'] = $imagens;
            $produtos[] = $produto;
        }
    }

    echo json_encode([
        'success'  => true,
        'produtos' => $produtos
    ]);
}

// ADICIONAR PRODUTO
function adicionarProduto($conn) {
    $json_input = file_get_contents('php://input');
    $data = json_decode($json_input, true);

    if (!$data) {
        echo json_encode([
            'success' => false,
            'message' => 'Dados inválidos'
        ]);
        return;
    }

    if (empty($data['nome']) || empty($data['preco']) || empty($data['quantidade'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Preencha todos os campos obrigatórios'
        ]);
        return;
    }

    $nome       = $data['nome'];
    $preco      = (float) $data['preco'];
    $quantidade = (int) $data['quantidade'];
    $descricao  = $data['descricao'] ?? '';
    $detalhes   = $data['detalhes'] ?? '';
    $categoria  = $data['categoria'] ?? 'Sem categoria';
    $imagens    = $data['imagens'] ?? [];

    // Transação
    $conn->begin_transaction();

    try {
        // IMPORTANTE: não vamos usar o ID vindo do JS, deixamos o MySQL gerar
        $sql = "INSERT INTO produtos (nome, preco, quantidade, descricao, detalhes, categoria)
                VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Erro ao preparar consulta de produto");
        }

        $stmt->bind_param("sdisss",
            $nome,
            $preco,
            $quantidade,
            $descricao,
            $detalhes,
            $categoria
        );

        if (!$stmt->execute()) {
            throw new Exception("Erro ao salvar produto");
        }

        // ID gerado automaticamente
        $produtoId = $conn->insert_id;
        $stmt->close();

        // Inserir imagens, se existirem
        if (!empty($imagens) && is_array($imagens)) {
            $sqlImg  = "INSERT INTO produto_imagens (produto_id, imagem, ordem) VALUES (?, ?, ?)";
            $stmtImg = $conn->prepare($sqlImg);

            if (!$stmtImg) {
                throw new Exception("Erro ao preparar consulta de imagens");
            }

            $ordem = 0;
            foreach ($imagens as $imgBase64) {
                $stmtImg->bind_param("isi", $produtoId, $imgBase64, $ordem);
                if (!$stmtImg->execute()) {
                    throw new Exception("Erro ao salvar imagem");
                }
                $ordem++;
            }

            $stmtImg->close();
        }

        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Produto cadastrado com sucesso'
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// REMOVER PRODUTO
function removerProduto($conn) {
    // o JS envia via FormData (POST)
    $id = isset($_POST['id']) ? (int) $_POST['id'] : 0;

    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'ID inválido'
        ]);
        return;
    }

    $sql  = "DELETE FROM produtos WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao preparar remoção'
        ]);
        return;
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Produto removido'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao remover produto'
        ]);
    }

    $stmt->close();
}
