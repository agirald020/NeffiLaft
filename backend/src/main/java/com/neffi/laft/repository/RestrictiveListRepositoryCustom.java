package com.neffi.laft.repository;

import java.util.List;

import com.neffi.laft.dto.ButValidarListasParams;
import com.neffi.laft.dto.RestrictiveListEntry;

public interface RestrictiveListRepositoryCustom {
    List<RestrictiveListEntry> butValidarListas(ButValidarListasParams params);
}
