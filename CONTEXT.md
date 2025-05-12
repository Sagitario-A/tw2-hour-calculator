# CONTEXT.md - Planificador de Ataques para Tribal Wars 2

## 1. Objetivo del Proyecto

Desarrollar una aplicación web interactiva que permita a los usuarios de Tribal Wars 2 calcular y coordinar los tiempos de envío de tropas desde múltiples pueblos de origen para que lleguen a un pueblo de destino de forma simultánea o escalonada, según la configuración del usuario. La aplicación debe realizar cálculos en tiempo real a medida que el usuario modifica los datos.

## 2. Concepto Central: Cálculo de Velocidad y Tiempo de Viaje

El cálculo del tiempo que tardan las tropas en viajar de un punto A a un punto B es la base de esta aplicación. Se compone de los siguientes pasos:

**A. Datos de Unidades Base:**
La velocidad fundamental de cada tipo de unidad se mide en el tiempo que tarda en cruzar un campo (casilla) del mapa. Utiliza la siguiente tabla como referencia (extraída de los archivos proporcionados `image_0b9eb2.png` y `image_0b9ed4.jpg`):

| Unidad              | Icono (Referencia) | Velocidad Base (HH:MM:SS / campo) | Velocidad Base (Segundos / campo) |
| :------------------ | :----------------- | :-------------------------------- | :-------------------------------- |
| Lancero             | `[Icono Lanza]`    | 00:18:00                          | 1080                              |
| Espadachín          | `[Icono Espada]`   | 00:22:00                          | 1320                              |
| Guerrero con Hacha  | `[Icono Hacha]`    | 00:14:00                          | 840                               |
| Arquero             | `[Icono Arco]`     | 00:14:00                          | 840                               |
| Caballería Ligera   | `[Icono Cab. Lig.]`| 00:08:00                          | 480                               |
| Arquero Montado     | `[Icono Arq. Mon.]`| 00:08:00                          | 480                               |
| Caballería Pesada   | `[Icono Cab. Pes.]`| 00:09:00                          | 540                               |
| Ariete              | `[Icono Ariete]`   | 00:24:00                          | 1440                              |
| Catapulta           | `[Icono Catap.]`   | 00:24:00                          | 1440                              |
| Berserker           | `[Icono Berserk.]` | 00:14:00                          | 840                               |
| Trebuchet           | `[Icono Treb.]`    | 00:50:00                          | 3000                              |
| Noble               | `[Icono Noble]`    | 00:35:00                          | 2100                              |
| Paladín             | `[Icono Paladín]`  | 00:08:00                          | 480                               |

*(Nota para la IA: Reemplaza `[Icono ...]` con las imágenes reales si es posible en la UI final, pero para los cálculos, usa los nombres y los segundos/campo)*

**B. Cálculo de Distancia:**
La distancia entre el pueblo de origen $(x_1, y_1)$ y el de destino $(x_2, y_2)$ se calcula usando la distancia euclidiana:
$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$
El resultado $d$ está en número de campos.

**C. Cálculo del Tiempo de Viaje Base:**
Se calcula para cada pueblo de origen individualmente.
$TiempoBase (segundos) = \frac{Distancia (d) \times VelocidadBaseUnidadMasLenta (segundos/campo)}{VelocidadMundo \times VelocidadUnidades}$
   - `VelocidadBaseUnidadMasLenta`: Es la velocidad en segundos/campo de la unidad seleccionada por el usuario como la más lenta para *ese* origen específico.
   - `VelocidadMundo`: Factor numérico (ej: 1, 2, 1.5). Proporcionado por el usuario en la configuración general.
   - `VelocidadUnidades`: Factor numérico (ej: 1, 0.5, 2). Proporcionado por el usuario en la configuración general.

**D. Modificador de Disciplina (Tecnología de Barracones):**
La Disciplina reduce el tiempo de viaje. Se aplica sobre el `TiempoBase`. El usuario seleccionará el nivel de Disciplina para cada pueblo de origen:
   - Nivel 0: Sin bonificación (Bonus = 0.00)
   - Nivel 1 (Cuartel Nv. 7 - Campos de entrenamiento): +33% (Bonus = 0.33)
   - Nivel 2 (Cuartel Nv. 14 - Gran campo): +66% (Bonus = 0.66)
   - Nivel 3 (Cuartel Nv. 23 - Academia militar): +99% (Bonus = 0.99)

La fórmula para el tiempo final es:
$TiempoFinal (segundos) = \frac{TiempoBase (segundos)}{1 + BonusDisciplina}$

**E. Cálculo de la Hora de Envío:**
Esta es la salida principal para el usuario. Se calcula restando el `TiempoFinal` a la `HoraLlegadaDeseada`.
$HoraEnvio = HoraLlegadaDeseada - TiempoFinal$

## 3. Interfaz de Usuario y Flujo de Trabajo

La aplicación debe ser una única página interactiva donde los resultados se actualicen dinámicamente (sin recargar la página) cada vez que el usuario cambie un valor relevante.

**A. Sección de Configuración General:**
   - **Velocidad del Mundo:** Campo numérico (Input type=number, min=0.1, step=0.1 o similar).
   - **Velocidad de Unidades:** Campo numérico (Input type=number, min=0.1, step=0.1 o similar).
   - **Hora de Llegada Deseada:** Campo de entrada de fecha y hora (Input type=datetime-local). Si se deja vacío, la hora de llegada se calculará dinámicamente (ver punto E).
   - **Modo de Llegada:**
      - Checkbox/Selector: "¿Llegar a la vez?" (Simultáneo).
      - Si **NO** está marcado (Modo Escalonado):
         - Mostrar campo: "Diferencia entre llegadas (segundos)": Campo numérico (Input type=number, min=1). Predeterminado a 1 o 5 segundos.
         - La funcionalidad de arrastrar y soltar (drag-and-drop) en la lista de orígenes debe estar activa para definir el orden de llegada.

**B. Sección de Pueblo de Destino:**
   - **Coordenadas Destino:** Campos de texto para X e Y (o un solo campo X|Y con validación).
   - **Nombre Destino (Opcional):** Campo de texto.

**C. Sección de Pueblos de Origen (Lista Dinámica):**
   - Botón "Añadir Origen".
   - Cada elemento de la lista representa un pueblo de origen y debe contener:
      - **Coordenadas Origen:** Campos X e Y (o X|Y).
      - **Nombre Origen (Opcional):** Campo de texto.
      - **Unidad Más Lenta:** Desplegable (Select) poblado con los nombres de las unidades listadas en la tabla del punto 2.A.
      - **Nivel de Disciplina:** Desplegable (Select) con opciones: "Ninguna (0%)", "Nivel 1 (+33%)", "Nivel 2 (+66%)", "Nivel 3 (+99%)".
      - **Tipo:** Desplegable (Select) o botones de opción (Radio buttons) con "Ataque" y "Apoyo". (Nota: Este campo es informativo para el usuario, no afecta el cálculo de tiempo actual).
      - **Salida - Tiempo de Viaje:** Mostrar el `TiempoFinal` calculado (formato HH:MM:SS). (Campo no editable).
      - **Salida - Hora de Envío:** Mostrar la `HoraEnvio` calculada (formato YYYY-MM-DD HH:MM:SS). (Campo no editable).
      - Botón "Eliminar" para quitar ese origen de la lista.
      - (Si Modo Escalonado está activo): Un "handle" o icono para permitir arrastrar y soltar (drag-and-drop) este elemento dentro de la lista.

**D. Lógica de Actualización (Real-time):**
   - Cualquier cambio en Configuración General, Destino, u Orígenes (coordenadas, unidad, disciplina) debe disparar **inmediatamente** el recálculo de:
      1. Distancia (para los orígenes afectados).
      2. TiempoBase (para los orígenes afectados).
      3. TiempoFinal (para los orígenes afectados).
      4. HoraEnvio (para TODOS los orígenes, debido a la dependencia de la Hora de Llegada Deseada / Orden).

**E. Lógica de Hora de Llegada y Envío:**
   - **Si "Hora de Llegada Deseada" está definida:**
      - *Modo Simultáneo:* Todos los `HoraEnvio` se calculan restando el `TiempoFinal` individual de esta hora.
      - *Modo Escalonado:* La `HoraLlegadaDeseada` se aplica al **primer** origen en la lista (según el orden actual). La hora de llegada para el segundo origen es `HoraLlegadaDeseada + Diferencia`, para el tercero es `HoraLlegadaDeseada + 2 * Diferencia`, y así sucesivamente. Luego, se calcula la `HoraEnvio` individual restando el `TiempoFinal` de la hora de llegada calculada para ese origen específico.
   - **Si "Hora de Llegada Deseada" está vacía:**
      - *Modo Simultáneo:* No se puede calcular `HoraEnvio` (mostrar "--:--:--" o similar). El usuario *debe* especificar una hora de llegada.
      - *Modo Escalonado:* Se toma el `TiempoFinal` más largo de *todos* los orígenes como referencia. La `HoraEnvio` del origen con el viaje más largo se establece a la hora actual o una hora de referencia simple (ej. ahora + 5 minutos). La hora de llegada *implícita* de este primer ataque se calcula (HoraEnvio + TiempoFinal). Las horas de llegada de los demás se calculan sumando la `Diferencia` según su orden en la lista. Finalmente, se calculan sus `HoraEnvio` individuales. *(Alternativa más simple si es complejo: requerir siempre la Hora de Llegada Deseada)*. -> **IA, implementa la versión más simple primero: requiere siempre Hora de Llegada Deseada.**

**F. Orden en Modo Escalonado:**
   - El orden visual de los pueblos de origen en la lista (gestionado por drag-and-drop) determina el orden de llegada cuando el modo "Llegar a la vez" está desactivado. El primero en la lista llega primero, el segundo llega `Diferencia` segundos después, etc.

## 4. Tecnología Sugerida

- Frontend: HTML, CSS, JavaScript (Vanilla JS o un framework ligero como Vue.js, React, Svelte si facilita la reactividad).
- No se requiere backend complejo, los cálculos se pueden realizar en el lado del cliente (JavaScript).

## 5. Directrices para el Desarrollo por IA (Cursor)

1.  **Implementación Incremental:** Realiza los cambios paso a paso. Implementa una funcionalidad pequeña o un ajuste a la vez.
2.  **Verificación Constante:** Después de cada cambio, asegúrate de que la funcionalidad implementada funciona como se espera y no ha roto ninguna funcionalidad existente. Describe brevemente qué has hecho y cómo lo has comprobado.
3.  **Adherencia Estricta:** Sigue **exactamente** las especificaciones descritas en este documento. No añadas funcionalidades no solicitadas ni cambies la lógica fundamental sin consultar.
4.  **No Improvisar:** Si encuentras ambigüedad o falta de información, pregunta antes de asumir o implementar una solución propia no descrita aquí.
5.  **Propuestas de Mejora:** Si identificas posibles mejoras o funcionalidades adicionales que no están en este documento, **no las implementes directamente**. En lugar de eso, descríbelas claramente y espera la aprobación explícita del usuario antes de proceder.
6.  **Priorizar Funcionalidad Central:** Asegúrate de que los cálculos de distancia, tiempo de viaje (base y con disciplina) y hora de envío sean correctos antes de centrarte en elementos de UI más complejos como el drag-and-drop.