# C:\WORKSPACE\prueba-themes\Dockerfile
FROM quay.io/keycloak/keycloak:26.5.4

# Copia los temas del contexto de build a la imagen
COPY themes /opt/keycloak/themes

# Usar entrypoint del binario y arrancar en dev (útil para ver cambios en templates)
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--spi-theme-cache-themes=false", "--spi-theme-cache-templates=false"]