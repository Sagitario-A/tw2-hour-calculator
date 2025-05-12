// Planificador de Ataques - Tribal Wars 2

// Velocidades base de las unidades en segundos/campo
const unitSpeeds = {
    '1080': 1080, // Lancero
    '1320': 1320, // Espadachín
    '840': 840,   // Guerrero con Hacha o Arquero o Berserker
    '480': 480,   // Caballería Ligera o Arquero Montado o Paladín
    '540': 540,   // Caballería Pesada
    '1440': 1440, // Ariete o Catapulta
    '3000': 3000, // Trebuchet
    '2100': 2100  // Noble
};

/**
 * Calcula la distancia euclidiana entre dos puntos
 * @param {number} x1 - Coordenada X de origen
 * @param {number} y1 - Coordenada Y de origen
 * @param {number} x2 - Coordenada X de destino
 * @param {number} y2 - Coordenada Y de destino
 * @returns {number} - Distancia en número de campos
 */
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calcula el tiempo base de viaje en segundos
 * @param {number} distance - Distancia en campos
 * @param {number} slowestUnitSpeedSeconds - Velocidad de la unidad más lenta en segundos/campo
 * @param {number} worldSpeed - Factor de velocidad del mundo
 * @param {number} unitSpeed - Factor de velocidad de las unidades
 * @returns {number} - Tiempo base de viaje en segundos
 */
function calculateBaseTime(distance, slowestUnitSpeedSeconds, worldSpeed, unitSpeed) {
    return (distance * slowestUnitSpeedSeconds) / (worldSpeed * unitSpeed);
}

/**
 * Calcula el tiempo final de viaje considerando el bonus de disciplina
 * @param {number} baseTimeSeconds - Tiempo base en segundos
 * @param {number} disciplineBonus - Bonus de disciplina (0.00, 0.33, 0.66, 0.99)
 * @returns {number} - Tiempo final en segundos
 */
function calculateFinalTime(baseTimeSeconds, disciplineBonus) {
    return baseTimeSeconds / (1 + parseFloat(disciplineBonus));
}

/**
 * Formatea segundos a formato HH:MM:SS
 * @param {number} totalSeconds - Tiempo total en segundos
 * @returns {string} - Tiempo formateado como HH:MM:SS
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Calcula la hora de envío
 * @param {Date} arrivalTime - Hora de llegada deseada
 * @param {number} travelTimeSeconds - Tiempo de viaje en segundos
 * @returns {Date} - Hora en que se debe enviar el ataque
 */
function calculateSendTime(arrivalTime, travelTimeSeconds) {
    // Crear una nueva fecha para no modificar la original
    const sendTime = new Date(arrivalTime);
    // Restar el tiempo de viaje en milisegundos
    sendTime.setTime(sendTime.getTime() - (travelTimeSeconds * 1000));
    return sendTime;
}

/**
 * Formatea una fecha a string en formato YYYY-MM-DD HH:MM:SS
 * @param {Date} date - Objeto Date
 * @returns {string} - Fecha formateada
 */
function formatDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date)) {
        return '--:--:--';
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM para la configuración global
    const worldSpeedInput = document.getElementById('world-speed');
    const unitSpeedInput = document.getElementById('unit-speed');
    const arrivalTimeInput = document.getElementById('arrival-time');
    const simultaneousCheckbox = document.getElementById('simultaneous-arrival');
    const staggerTimeContainer = document.getElementById('stagger-time-container');
    const staggerTimeInput = document.getElementById('stagger-time');
    
    // Elementos DOM para el pueblo destino
    const targetCoordXInput = document.getElementById('target-coord-x');
    const targetCoordYInput = document.getElementById('target-coord-y');
    
    // Elementos DOM para los pueblos de origen
    const originVillagesContainer = document.getElementById('origin-villages');
    const addOriginButton = document.getElementById('add-origin');
    const originTemplate = document.querySelector('.origin-entry');
    
    // Inicializar Sortable para permitir el drag-and-drop de las filas de origen
    let sortable = null;
    
    /**
     * Inicializa o reinicia la funcionalidad de drag-and-drop
     */
    function initSortable() {
        // Si ya existe una instancia, destrúyela primero
        if (sortable) {
            sortable.destroy();
        }
        
        // Inicializar la nueva instancia de Sortable
        sortable = new Sortable(originVillagesContainer, {
            animation: 150,
            handle: '.drag-handle',  // Solo permite arrastrar desde el icono de arrastre
            draggable: '.origin-entry',  // Solo las filas de origen son arrastrables
            filter: '#add-origin, .origin-entry[style*="display: none"]',  // Excluir el botón y la plantilla
            onEnd: function() {
                // Cuando se completa un reordenamiento, actualizar los cálculos
                updateCalculations();
            }
        });
    }
    
    // Inicialmente, ocultar la plantilla original que servirá como modelo
    // Solo necesitamos ocultarla si hay una plantilla visible al cargar la página
    if (originTemplate) {
        originTemplate.style.display = 'none';
    }

    /**
     * Actualiza todos los cálculos de distancia, tiempo de viaje y hora de envío
     */
    function updateCalculations() {
        // Leer valores de configuración global
        const worldSpeed = parseFloat(worldSpeedInput.value) || 1.0;
        const unitSpeed = parseFloat(unitSpeedInput.value) || 1.0;
        const arrivalTime = arrivalTimeInput.value ? new Date(arrivalTimeInput.value) : null;
        const isSimultaneous = simultaneousCheckbox.checked;
        const staggerTime = parseInt(staggerTimeInput.value) || 5; // Diferencia en segundos
        
        // Leer coordenadas de destino
        const targetX = parseInt(targetCoordXInput.value);
        const targetY = parseInt(targetCoordYInput.value);
        
        // Verificar que tengamos coordenadas de destino válidas
        if (isNaN(targetX) || isNaN(targetY)) {
            return; // No podemos calcular sin coordenadas de destino
        }
        
        // Obtener todas las filas de origen visibles (excluyendo la plantilla)
        const originEntries = document.querySelectorAll('.origin-entry');
        let originArray = [];
        
        // Primera pasada: calcular todos los tiempos de viaje y almacenarlos
        originEntries.forEach((originEntry, index) => {
            // Saltar la plantilla oculta
            if (originEntry.style.display === 'none') return;
            
            // Leer valores de esta fila de origen
            const originX = parseInt(originEntry.querySelector('.origin-coord-x').value);
            const originY = parseInt(originEntry.querySelector('.origin-coord-y').value);
            const slowestUnitSelect = originEntry.querySelector('.slowest-unit');
            const slowestUnitValue = slowestUnitSelect.value;
            const disciplineSelect = originEntry.querySelector('.discipline-level');
            const disciplineBonus = disciplineSelect.value;
            
            // Elementos de salida para esta fila
            const travelTimeOutput = originEntry.querySelector('.travel-time-output');
            const sendTimeOutput = originEntry.querySelector('.send-time-output');
            
            // Verificar que tengamos coordenadas de origen válidas
            if (isNaN(originX) || isNaN(originY)) {
                travelTimeOutput.textContent = '--:--:--';
                sendTimeOutput.textContent = '--:--:--';
                return; // Continuar con la siguiente fila
            }
            
            // Calcular distancia
            const distance = calculateDistance(originX, originY, targetX, targetY);
            
            // Obtener velocidad de la unidad seleccionada
            const unitSpeedSeconds = unitSpeeds[slowestUnitValue];
            
            // Calcular tiempos
            const baseTimeSeconds = calculateBaseTime(distance, unitSpeedSeconds, worldSpeed, unitSpeed);
            const finalTimeSeconds = calculateFinalTime(baseTimeSeconds, disciplineBonus);
            
            // Formatear tiempo de viaje y actualizar en la UI
            travelTimeOutput.textContent = formatTime(finalTimeSeconds);
            
            // Almacenar información para calcular hora de envío
            originArray.push({
                element: originEntry,
                index: index,
                travelTimeSeconds: finalTimeSeconds,
                sendTimeOutput: sendTimeOutput
            });
        });
        
        // Si no hay una hora de llegada definida o no hay orígenes válidos, terminamos
        if (!arrivalTime || originArray.length === 0) {
            originArray.forEach(origin => {
                origin.sendTimeOutput.textContent = '--:--:--';
            });
            return;
        }
        
        // Segunda pasada: calcular hora de envío para cada origen
        if (isSimultaneous) {
            // Modo simultáneo: todos llegan al mismo tiempo
            originArray.forEach(origin => {
                const sendTime = calculateSendTime(arrivalTime, origin.travelTimeSeconds);
                origin.sendTimeOutput.textContent = formatDate(sendTime);
            });
        } else {
            // Modo escalonado: llegan en secuencia según su orden en la lista
            originArray.forEach((origin, index) => {
                // Calcular hora de llegada para este origen: hora base + index * diferencia
                const staggeredArrival = new Date(arrivalTime);
                staggeredArrival.setSeconds(staggeredArrival.getSeconds() + (index * staggerTime));
                
                // Calcular hora de envío
                const sendTime = calculateSendTime(staggeredArrival, origin.travelTimeSeconds);
                origin.sendTimeOutput.textContent = formatDate(sendTime);
            });
        }
    }

    // Función para actualizar la visibilidad del campo "Diferencia entre llegadas"
    function updateStaggerTimeVisibility() {
        // Si el checkbox NO está marcado, mostrar el campo de diferencia
        if (!simultaneousCheckbox.checked) {
            staggerTimeContainer.style.display = 'flex';
        } else {
            staggerTimeContainer.style.display = 'none';
        }
        
        // También actualizar los cálculos cuando cambia este modo
        updateCalculations();
    }

    // Función para añadir un nuevo pueblo de origen
    function addOriginVillage() {
        // Clonar la plantilla
        const newOrigin = originTemplate.cloneNode(true);
        
        // Hacer visible la nueva fila
        newOrigin.style.display = 'block';
        
        // Limpiar los valores de los inputs en la fila clonada
        newOrigin.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            input.value = '';
        });
        
        // Resetear los selects a sus primeras opciones
        newOrigin.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Resetear los valores de salida
        newOrigin.querySelector('.travel-time-output').textContent = '--:--:--';
        newOrigin.querySelector('.send-time-output').textContent = '--:--:--';
        
        // Agregar la nueva fila al contenedor de pueblos de origen
        originVillagesContainer.insertBefore(newOrigin, addOriginButton);
        
        // Reinicializar Sortable después de añadir una nueva fila
        initSortable();
        
        // Actualizar cálculos después de añadir una nueva fila
        updateCalculations();
    }
    
    // Función para eliminar un pueblo de origen
    function deleteOriginVillage(event) {
        // Verificar si el elemento clickeado es un botón de eliminar
        if (event.target.classList.contains('delete-origin')) {
            // Encontrar la fila padre (div.origin-entry) y eliminarla
            const originEntry = event.target.closest('.origin-entry');
            if (originEntry) {
                originEntry.remove();
                // Actualizar cálculos después de eliminar una fila
                updateCalculations();
            }
        }
    }
    
    // Event listeners para la configuración global
    worldSpeedInput.addEventListener('input', updateCalculations);
    unitSpeedInput.addEventListener('input', updateCalculations);
    arrivalTimeInput.addEventListener('change', updateCalculations);
    simultaneousCheckbox.addEventListener('change', updateStaggerTimeVisibility);
    staggerTimeInput.addEventListener('input', updateCalculations);
    
    // Event listeners para el pueblo destino
    targetCoordXInput.addEventListener('input', updateCalculations);
    targetCoordYInput.addEventListener('input', updateCalculations);
    
    // Event listener por delegación para los inputs y selects de las filas de origen
    originVillagesContainer.addEventListener('input', function(event) {
        const target = event.target;
        
        // Verificar si el evento proviene de un input o select dentro de una fila de origen
        if (target.classList.contains('origin-coord-x') || 
            target.classList.contains('origin-coord-y') || 
            target.classList.contains('origin-name') || 
            target.classList.contains('slowest-unit') || 
            target.classList.contains('discipline-level') || 
            target.classList.contains('attack-type')) {
            
            updateCalculations();
        }
    });
    
    // También escuchar el evento "change" para los selects
    originVillagesContainer.addEventListener('change', function(event) {
        const target = event.target;
        
        if (target.tagName === 'SELECT') {
            updateCalculations();
        }
    });
    
    // Verificar el estado inicial del checkbox al cargar la página
    updateStaggerTimeVisibility();
    
    // Agregar event listener al botón "Añadir Origen"
    addOriginButton.addEventListener('click', addOriginVillage);
    
    // Agregar event listener por delegación para los botones "Eliminar"
    originVillagesContainer.addEventListener('click', deleteOriginVillage);
    
    // Añadir un primer pueblo de origen al cargar la página
    addOriginVillage();
    
    // Inicializar Sortable después de que haya al menos una fila
    initSortable();
}); 