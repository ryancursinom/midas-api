package com.example.midas_api.service;

import com.example.midas_api.dto.identidadeVisual.IdentidadeVisualResponse;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.IdentidadeVisualMapper;
import com.example.midas_api.repository.IdentidadeVisualRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IdentidadeVisualService {

    private final IdentidadeVisualRepository identidadeVisualRepository;
    private final IdentidadeVisualMapper identidadeVisualMapper;

    public List<IdentidadeVisualResponse> listarTodas() {
        return identidadeVisualRepository.findAll().stream()
                .map(identidadeVisualMapper::toResponse)
                .toList();
    }

    public IdentidadeVisualResponse buscarPorId(Integer id) {
        return identidadeVisualRepository.findById(id)
                .map(identidadeVisualMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Identidade visual", id));
    }
}
