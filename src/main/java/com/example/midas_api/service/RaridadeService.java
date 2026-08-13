package com.example.midas_api.service;

import com.example.midas_api.dto.raridade.RaridadeResponse;
import com.example.midas_api.entity.Raridade;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.RaridadeMapper;
import com.example.midas_api.repository.RaridadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Mesma ideia do CategoriaService: recurso de leitura apenas. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RaridadeService {

    private final RaridadeRepository raridadeRepository;
    private final RaridadeMapper raridadeMapper;

    public List<RaridadeResponse> listarTodas() {
        return raridadeRepository.findAll().stream()
                .map(raridadeMapper::toResponse)
                .toList();
    }

    public RaridadeResponse buscarPorId(Integer id) {
        return raridadeMapper.toResponse(buscarEntidadePorId(id));
    }

    public Raridade buscarEntidadePorId(Integer id) {
        return raridadeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raridade", id));
    }
}