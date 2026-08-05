# Test CINETICA — Protocolo Proteger

App **independiente** que clona al pie de la letra el **Test CINETICA** de visión de Proteger/JARVIS (examen armas `t207`).

Fuente original:

- `JARVIS/resources/views/t207armasvision.blade.php` → `iniciarCinetica`, `animarLetra`, `cinetica`
- Botón en `JARVIS/resources/views/armas/vision.blade.php`
- Campo resultado: **`t207cinetica`** = `NORMAL` | `ANORMAL`
- PDF: *Agudeza visual cinetica (&lt;=20/60)*

## Protocolo (idéntico a Proteger)

| Parámetro | Valor |
|-----------|--------|
| Letras (orden) | `E 5 r T P 7 b y 6 M` |
| Ensayos | 10 |
| Tamaño | 52px bold |
| Movimiento | Horizontal ±800px (ida/vuelta) |
| Velocidad | 2500 ms; **1300 ms** si `(índice+1) % 3 == 0` o `% 4 == 0` |
| Respuesta | Profesional: correcta / incorrecta |
| Resultado | `correctas > 4` → **NORMAL**, si no **ANORMAL** |

## Ejecutar

```bash
cd avc-app
npm install
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001)

```bash
npm test    # valida letras, velocidades y umbral
npm run build && npm start
```

## Estructura

```
src/lib/protocolo-proteger.ts   # constantes y scoring del protocolo
src/components/TestCinetica.tsx # animación + botones
src/app/page.tsx                # inicio / prueba / resultado
```

No depende de Laravel ni de la base de JARVIS.
