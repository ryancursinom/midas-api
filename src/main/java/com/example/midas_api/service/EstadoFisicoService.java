package com.example.midas_api.service;

import com.example.midas_api.dto.estadoFisico.EstadoFisicoResponse;
import com.example.midas_api.entity.EstadoFisico;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.EstadoFisicoMapper;
import com.example.midas_api.repository.EstadoFisicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EstadoFisicoService {

    private final EstadoFisicoRepository estadoFisicoRepository;
    private final EstadoFisicoMapper estadoFisicoMapper;

    public List<EstadoFisicoResponse> listarTodas(){
        return estadoFisicoRepository.findAll().stream()
                .map(estadoFisicoMapper::toResponse)
                .toList();
    };

    public EstadoFisicoResponse buscarPorId (Integer id){
        return estadoFisicoMapper.toResponse(buscarEntidadeId(id));
    };

    public EstadoFisico buscarEntidadeId(Integer id){
       return estadoFisicoRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Estado Físico", id));
    };
}