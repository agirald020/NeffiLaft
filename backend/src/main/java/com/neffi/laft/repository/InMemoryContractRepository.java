package com.neffi.laft.repository;

import com.neffi.laft.model.Contract;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryContractRepository {

    private final Map<String, Contract> store = new ConcurrentHashMap<>();

    public Optional<Contract> findByTrustId(String trustId) {
        return store.values().stream()
            .filter(c -> c.getTrustId().equals(trustId))
            .findFirst();
    }

    public Optional<Contract> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Contract save(Contract contract) {
        store.put(contract.getId(), contract);
        return contract;
    }
}
