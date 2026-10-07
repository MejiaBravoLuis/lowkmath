# lowkmath

Calculadora de contraseñas para el proyecto final de Matemática Discreta (Opción 2, Parte 18).
React + TypeScript + Tailwind v4 + Vite. Sin backend: todo corre en el navegador.

```bash
npm install
npm run dev        # servidor local
npm test           # verifica el motor contra fuerza bruta y los valores del proyecto
npm run build      # typecheck + build estático en dist/
```

## Estructura

- `src/engine/count.ts`: motor de conteo (BigInt): regla del producto, permutaciones, inclusión–exclusión y restricciones de posición.
- `src/engine/explain.ts`: genera el procedimiento (opciones, principio, fórmula, sustitución, resultado, interpretación).
- `src/engine/presets.ts`: escenarios y tablas de las Partes 1–16.
- `src/engine/verify.ts`: pruebas (`npm test`).
