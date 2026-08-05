# AVC — Agudeza Visual Cinemática

Aplicación web **independiente** para realizar la prueba de agudeza visual cinemática con **Landolt C en movimiento**.

- No depende de JARVIS ni de Laravel  
- Sin backend: todo corre en el navegador  
- Exporta resultado en JSON / impresión  
- Lista para PWA (manifest + instalación)

## Requisitos

- Node.js 18+ (recomendado 20 o 22)
- npm 9+

## Cómo ejecutar (solo esta carpeta)

```bash
cd avc-app
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige a `/setup`.

### Producción

```bash
cd avc-app
npm run build
npm start
```

### Tests unitarios (geometría y scoring)

```bash
npm test
```

## Flujo de la prueba

1. **Setup** — ojo (OD/OI/AO), distancia (1/2/3/6 m), velocidad, ensayos por nivel  
2. **Calibrar** (opcional) — alinear rectángulo con tarjeta de crédito → PPI  
3. **Test** — Landolt C se mueve; el paciente dice la dirección; el profesional marca en el pad  
4. **Resultado** — logMAR final, equivalente Snellen, % aciertos, export JSON  

## Protocolo v1

| Parámetro | Valor |
|-----------|--------|
| Estímulo | Landolt C, 4 direcciones |
| Trayectoria | Horizontal L→R o R→L |
| Escala | logMAR (pasos 0.1) |
| Pase de nivel | ≥ 80 % aciertos en el bloque |
| Parada | 2 fallos consecutivos de nivel o logMAR mínimo |
| Respuesta | Verbal del paciente; profesional marca |

## Estructura

```
avc-app/
  src/app/           # rutas Next.js (setup, calibrate, test, result)
  src/components/    # UI
  src/lib/           # geometry, scoring, session, motion
  public/            # manifest PWA e iconos
```

## Nota clínica

Herramienta de apoyo al protocolo. La validez del tamaño del optotipo depende de la distancia real del paciente y de la calibración de pantalla. No es un dispositivo médico certificado.
