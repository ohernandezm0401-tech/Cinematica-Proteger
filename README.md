# Cinematica Proteger

Test de **agudeza visual cinética** de Proteger IPS — clon del protocolo **Test CINETICA** (JARVIS / t207 armas visión).

## Protocolo

| Parámetro | Valor |
|-----------|--------|
| Letras | `E 5 r T P 7 b y 6 M` |
| Ensayos | 10 |
| Velocidad | 2500 ms / 1300 ms |
| Resultado | `correctas > 4` → **NORMAL**, si no **ANORMAL** |
| Campo JARVIS | `t207cinetica` |

## Ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001)

- **Iniciar** — arranca de inmediato (defaults Proteger si no configuró)
- **Configurar** — tamaño de letra y amplitud de barrido (opcional)

```bash
npm test
npm run build && npm start
```

## Impresión

El informe incluye logo Proteger IPS, **fecha de la práctica**, resultado y detalle de ensayos. Sin bloques de firma.

## Licencia

Uso interno Proteger IPS.
