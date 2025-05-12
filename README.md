# Planificador de Ataques - Tribal Wars 2

<p align="center">
  <img src="https://i.imgur.com/XqHIaYm.png" alt="Tribal Wars 2 Logo" width="200"/>
</p>

Aplicación web que permite a jugadores de Tribal Wars 2 calcular y coordinar los tiempos de envío de tropas desde múltiples pueblos de origen para que lleguen a un pueblo de destino de forma simultánea o escalonada.

## 🎮 Características

- ⏱️ **Cálculo preciso** de distancias y tiempos de viaje según las unidades del juego
- 🏃‍♂️ Soporte para diferentes **niveles de disciplina** (tecnología de cuartel)
- 🎯 Modos de llegada **simultánea o escalonada**
- 🔄 **Reordenamiento** de ataques mediante drag-and-drop
- ⚡ Actualización de cálculos en **tiempo real**
- 📱 Interfaz **responsive** y fácil de usar
- 💻 No requiere backend, funciona **completamente en el navegador**

## 📋 Cómo utilizar la aplicación

1. **Configuración general**
   - Establece la velocidad del mundo y de las unidades
   - Selecciona la hora de llegada deseada
   - Elige entre modo simultáneo o escalonado

2. **Configuración del objetivo**
   - Introduce las coordenadas del pueblo de destino

3. **Configuración de orígenes**
   - Añade uno o más pueblos de origen
   - Para cada origen, configura:
     - Coordenadas
     - Unidad más lenta que enviará
     - Nivel de tecnología de disciplina
     - Tipo de envío (ataque o apoyo)

4. **Visualización de resultados**
   - La aplicación calculará automáticamente:
     - El tiempo de viaje para cada origen
     - La hora exacta a la que debe enviarse cada ataque

5. **Reordenamiento (modo escalonado)**
   - Arrastra y suelta las filas de origen para cambiar el orden de llegada

## 🧮 Cálculos implementados

### Distancia
```
d = √((x₂ - x₁)² + (y₂ - y₁)²)
```

### Tiempo Base
```
TiempoBase = (Distancia × VelocidadBaseUnidadMásLenta) / (VelocidadMundo × VelocidadUnidades)
```

### Tiempo Final (con bonus de disciplina)
```
TiempoFinal = TiempoBase / (1 + BonusDisciplina)
```

### Hora de Envío
```
HoraEnvío = HoraLlegadaDeseada - TiempoFinal
```

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript (ES6+)
- [SortableJS](https://github.com/SortableJS/Sortable) - Para la funcionalidad de drag-and-drop

## 📥 Instalación

No se requiere instalación. Puedes:

1. **Usar directamente desde GitHub Pages**
   - Visita [https://sagitario-a.github.io/tw2-hour-calculator/](https://sagitario-a.github.io/tw2-hour-calculator/)

2. **Clonar el repositorio y usar localmente**
   ```bash
   git clone https://github.com/Sagitario-A/tw2-hour-calculator.git
   cd tw2-hour-calculator
   # Abre index.html en tu navegador
   ```

3. **Descargar como ZIP**
   - Descarga el ZIP desde la página del repositorio
   - Descomprime y abre index.html en tu navegador

## 📂 Estructura del proyecto

- `index.html` - Estructura y contenido HTML de la aplicación
- `style.css` - Estilos y diseño responsive
- `script.js` - Lógica de la aplicación y cálculos
- `CONTEXT.md` - Documentación completa de los requisitos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 