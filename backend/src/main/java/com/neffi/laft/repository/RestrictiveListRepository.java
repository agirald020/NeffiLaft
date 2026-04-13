package com.neffi.laft.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.neffi.laft.model.RestrictiveListEntryMapping;

@Repository
public interface RestrictiveListRepository extends JpaRepository<RestrictiveListEntryMapping, Long>, RestrictiveListRepositoryCustom {

}
