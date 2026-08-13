package com.example.midas_api.service;

import com.example.midas_api.dto.leilao.AtualizarLeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoResponse;
import com.example.midas_api.entity.Leilao;
import com.example.midas_api.entity.Produto;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.StatusProduto;
import com.example.midas_api.entity.enums.TipoCompra;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.LeilaoMapper;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.LanceRepository;
import com.example.midas_api.repository.ProdutoRepository;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeilaoService {

    private final LeilaoRepository leilaoRepository;
    private final LanceRepository lanceRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LeilaoMapper leilaoMapper;

    public LeilaoResponse criar(LeilaoRequest dto, Integer usuarioId) {
        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        Produto produto = buscarProduto(dto.produtoId());
        validarPosse(produto, usuarioId);

        if (produto.getStatus() != StatusProduto.DISPONIVEL) {
            throw new BusinessException("O produto não está disponível para ser colocado em leilão.");
        }
        if (leilaoRepository.existsByProduto_Id(dto.produtoId())) {
            throw new ResourceAlreadyExistsException("Leilão", "produtoId", dto.produtoId());
        }

        validarDatas(dto.dataInicio(), dto.dataFim());
        TipoCompra tipoCompra = dto.tipoCompra() == null ? TipoCompra.LEILAO : dto.tipoCompra();
        validarCompraImediata(tipoCompra, dto.valorCompraImediata());

        Leilao leilao = leilaoMapper.toEntity(dto);
        leilao.setProduto(produto);
        leilao.setStatus(dto.dataInicio().isAfter(LocalDateTime.now()) ? StatusLeilao.AGUARDANDO : StatusLeilao.ATIVO);
        leilao.setTipoCompra(tipoCompra);
        produto.setStatus(StatusProduto.EM_LEILAO);

        try {
            // O flush faz a restrição UNIQUE ser validada aqui, e não somente no commit.
            return leilaoMapper.toResponse(leilaoRepository.saveAndFlush(leilao));
        } catch (DataIntegrityViolationException ex) {
            // A checagem anterior evita o caso normal; este bloco cobre concorrência/reenvio.
            throw new ResourceAlreadyExistsException(
                    "Já existe um leilão vinculado ao produto informado. Atualize a página e selecione outro produto."
            );
        }
    }

    public List<LeilaoResponse> listar(StatusLeilao status) {
        List<Leilao> leiloes = status == null ? leilaoRepository.findAll() : leilaoRepository.findByStatus(status);
        leiloes.forEach(this::sincronizarStatusTemporal);
        return leiloes.stream().map(leilaoMapper::toResponse).toList();
    }

    public LeilaoResponse buscarPorId(Integer id) {
        Leilao leilao = buscarEntidadePorId(id);
        sincronizarStatusTemporal(leilao);
        return leilaoMapper.toResponse(leilao);
    }

    public LeilaoResponse atualizar(Integer id, AtualizarLeilaoRequest dto, Integer usuarioId) {
        Leilao leilao = buscarEntidadePorId(id);
        validarPosse(leilao.getProduto(), usuarioId);

        sincronizarStatusTemporal(leilao);
        validarEdicaoPermitida(leilao);

        LocalDateTime inicio = dto.dataInicio() != null ? dto.dataInicio() : leilao.getDataInicio();
        LocalDateTime fim = dto.dataFim() != null ? dto.dataFim() : leilao.getDataFim();
        TipoCompra tipo = dto.tipoCompra() != null ? dto.tipoCompra() : leilao.getTipoCompra();
        Double compraImediata = dto.valorCompraImediata() != null
                ? dto.valorCompraImediata()
                : (leilao.getValorCompraImediata() == null ? null : leilao.getValorCompraImediata().doubleValue());

        validarDatas(inicio, fim);
        validarCompraImediata(tipo, compraImediata);

        leilaoMapper.toUpdate(dto, leilao);
        leilao.setTipoCompra(tipo);
        leilao.setValorCompraImediata(compraImediata == null ? null : BigDecimal.valueOf(compraImediata));
        leilao.setDataInicio(inicio);
        leilao.setDataFim(fim);
        sincronizarStatusTemporal(leilao);

        return leilaoMapper.toResponse(leilao);
    }

    public LeilaoResponse ativar(Integer id, Integer usuarioId) {
        Leilao leilao = buscarEntidadePorId(id);
        validarPosse(leilao.getProduto(), usuarioId);
        exigirStatus(leilao, StatusLeilao.AGUARDANDO, "O leilão não está aguardando ativação.");

        if (LocalDateTime.now().isBefore(leilao.getDataInicio())) {
            throw new BusinessException("O leilão só pode ser ativado a partir da data de início.");
        }

        leilao.setStatus(StatusLeilao.ATIVO);
        return leilaoMapper.toResponse(leilao);
    }

    public LeilaoResponse finalizar(Integer id, Integer usuarioId) {
        Leilao leilao = buscarEntidadePorId(id);
        validarPosse(leilao.getProduto(), usuarioId);

        if (leilao.getStatus() != StatusLeilao.ATIVO) {
            throw new BusinessException("Somente um leilão ativo pode ser finalizado.");
        }

        leilao.setStatus(StatusLeilao.FINALIZADO);
        return leilaoMapper.toResponse(leilao);
    }

    public LeilaoResponse cancelar(Integer id, Integer usuarioId) {
        Leilao leilao = buscarEntidadePorId(id);
        validarPosse(leilao.getProduto(), usuarioId);

        if (leilao.getStatus() == StatusLeilao.FINALIZADO) {
            throw new BusinessException("Não é possível cancelar um leilão finalizado.");
        }

        leilao.setStatus(StatusLeilao.CANCELADO);
        leilao.getProduto().setStatus(StatusProduto.DISPONIVEL);
        return leilaoMapper.toResponse(leilao);
    }

    public void deletar(Integer id, Integer usuarioId) {
        Leilao leilao = buscarEntidadePorId(id);
        validarPosse(leilao.getProduto(), usuarioId);

        if (leilao.getStatus() == StatusLeilao.ATIVO ||
                leilao.getStatus() == StatusLeilao.FINALIZADO) {
            throw new BusinessException("Não é possível excluir um leilão ativo ou finalizado.");
        }

        leilao.getProduto().setStatus(StatusProduto.DISPONIVEL);
        leilaoRepository.delete(leilao);
    }

    private Leilao buscarEntidadePorId(Integer id) {
        return leilaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leilão", id));
    }

    private Produto buscarProduto(Integer id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    private void validarPosse(Produto produto, Integer usuarioId) {
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para alterar este leilão.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }

    private void validarEdicaoPermitida(Leilao leilao) {
        boolean aguardando = leilao.getStatus() == StatusLeilao.AGUARDANDO;
        boolean ativoSemLances = leilao.getStatus() == StatusLeilao.ATIVO
                && !lanceRepository.existsByLeilao_Id(leilao.getId());

        if (!aguardando && !ativoSemLances) {
            throw new BusinessException(
                    "Só é possível editar um leilão antes do primeiro lance ou antes do início."
            );
        }
    }

    private void exigirStatus(Leilao leilao, StatusLeilao status, String mensagem) {
        if (leilao.getStatus() != status) throw new BusinessException(mensagem);
    }

    private void validarDatas(LocalDateTime inicio, LocalDateTime fim) {
        if (fim == null || inicio == null || !fim.isAfter(inicio)) {
            throw new BusinessException("A data de fim deve ser posterior à data de início.");
        }
    }

    private void validarCompraImediata(TipoCompra tipo, Double valor) {
        boolean exigePreco = tipo == TipoCompra.COMPRA_IMEDIATA || tipo == TipoCompra.AMBOS;
        if (exigePreco && (valor == null || valor <= 0)) {
            throw new BusinessException("O valor de compra imediata é obrigatório para este tipo de leilão.");
        }
        if (!exigePreco && valor != null) {
            throw new BusinessException("Um leilão sem compra imediata não deve possuir valor de compra imediata.");
        }
    }
    private void sincronizarStatusTemporal(Leilao leilao) {
        LocalDateTime agora = LocalDateTime.now();
        if (leilao.getStatus() == StatusLeilao.AGUARDANDO && !agora.isBefore(leilao.getDataInicio())) {
            leilao.setStatus(StatusLeilao.ATIVO);
        }
        if (leilao.getStatus() == StatusLeilao.ATIVO && !agora.isBefore(leilao.getDataFim())) {
            leilao.setStatus(StatusLeilao.FINALIZADO);
        }
    }

}
