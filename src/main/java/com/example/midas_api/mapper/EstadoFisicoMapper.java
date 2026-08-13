package com.example.midas_api.mapper;

import com.example.midas_api.dto.estadoFisico.EstadoFisicoResponse;
import com.example.midas_api.entity.EstadoFisico;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EstadoFisicoMapper {

    EstadoFisicoResponse toResponse (EstadoFisico estadoFisico);
}