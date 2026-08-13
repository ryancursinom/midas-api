package com.example.midas_api.mapper;

import com.example.midas_api.dto.raridade.RaridadeResponse;
import com.example.midas_api.entity.Raridade;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RaridadeMapper {
    RaridadeResponse toResponse (Raridade raridade);
}
