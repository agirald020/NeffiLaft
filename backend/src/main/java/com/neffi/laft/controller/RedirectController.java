package com.neffi.laft.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RedirectController {

    @Value("${app.neffi-trust-url}")
    private String neffiTrustUrl;

    @GetMapping("/neffi-trust-url")
    public ResponseEntity<String> getNeffiTrustUrl() {
        return ResponseEntity
                .ok(neffiTrustUrl);
    }
}
