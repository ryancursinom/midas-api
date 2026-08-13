package com.example.midas_api.service;

import com.example.midas_api.dto.produto.AtualizarProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.entity.Produto;
import com.example.midas_api.entity.ProdutoImagem;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.entity.enums.StatusProduto;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.ProdutoMapper;
import com.example.midas_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final EstadoFisicoRepository estadoFisicoRepository;
    private final RaridadeRepository raridadeRepository;
    private final LeilaoRepository leilaoRepository;
    private final LanceRepository lanceRepository;
    private final ProdutoImagemRepository produtoImagemRepository;
    private final CloudinaryService cloudinaryService;
    private final ProdutoMapper produtoMapper;

    public ProdutoResponse criar(ProdutoRequest dto, Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        Produto produto = produtoMapper.toEntity(dto);
        produto.setUsuario(usuario);
        produto.setCategoria(categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", dto.categoriaId())));
        produto.setEstadoFisico(estadoFisicoRepository.findById(dto.estadoFisicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Estado físico", dto.estadoFisicoId())));
        produto.setRaridade(raridadeRepository.findById(dto.raridadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Raridade", dto.raridadeId())));
        produto.setStatus(StatusProduto.DISPONIVEL);

        return produtoMapper.toResponse(produtoRepository.save(produto));
    }

    public ProdutoResponse adicionarImagem(Integer produtoId, MultipartFile file, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(produtoId);
        validarPosse(produto, usuarioId);
        validarArquivoImagem(file);

        String url = cloudinaryService.uploadImage(file);
        if (produto.getImagens() == null) produto.setImagens(new ArrayList<>());

        ProdutoImagem imagem = ProdutoImagem.builder()
                .produto(produto)
                .url(url)
                .ordem(produto.getImagens().size())
                .build();

        produtoImagemRepository.save(imagem);
        produto.getImagens().add(imagem);

        return produtoMapper.toResponse(produto);
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Integer id) {
        return produtoMapper.toResponse(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarDisponiveis() {
        return produtoRepository.findByStatus(StatusProduto.DISPONIVEL).stream()
                .map(produtoMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarPorUsuario(Integer usuarioId) {
        return produtoRepository.findByUsuario_Id(usuarioId).stream()
                .map(produtoMapper::toResponse).toList();
    }

    public ProdutoResponse atualizar(Integer id, AtualizarProdutoRequest dto, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(id);
        validarPosse(produto, usuarioId);

        if (produto.getStatus() == StatusProduto.EM_LEILAO) {
            var leilao = leilaoRepository.findByProduto_Id(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Leilão do produto", id));
            boolean aguardando = leilao.getStatus() == com.example.midas_api.entity.enums.StatusLeilao.AGUARDANDO;
            boolean ativoSemLances = leilao.getStatus() == com.example.midas_api.entity.enums.StatusLeilao.ATIVO
                    && !lanceRepository.existsByLeilao_Id(leilao.getId());

            if (!aguardando && !ativoSemLances) {
                throw new BusinessException("Só é possível editar o produto antes do primeiro lance ou antes do início do leilão.");
            }
        }

        produtoMapper.toUpdate(dto, produto);

        if (dto.categoria() != null) {
            produto.setCategoria(categoriaRepository.findById(dto.categoria())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria", dto.categoria())));
        }
        if (dto.estadoFisico() != null) {
            produto.setEstadoFisico(estadoFisicoRepository.findById(dto.estadoFisico())
                    .orElseThrow(() -> new ResourceNotFoundException("Estado físico", dto.estadoFisico())));
        }
        if (dto.raridade() != null) {
            produto.setRaridade(raridadeRepository.findById(dto.raridade())
                    .orElseThrow(() -> new ResourceNotFoundException("Raridade", dto.raridade())));
        }


        return produtoMapper.toResponse(produtoRepository.save(produto));
    }

    public void deletar(Integer id, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(id);
        validarPosse(produto, usuarioId);

        if (leilaoRepository.existsByProduto_Id(id)) {
            throw new BusinessException("Não é possível excluir um produto vinculado a um leilão.");
        }

        produtoRepository.delete(produto);
    }

    private Produto buscarEntidadePorId(Integer id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    private void validarPosse(Produto produto, Integer usuarioId) {
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para alterar este produto.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }
    private void validarArquivoImagem(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Selecione uma imagem para enviar.");
        }
        String tipo = file.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            throw new BusinessException("O arquivo enviado precisa ser uma imagem.");
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new BusinessException("A imagem deve ter no máximo 5 MB.");
        }
    }

}
