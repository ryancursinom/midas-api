package com.example.midas_api.service;

import com.example.midas_api.dto.produtoLoja.ProdutoLojaRequest;
import com.example.midas_api.dto.produtoLoja.ProdutoLojaResponse;
import com.example.midas_api.entity.ProdutoLoja;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.ProdutoLojaMapper;
import com.example.midas_api.repository.ProdutoLojaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoLojaService {

    private final ProdutoLojaRepository repository;
    private final ProdutoLojaMapper mapper;

    @Transactional(readOnly = true)
    public List<ProdutoLojaResponse> listar() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoLojaResponse buscar(Integer id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    public ProdutoLojaResponse criar(ProdutoLojaRequest dto) {
        if (repository.existsByNome(dto.nome())) {
            throw new ResourceAlreadyExistsException("Produto da loja", "nome", dto.nome());
        }
        return mapper.toResponse(repository.save(mapper.toEntity(dto)));
    }

    public ProdutoLojaResponse atualizar(Integer id, ProdutoLojaRequest dto) {
        ProdutoLoja produto = buscarEntidade(id);
        if (!produto.getNome().equals(dto.nome()) && repository.existsByNome(dto.nome())) {
            throw new ResourceAlreadyExistsException("Produto da loja", "nome", dto.nome());
        }
        produto.setNome(dto.nome());
        produto.setPreco(BigDecimal.valueOf(dto.preco()));
        produto.setDescricao(dto.descricao());
        return mapper.toResponse(produto);
    }

    private ProdutoLoja buscarEntidade(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto da loja", id));
    }
}
