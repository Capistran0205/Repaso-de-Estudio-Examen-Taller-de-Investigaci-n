# Repaso · Proyecto de estacionamientos ITSX

Aplicación web estática para practicar las preguntas del protocolo de investigación y su metodología.

## Tecnologías

- HTML5
- CSS3
- JavaScript nativo (sin frameworks ni dependencias de ejecución)
- JSON como fuente de los bancos de preguntas

## Estructura

```text
examen-estacionamientos/
├── index.html
├── data/
│   ├── protocolo.json
│   └── metodologia.json
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── quiz.js
│   └── views.js
└── README.md
```

## Ejecutar localmente

Como el navegador carga los JSON mediante `fetch`, abre el proyecto con un servidor HTTP local (no directamente con `file://`).

### Opción 1: Python

Desde esta carpeta ejecuta:

```bash
python -m http.server 8000
```

Después abre <http://localhost:8000>.

### Opción 2: Visual Studio Code

Instala la extensión **Live Server**, haz clic derecho en `index.html` y selecciona **Open with Live Server**.

## Funcionamiento

1. Selecciona Protocolo o Metodología.
2. Elige todo el banco o un capítulo/sección.
3. Contesta una pregunta a la vez.
4. Al seleccionar una opción se muestra la retroalimentación y la explicación.
5. Al finalizar puedes repetir la sesión o iniciar una ronda con las preguntas incorrectas.

Las respuestas y el progreso se mantienen en memoria durante la sesión actual; no se envían a un servidor ni se guardan entre recargas.

## Editar o agregar preguntas

Edita `data/protocolo.json` o `data/metodologia.json`. Cada pregunta contiene:

- `id`: identificador único dentro del banco.
- `enunciado`: texto de la pregunta.
- `opciones`: arreglo de opciones con `id` (`a`, `b`, `c`, `d`) y `texto`.
- `respuestaCorrecta`: identificador de la opción correcta.
- `explicacion`: retroalimentación que se muestra después de contestar.

No es necesario modificar JavaScript para agregar preguntas dentro de una sección existente.
